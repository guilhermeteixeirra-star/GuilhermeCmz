// Missão Redação — toda a lógica da API.
// Módulo puro: nada de rede ou disco aqui. O armazenamento (store), o relógio (now)
// e o gerador de bytes aleatórios (randomBytes) são injetados, para os testes
// conseguirem controlar o tempo (bloqueios, validade dos tokens).

import * as nodeCrypto from "node:crypto";

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

export const LIMITE_CORPO = 300 * 1024; // corpo da requisição (bytes)
export const LIMITE_ESTADO = 250 * 1024; // estado do jogo serializado (bytes)
export const LIMITE_PARAGRAFO = 4000; // caracteres por parágrafo
export const MAX_FALHAS_ALUNO = 5;
export const MAX_FALHAS_PROFESSOR = 10;
export const BLOQUEIO_MS = 15 * 60 * 1000;
export const VALIDADE_TOKEN_PROFESSOR_MS = 7 * 24 * 60 * 60 * 1000;
export const ID_RE = /^[a-z0-9-]+\/[a-z0-9-]+$/;

// Hash da senha inicial do professor (a senha em texto não fica no código).
// Só vale enquanto config/professor não existir.
const SETUP = {
  salt: "d4e9a7b0413a23551f76878b8b363751",
  hash: "552349a7ebb8dac42f7675408fb607ca77de322ebf29dfd80d6620b1f96402ff",
};

const SCRYPT = { N: 16384, r: 8, p: 1 };

const CHAVE_SEGREDO = "config/segredo";
const CHAVE_PROFESSOR = "config/professor";
const CHAVE_PROFESSOR_FALHAS = "config/professor-falhas";
const PREFIXO_ALUNOS = "alunos/";
const CHAVE_ALUNO_RE = /^alunos\/[a-z0-9-]+\/[a-z0-9-]+$/;

const MSG = {
  rota: "Endereço não encontrado.",
  metodo: "Método não permitido.",
  json: "Não deu para ler os dados enviados. Tente de novo.",
  grande: "Os dados são grandes demais para salvar.",
  nome: "Escreva seu nome e sobrenome.",
  turma: "Escreva a sua turma. Exemplo: 2º B.",
  pin: "A senha tem que ter 4 números.",
  senhaAluno:
    "Senha errada. Confira os 4 números. Se você esqueceu, peça ao professor para apagar a sua senha. " +
    "Se tem outro aluno com o mesmo nome, escreva também o seu segundo sobrenome.",
  sessaoAluno: "Sua entrada expirou. Entre de novo com seu nome e senha.",
  sessaoProfessor: "Sua entrada expirou. Entre de novo com a senha do professor.",
  senhaProfessor: "Senha errada.",
  senhaVazia: "Escreva a senha.",
  senhaAtual: "A senha atual está errada.",
  senhaNova: "A senha nova precisa ter de 6 a 60 caracteres.",
  estado: "Os dados do jogo vieram com problema. Tente de novo.",
  aluno: "Aluno não encontrado.",
  id: "Aluno inválido.",
  corrida: "Não deu para entrar agora. Tente de novo.",
  interno: "Deu um erro no servidor. Tente de novo daqui a pouco.",
};

// ---------------------------------------------------------------------------
// Normalização (exportada para os testes e para quem precisar)
// ---------------------------------------------------------------------------

function semAcentos(s) {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

function limparEspacos(s) {
  return s
    .replace(/\s+/g, " ")
    .replace(/[\p{Cc}\p{Cf}]/gu, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

function cortar(s, max) {
  const chars = Array.from(s);
  return chars.length > max ? chars.slice(0, max).join("").trim() : s;
}

/** Nome exibido + nomeKey ([a-z0-9-]). Exige nome e sobrenome. Retorna null se inválido. */
export function normalizarNome(valor) {
  if (typeof valor !== "string") return null;
  const nome = cortar(limparEspacos(valor.normalize("NFC")), 60);
  const palavrasComLetras = nome
    .split(" ")
    .filter((p) => /[a-z]/.test(semAcentos(p.toLowerCase())));
  if (palavrasComLetras.length < 2) return null;
  const nomeKey = semAcentos(nome.toLowerCase())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!nomeKey) return null;
  return { nome, nomeKey };
}

const PALAVRAS_TURMA = /serie|ano|turma/g;

/**
 * Turma exibida + turmaKey ([a-z0-9]). "2º B", "2 b", "2ª série B", "2B" → "2b".
 * Também entende "2a série B" / "2o ano B" (a/o digitados no lugar de ª/º) → "2b".
 * Retorna null se a chave ficar vazia.
 */
export function normalizarTurma(valor) {
  if (typeof valor !== "string") return null;
  const turma = cortar(limparEspacos(valor.normalize("NFC")), 20);
  const base = semAcentos(turma.toLowerCase().replace(/[ºª°]/g, " "));
  let partes = base
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((p) => (/\d/.test(p) ? p.replace(PALAVRAS_TURMA, "") : p))
    .filter((p) => p && p !== "serie" && p !== "ano" && p !== "turma");
  if (partes.length >= 2 && /^\d+[ao]$/.test(partes[0])) {
    partes = [partes[0].slice(0, -1), ...partes.slice(1)];
  }
  const turmaKey = partes.join("").replace(/[^a-z0-9]/g, "");
  if (!turmaKey) return null;
  return { turma, turmaKey };
}

/** PIN: exatamente 4 dígitos. Retorna a string ou null. */
export function normalizarPin(valor) {
  const pin = typeof valor === "string" ? valor.trim() : typeof valor === "number" ? String(valor) : "";
  return /^[0-9]{4}$/.test(pin) ? pin : null;
}

export function idValido(id) {
  return typeof id === "string" && id.length <= 120 && ID_RE.test(id);
}

// ---------------------------------------------------------------------------
// Criptografia
// ---------------------------------------------------------------------------

function scryptHex(texto, saltHex) {
  return new Promise((resolve, reject) => {
    nodeCrypto.scrypt(texto, saltHex, 32, SCRYPT, (err, buf) => (err ? reject(err) : resolve(buf.toString("hex"))));
  });
}

function hmacHex(segredo, msg) {
  return nodeCrypto.createHmac("sha256", segredo).update(msg).digest("hex");
}

function igualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (!/^[0-9a-f]+$/.test(a) || !/^[0-9a-f]+$/.test(b) || a.length !== b.length || a.length % 2) return false;
  return nodeCrypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}

const b64url = (s) => Buffer.from(s, "utf8").toString("base64url");

// ---------------------------------------------------------------------------
// Sanitização do que o jogo manda salvar
// ---------------------------------------------------------------------------

function objetoSimples(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function parasVazios() {
  return ["", "", "", ""];
}

function sanitizarParas(lista) {
  const out = parasVazios();
  for (let i = 0; i < 4; i++) {
    const p = lista[i];
    out[i] = typeof p === "string" ? (p.length > LIMITE_PARAGRAFO ? p.slice(0, LIMITE_PARAGRAFO) : p) : "";
  }
  return out;
}

function parasDe(reg) {
  return Array.isArray(reg?.paras) ? sanitizarParas(reg.paras) : parasVazios();
}

function inteiro(v, max) {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return 0;
  return Math.min(max, Math.max(0, Math.round(n)));
}

function numeroOuTexto(v, maxLen, padrao) {
  if (typeof v === "number" && Number.isFinite(v)) return Math.min(1e9, Math.max(-1e9, v));
  if (typeof v === "string") return cortar(limparEspacos(v), maxLen);
  return padrao;
}

function resumoVazio() {
  return { fases: 0, xp: 0, nivel: 0, linhas: 0, etapa: "" };
}

function sanitizarResumo(r) {
  return {
    fases: inteiro(r.fases, 99),
    xp: inteiro(r.xp, 1e9),
    nivel: numeroOuTexto(r.nivel, 40, 0),
    linhas: inteiro(r.linhas, 100000),
    etapa: numeroOuTexto(r.etapa, 80, ""),
  };
}

function resumoAluno(chave, reg, agora) {
  const r = objetoSimples(reg.resumo) ? sanitizarResumo(reg.resumo) : resumoVazio();
  const paras = parasDe(reg);
  return {
    id: chave.slice(PREFIXO_ALUNOS.length),
    nome: reg.nome,
    turma: reg.turma,
    turmaKey: reg.turmaKey,
    fases: r.fases,
    xp: r.xp,
    nivel: r.nivel,
    linhas: r.linhas,
    etapa: r.etapa,
    concluiu: r.fases >= 7,
    temRedacao: paras.some((p) => p.trim() !== ""),
    semSenha: reg.pinHash === null,
    bloqueado: (Number(reg.bloqueadoAte) || 0) > agora,
    criadoEm: reg.criadoEm ?? null,
    atualizadoEm: reg.atualizadoEm ?? null,
  };
}

// ---------------------------------------------------------------------------
// Respostas
// ---------------------------------------------------------------------------

const CABECALHOS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(status, corpo, extras) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CABECALHOS, ...extras } });
}

function ok(dados = {}) {
  return json(200, { ok: true, ...dados });
}

function erro(status, codigo, msg, dados = {}, extras) {
  return json(status, { ok: false, erro: codigo, msg: msg ?? MSG[codigo] ?? MSG.interno, ...dados }, extras);
}

function minutosRestantes(ate, agora) {
  return Math.max(1, Math.ceil((ate - agora) / 60000));
}

function textoMinutos(n) {
  return `${n} ${n === 1 ? "minuto" : "minutos"}`;
}

function bloqueadoAluno(minutos) {
  return erro(429, "bloqueado", `Muitas tentativas erradas. Espere ${textoMinutos(minutos)} ou peça ajuda ao professor.`, {
    minutos,
  });
}

function bloqueadoProfessor(minutos) {
  return erro(429, "bloqueado", `Muitas tentativas erradas. Espere ${textoMinutos(minutos)}.`, { minutos });
}

class ErroCorpo extends Error {
  constructor(resposta) {
    super("corpo");
    this.resposta = resposta;
  }
}

async function lerCorpoJson(req) {
  const tamanho = Number(req.headers.get("content-length"));
  if (Number.isFinite(tamanho) && tamanho > LIMITE_CORPO) throw new ErroCorpo(erro(413, "grande"));
  let texto = "";
  if (req.body) {
    const leitor = req.body.getReader();
    const pedacos = [];
    let total = 0;
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      total += value.byteLength;
      if (total > LIMITE_CORPO) {
        try {
          await leitor.cancel();
        } catch {
          /* ignorar */
        }
        throw new ErroCorpo(erro(413, "grande"));
      }
      pedacos.push(value);
    }
    texto = Buffer.concat(pedacos.map((p) => Buffer.from(p.buffer, p.byteOffset, p.byteLength))).toString("utf8");
  }
  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1);
  let dados;
  try {
    dados = JSON.parse(texto);
  } catch {
    throw new ErroCorpo(erro(400, "json"));
  }
  if (!objetoSimples(dados)) throw new ErroCorpo(erro(400, "json"));
  return dados;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

/**
 * createApi({store, now, randomBytes}) → async (req: Request) => Response
 * store: {get(key), set(key, obj, {onlyIfNew}), del(key), list(prefix)}
 */
export function createApi({ store, now = () => Date.now(), randomBytes = nodeCrypto.randomBytes } = {}) {
  if (!store) throw new Error("createApi: store é obrigatório");

  let segredoCache = null;

  async function segredo() {
    if (segredoCache) return segredoCache;
    const valido = (s) => objetoSimples(s) && typeof s.valor === "string" && /^[0-9a-f]{64}$/.test(s.valor);
    let s = await store.get(CHAVE_SEGREDO);
    if (!s) {
      await store.set(CHAVE_SEGREDO, { valor: Buffer.from(randomBytes(32)).toString("hex") }, { onlyIfNew: true });
      s = await store.get(CHAVE_SEGREDO); // relê: se outra requisição criou antes, vale a dela
    }
    if (!valido(s)) throw new Error("config/segredo ausente ou inválido");
    segredoCache = s.valor;
    return segredoCache;
  }

  const novoSalt = () => Buffer.from(randomBytes(16)).toString("hex");

  // Relê o registro logo antes de gravar, para não desfazer gravações de outras
  // requisições (ex.: o jogo salvando enquanto alguém erra a senha em outro celular).
  async function atualizar(chave, mudar) {
    const atual = await store.get(chave);
    if (!objetoSimples(atual)) return null;
    const novo = mudar(atual);
    if (!novo) return null;
    await store.set(chave, novo);
    return novo;
  }

  // ---- tokens -------------------------------------------------------------

  async function tokenAluno(id, versao) {
    const seg = await segredo();
    return `${b64url(id)}.${versao}.${hmacHex(seg, `a|${id}|${versao}`)}`;
  }

  async function lerTokenAluno(token) {
    if (typeof token !== "string" || token.length > 400) return null;
    const partes = token.split(".");
    if (partes.length !== 3) return null;
    const [idB64, versaoTxt, assinatura] = partes;
    if (!/^[A-Za-z0-9_-]+$/.test(idB64) || !/^[0-9]{1,9}$/.test(versaoTxt) || !/^[0-9a-f]{64}$/.test(assinatura)) {
      return null;
    }
    const id = Buffer.from(idB64, "base64url").toString("utf8");
    if (!idValido(id) || b64url(id) !== idB64) return null;
    const seg = await segredo();
    if (!igualHex(assinatura, hmacHex(seg, `a|${id}|${versaoTxt}`))) return null;
    return { id, versao: Number(versaoTxt), chave: PREFIXO_ALUNOS + id };
  }

  async function versaoProfessor() {
    const prof = await store.get(CHAVE_PROFESSOR);
    return objetoSimples(prof) && Number.isInteger(prof.versao) ? prof.versao : 0;
  }

  async function tokenProfessor(versao) {
    const seg = await segredo();
    const expiraEm = now() + VALIDADE_TOKEN_PROFESSOR_MS;
    return `p.${expiraEm}.${versao}.${hmacHex(seg, `p|${expiraEm}|${versao}`)}`;
  }

  async function professorAutenticado(req) {
    const cab = (req.headers.get("authorization") || "").trim();
    const m = /^Bearer\s+(\S+)$/i.exec(cab);
    if (!m || m[1].length > 200) return false;
    const partes = m[1].split(".");
    if (partes.length !== 4 || partes[0] !== "p") return false;
    const [, expiraTxt, versaoTxt, assinatura] = partes;
    if (!/^[0-9]{1,16}$/.test(expiraTxt) || !/^[0-9]{1,9}$/.test(versaoTxt) || !/^[0-9a-f]{64}$/.test(assinatura)) {
      return false;
    }
    const seg = await segredo();
    if (!igualHex(assinatura, hmacHex(seg, `p|${expiraTxt}|${versaoTxt}`))) return false;
    if (Number(expiraTxt) <= now()) return false;
    return Number(versaoTxt) === (await versaoProfessor());
  }

  async function senhaProfessorConfere(senha) {
    const prof = await store.get(CHAVE_PROFESSOR);
    const ref = objetoSimples(prof) && typeof prof.salt === "string" && typeof prof.hash === "string" ? prof : SETUP;
    if (typeof senha !== "string" || !senha || senha.length > 200) return false;
    return igualHex(await scryptHex(senha, ref.salt), ref.hash);
  }

  // ---- rotas do aluno -----------------------------------------------------

  async function respostaEntrada(id, reg, extra = {}) {
    return ok({
      novo: false,
      ...extra,
      token: await tokenAluno(id, Number(reg.pinVersao) || 0),
      aluno: { id, nome: reg.nome, turma: reg.turma },
      estado: reg.estado ?? null,
      atualizadoEm: reg.atualizadoEm ?? null,
    });
  }

  async function entrar({ corpo }) {
    const n = normalizarNome(corpo.nome);
    if (!n) return erro(400, "nome");
    const t = normalizarTurma(corpo.turma);
    if (!t) return erro(400, "turma");
    const pin = normalizarPin(corpo.pin);
    if (!pin) return erro(400, "pin");

    const id = `${t.turmaKey}/${n.nomeKey}`;
    const chave = PREFIXO_ALUNOS + id;
    let reg = await store.get(chave);

    if (!reg) {
      const agora = now();
      const pinSalt = novoSalt();
      const novo = {
        id,
        nome: n.nome,
        turma: t.turma,
        turmaKey: t.turmaKey,
        nomeKey: n.nomeKey,
        pinSalt,
        pinHash: await scryptHex(pin, pinSalt),
        pinVersao: 1,
        falhas: 0,
        bloqueadoAte: 0,
        estado: null,
        paras: parasVazios(),
        resumo: resumoVazio(),
        criadoEm: agora,
        atualizadoEm: agora,
      };
      const r = await store.set(chave, novo, { onlyIfNew: true });
      if (r && r.modified) {
        return ok({
          novo: true,
          token: await tokenAluno(id, novo.pinVersao),
          aluno: { id, nome: novo.nome, turma: novo.turma },
          estado: null,
          atualizadoEm: null,
        });
      }
      // Perdeu a corrida (outro celular criou ao mesmo tempo): segue como registro existente.
      reg = await store.get(chave);
      if (!reg) return erro(503, "corrida");
    }

    const agora = now();
    const bloqueadoAte = Number(reg.bloqueadoAte) || 0;
    if (bloqueadoAte > agora) return bloqueadoAluno(minutosRestantes(bloqueadoAte, agora));

    if (reg.pinHash === null) {
      // O professor apagou a senha: o aluno cria uma nova agora. O progresso continua.
      const pinSalt = novoSalt();
      const pinHash = await scryptHex(pin, pinSalt);
      const atual = await atualizar(chave, (r) => {
        if (r.pinHash !== null) return null; // outra requisição (ex.: toque duplo) já criou a senha nova
        return { ...r, pinSalt, pinHash, pinVersao: (Number(r.pinVersao) || 0) + 1, falhas: 0, bloqueadoAte: 0 };
      });
      if (atual) return respostaEntrada(id, atual, { senhaNova: true });
      // Perdeu a corrida: confere o PIN contra a senha que acabou de ser criada.
      reg = await store.get(chave);
      if (!objetoSimples(reg) || reg.pinHash === null) return erro(503, "corrida");
    }

    const confere = igualHex(await scryptHex(pin, String(reg.pinSalt)), reg.pinHash);
    if (confere) {
      if ((Number(reg.falhas) || 0) !== 0 || bloqueadoAte !== 0) {
        const atual = await atualizar(chave, (r) => ({ ...r, falhas: 0, bloqueadoAte: 0 }));
        if (atual) reg = atual;
      }
      return respostaEntrada(id, reg);
    }

    let bloqueou = false;
    let restantes = MAX_FALHAS_ALUNO;
    await atualizar(chave, (r) => {
      const falhas = (Number(r.falhas) || 0) + 1;
      if (falhas >= MAX_FALHAS_ALUNO) {
        bloqueou = true;
        return { ...r, falhas: 0, bloqueadoAte: agora + BLOQUEIO_MS };
      }
      restantes = MAX_FALHAS_ALUNO - falhas;
      return { ...r, falhas };
    });
    if (bloqueou) return bloqueadoAluno(minutosRestantes(agora + BLOQUEIO_MS, agora));
    return erro(401, "senha", MSG.senhaAluno, { restantes });
  }

  async function alunoDoToken(token) {
    const tk = await lerTokenAluno(token);
    if (!tk) return null;
    const reg = await store.get(tk.chave);
    if (!objetoSimples(reg) || Number(reg.pinVersao) !== tk.versao) return null;
    return { tk, reg };
  }

  async function estado({ corpo }) {
    const achado = await alunoDoToken(corpo.token);
    if (!achado) return erro(401, "sessao", MSG.sessaoAluno);
    const { reg } = achado;
    return ok({ estado: reg.estado ?? null, paras: parasDe(reg), atualizadoEm: reg.atualizadoEm ?? null });
  }

  async function salvar({ corpo }) {
    const tk = await lerTokenAluno(corpo.token);
    if (!tk) return erro(401, "sessao", MSG.sessaoAluno);
    if (!objetoSimples(corpo.estado)) return erro(400, "estado");
    if (Buffer.byteLength(JSON.stringify(corpo.estado), "utf8") > LIMITE_ESTADO) return erro(413, "grande");
    const paras = Array.isArray(corpo.paras) ? sanitizarParas(corpo.paras) : null;
    const resumo = objetoSimples(corpo.resumo) ? sanitizarResumo(corpo.resumo) : null;
    const agora = now();
    const gravado = await atualizar(tk.chave, (r) => {
      if (Number(r.pinVersao) !== tk.versao) return null;
      const novo = { ...r, estado: corpo.estado, atualizadoEm: agora };
      if (paras) novo.paras = paras;
      if (resumo) novo.resumo = resumo;
      return novo;
    });
    if (!gravado) return erro(401, "sessao", MSG.sessaoAluno);
    return ok({ atualizadoEm: agora });
  }

  // ---- rotas do professor -------------------------------------------------

  async function professorEntrar({ corpo }) {
    const agora = now();
    const f = await store.get(CHAVE_PROFESSOR_FALHAS);
    const falhas = objetoSimples(f) ? Number(f.falhas) || 0 : 0;
    const bloqueadoAte = objetoSimples(f) ? Number(f.bloqueadoAte) || 0 : 0;
    if (bloqueadoAte > agora) return bloqueadoProfessor(minutosRestantes(bloqueadoAte, agora));

    const senha = typeof corpo.senha === "string" ? corpo.senha.trim() : "";
    if (!senha) return erro(400, "senha", MSG.senhaVazia);

    if (await senhaProfessorConfere(senha)) {
      if (falhas !== 0 || bloqueadoAte !== 0) await store.set(CHAVE_PROFESSOR_FALHAS, { falhas: 0, bloqueadoAte: 0 });
      return ok({ token: await tokenProfessor(await versaoProfessor()) });
    }

    const total = falhas + 1;
    if (total >= MAX_FALHAS_PROFESSOR) {
      await store.set(CHAVE_PROFESSOR_FALHAS, { falhas: 0, bloqueadoAte: agora + BLOQUEIO_MS });
      return bloqueadoProfessor(minutosRestantes(agora + BLOQUEIO_MS, agora));
    }
    await store.set(CHAVE_PROFESSOR_FALHAS, { falhas: total, bloqueadoAte: 0 });
    return erro(401, "senha", MSG.senhaProfessor);
  }

  async function professorAlunos() {
    const chaves = (await store.list(PREFIXO_ALUNOS)).filter((k) => typeof k === "string" && CHAVE_ALUNO_RE.test(k));
    const lidos = [];
    for (let i = 0; i < chaves.length; i += 20) {
      const lote = chaves.slice(i, i + 20);
      const regs = await Promise.all(lote.map((k) => store.get(k)));
      regs.forEach((reg, j) => {
        if (objetoSimples(reg)) lidos.push([lote[j], reg]);
      });
    }
    const agora = now();
    const ordem = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
    const alunos = lidos
      .map(([chave, reg]) => resumoAluno(chave, reg, agora))
      .sort(
        (a, b) =>
          ordem.compare(String(a.turmaKey ?? ""), String(b.turmaKey ?? "")) ||
          ordem.compare(String(a.nome ?? ""), String(b.nome ?? "")) ||
          (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
      );
    return ok({ alunos });
  }

  async function professorAluno({ url }) {
    const id = url.searchParams.get("id");
    if (!idValido(id)) return erro(400, "id");
    const chave = PREFIXO_ALUNOS + id;
    const reg = await store.get(chave);
    if (!objetoSimples(reg)) return erro(404, "aluno");
    return ok({ aluno: { ...resumoAluno(chave, reg, now()), paras: parasDe(reg) } });
  }

  async function professorRedefinir({ corpo }) {
    if (!idValido(corpo.id)) return erro(400, "id");
    const feito = await atualizar(PREFIXO_ALUNOS + corpo.id, (r) => ({
      ...r,
      pinHash: null,
      pinVersao: (Number(r.pinVersao) || 0) + 1,
      falhas: 0,
      bloqueadoAte: 0,
    }));
    if (!feito) return erro(404, "aluno");
    return ok();
  }

  async function professorApagar({ corpo }) {
    if (!idValido(corpo.id)) return erro(400, "id");
    await store.del(PREFIXO_ALUNOS + corpo.id);
    return ok();
  }

  async function professorSenha({ corpo }) {
    const atual = typeof corpo.atual === "string" ? corpo.atual.trim() : "";
    if (!(await senhaProfessorConfere(atual))) return erro(403, "senha", MSG.senhaAtual);
    const nova = typeof corpo.nova === "string" ? corpo.nova.trim() : "";
    const tamanho = Array.from(nova).length;
    if (tamanho < 6 || tamanho > 60) return erro(400, "nova", MSG.senhaNova);
    const versao = (await versaoProfessor()) + 1;
    const salt = novoSalt();
    await store.set(CHAVE_PROFESSOR, { salt, hash: await scryptHex(nova, salt), versao });
    return ok({ token: await tokenProfessor(versao) });
  }

  // ---- roteamento ---------------------------------------------------------

  const ROTAS = {
    "/api/entrar": { metodo: "POST", fn: entrar },
    "/api/estado": { metodo: "POST", fn: estado },
    "/api/salvar": { metodo: "POST", fn: salvar },
    "/api/professor/entrar": { metodo: "POST", fn: professorEntrar },
    "/api/professor/alunos": { metodo: "GET", fn: professorAlunos, professor: true },
    "/api/professor/aluno": { metodo: "GET", fn: professorAluno, professor: true },
    "/api/professor/redefinir": { metodo: "POST", fn: professorRedefinir, professor: true },
    "/api/professor/apagar": { metodo: "POST", fn: professorApagar, professor: true },
    "/api/professor/senha": { metodo: "POST", fn: professorSenha, professor: true },
  };

  return async function api(req) {
    try {
      const url = new URL(req.url, "http://localhost");
      const caminho = url.pathname.replace(/\/+$/, "") || "/";
      const rota = Object.prototype.hasOwnProperty.call(ROTAS, caminho) ? ROTAS[caminho] : null;
      if (!rota) return erro(404, "rota");
      if (req.method !== rota.metodo) return erro(405, "metodo", undefined, {}, { allow: rota.metodo });
      if (rota.professor && !(await professorAutenticado(req))) return erro(401, "sessao", MSG.sessaoProfessor);
      let corpo = {};
      if (rota.metodo === "POST") {
        try {
          corpo = await lerCorpoJson(req);
        } catch (e) {
          if (e instanceof ErroCorpo) return e.resposta;
          throw e;
        }
      }
      return await rota.fn({ req, url, corpo });
    } catch (e) {
      console.error("[missao-redacao] erro na API:", e);
      return erro(500, "interno");
    }
  };
}
