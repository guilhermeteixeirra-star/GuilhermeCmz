// Missão Redação — toda a lógica da API.
// Módulo puro: nada de rede ou disco aqui. O armazenamento (store), as variáveis de ambiente
// (env: a lista de alunos padrão), o relógio (now) e o gerador de bytes aleatórios (randomBytes)
// são injetados, para os testes conseguirem controlar o tempo (bloqueios, validade dos tokens).

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
export const MAX_TURMA_KEY = 24; // turmaKey + "/" + nomeKey cabe no limite de 120 do id
export const MAX_SERIES = 20; // séries na lista de alunos
export const MAX_ALUNOS_SERIE = 80; // nomes por série
export const MAX_NOME_LISTA = 90; // caracteres de um nome da lista (o nomeKey tem o mesmo tamanho)
export const MAX_LABEL_SERIE = 40; // caracteres do nome da série ("1ª Série")
export const DIGITOS_PIN = 6;
// Textos por atividade (o que o jogo manda em `textos` no /api/salvar)
export const MAX_ATIVIDADES = 12; // atividades guardadas por aluno
export const MAX_PARTES = 8; // parágrafos/estrofes por atividade
export const ATIV_ID_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
// Perfil de teste do professor ("coringa"): entra por qualquer série, conta única fora das turmas.
export const TURMA_CORINGA = "perfil-teste"; // turmaKey (tem hífen: nunca é chave de uma série da lista)
export const ROTULO_CORINGA = "Perfil de teste";
export const CORINGA_PADRAO = Object.freeze(["GUILHERME CAMOZZATO TEIXEIRA"]); // o nome do professor (já aparece no site)
export const MAX_CORINGAS = 10;
const MAX_TURMA_EXIBIDA = 20;
const TENTATIVAS_CAS = 8; // releituras quando outra requisição grava a mesma chave no meio
const LIMITE_META = 1400; // bytes do resumo guardado nos metadados do Blobs (limite do Blobs: ~1,5 KB)

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
const CHAVE_TURMAS = "config/turmas"; // lista de alunos editada no painel (vale mais que TURMAS_ALUNOS)
const VARIAVEL_TURMAS = "TURMAS_ALUNOS"; // lista de alunos padrão (variável de ambiente do Netlify)
const VARIAVEL_CORINGAS = "ALUNOS_CORINGA"; // nomes do perfil de teste (sem a variável: CORINGA_PADRAO)
const VARIAVEL_CORINGA_SENHA = "CORINGA_SENHA"; // "<saltHex>:<hashHex>" da senha inicial do perfil de teste (dev/hash-pin.mjs)
const PREFIXO_ALUNOS = "alunos/";
const CHAVE_ALUNO_RE = /^alunos\/[a-z0-9-]+\/[a-z0-9-]+$/;

const MSG = {
  rota: "Endereço não encontrado.",
  metodo: "Método não permitido.",
  json: "Não deu para ler os dados enviados. Tente de novo.",
  grande: "Os dados são grandes demais para salvar.",
  nome: "Escreva seu nome e sobrenome.",
  nomeRepetido: "Tem mais de um aluno com esse nome nesta série. Escreva o nome completo, como na chamada.",
  turma: "Escolha a sua série.",
  pin: `A senha tem que ter ${DIGITOS_PIN} números.`,
  senhaAluno: `Senha errada. Confira os ${DIGITOS_PIN} números. Se você esqueceu, peça ao professor para apagar a sua senha.`,
  turmas: "A lista de alunos veio com problema.",
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
  ocupado: "O servidor está ocupado agora. Tente de novo.",
  interno: "Deu um erro no servidor. Tente de novo daqui a pouco.",
  coringa: "O perfil de teste não está configurado direito. Avise o professor.",
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

/**
 * Nome como na lista da chamada: NFKC → NFD → sem acentos → MAIÚSCULAS → tudo que não é A–Z
 * vira espaço → espaços colapsados. "  João  d'Ávila " → "JOAO D AVILA". O jogo usa a mesma regra.
 * Não é string → "".
 */
export function nomeLista(valor) {
  if (typeof valor !== "string") return "";
  return valor
    .slice(0, 1000) // nenhum nome da lista passa de 90; não vale a pena processar texto gigante
    .normalize("NFKC")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase()
    .replace(/[^A-Z ]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

/** nomeKey de um nome já no formato da lista: minúsculas, espaços → "-" ("JOAO D AVILA" → "joao-d-avila"). */
export function chaveNome(canonico) {
  return canonico.toLowerCase().replace(/ /g, "-");
}

// Palavras de ligação: sozinhas depois do primeiro nome, não são sobrenome ("KELLY DE" é só o primeiro nome).
const LIGACOES = new Set(["D", "DA", "DAS", "DE", "DI", "DO", "DOS", "DU", "E"]);

/**
 * Procura o nome digitado (já em nomeLista) na lista de uma série.
 * 1º igual exato; 2º mesma 1ª palavra e as outras palavras digitadas aparecem, na mesma ordem,
 * entre as palavras seguintes do nome da lista ("ANA COSTA" acha "ANA PAULA RIBEIRO COSTA").
 * A regra parcial precisa de pelo menos um sobrenome que não seja palavra de ligação:
 * "RUI DA" não acha "RUI DA SILVA" (seria entrar só com o primeiro nome).
 * → {nome} | {erro:"repetido"} (mais de um) | {erro:"nao-achei"} | {erro:"sem-sobrenome"}
 */
export function encontrarNaLista(alunos, digitado) {
  if (alunos.includes(digitado)) return { nome: digitado };
  const [primeira, ...resto] = digitado.split(" ");
  if (!resto.some((p) => !LIGACOES.has(p))) return { erro: "sem-sobrenome" };
  const achados = alunos.filter((nome) => {
    const [p, ...seguintes] = nome.split(" ");
    if (p !== primeira) return false;
    let i = 0;
    for (const palavra of seguintes) if (i < resto.length && palavra === resto[i]) i++;
    return i === resto.length;
  });
  if (achados.length === 1) return { nome: achados[0] };
  return { erro: achados.length > 1 ? "repetido" : "nao-achei" };
}

const ordemPtBr = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });

/**
 * Lista de séries → {turmas:[{key, label, alunos:[nomes da lista, ordenados]}]}.
 * estrito (o professor salvando no painel): qualquer problema → {erro: mensagem}.
 * Não estrito (variável de ambiente, config/turmas já gravado): pula o que estiver errado.
 * Em todo caso: nomes passam por nomeLista, vazios e repetidos saem, cada série tem chave
 * (normalizarTurma(label)) não vazia e única, e todo nome cabe num id válido.
 */
export function sanitizarTurmas(lista, { estrito = false } = {}) {
  if (!Array.isArray(lista)) return estrito ? { erro: MSG.turmas } : { turmas: [] };
  if (estrito && lista.length === 0) return { erro: "Coloque pelo menos uma série." };
  if (estrito && lista.length > MAX_SERIES) return { erro: `Dá para ter no máximo ${MAX_SERIES} séries.` };
  const turmas = [];
  const labelPorChave = new Map();
  for (const item of lista) {
    const s = sanitizarSerie(item, labelPorChave, estrito);
    if (s.erro) {
      if (estrito) return { erro: s.erro };
      continue; // não estrito: a série com problema fica de fora
    }
    labelPorChave.set(s.key, s.label);
    turmas.push(s);
  }
  return { turmas };
}

/** Uma série → {key, label, alunos} ou {erro}. Problema num nome: estrito → erro; senão o nome é pulado. */
function sanitizarSerie(item, labelPorChave, estrito) {
  if (!objetoSimples(item)) return { erro: MSG.turmas };
  const label = typeof item.label === "string" ? limparEspacos(item.label.normalize("NFC")) : "";
  if (!label) return { erro: "Toda série precisa de um nome. Exemplo: 1ª Série." };
  if (Array.from(label).length > MAX_LABEL_SERIE) return { erro: `O nome da série "${cortar(label, MAX_LABEL_SERIE)}…" é grande demais.` };
  const t = normalizarTurma(label);
  if (!t) return { erro: `O nome da série "${label}" precisa ter o número da série. Exemplo: 1ª Série.` };
  if (labelPorChave.has(t.turmaKey)) {
    return { erro: `As séries "${labelPorChave.get(t.turmaKey)}" e "${label}" ficaram iguais. Use nomes diferentes.` };
  }
  const brutos = item.alunos ?? [];
  if (!Array.isArray(brutos)) return { erro: `A lista de alunos da ${label} veio com problema.` };

  const nomes = new Set();
  for (const bruto of brutos) {
    if (typeof bruto !== "string") {
      if (estrito) return { erro: `A lista de alunos da ${label} veio com problema.` };
      continue;
    }
    const nome = nomeLista(bruto);
    if (!nome) continue; // linha vazia
    if (nome.length > MAX_NOME_LISTA) {
      if (estrito) return { erro: `Na ${label}, o nome "${nome.slice(0, 40)}…" é grande demais (máximo ${MAX_NOME_LISTA} letras).` };
      continue; // não caberia num id válido
    }
    // Nome de uma palavra só nunca consegue entrar (o aluno tem que digitar nome e sobrenome).
    if (estrito && !nome.includes(" ")) return { erro: `Na ${label}, escreva nome e sobrenome de "${nome}".` };
    nomes.add(nome);
  }
  if (estrito && nomes.size > MAX_ALUNOS_SERIE) {
    return { erro: `A ${label} ficou com ${nomes.size} nomes. O máximo é ${MAX_ALUNOS_SERIE} por série.` };
  }
  const alunos = [...nomes].sort((a, b) => ordemPtBr.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0));
  return { key: t.turmaKey, label, alunos };
}

/**
 * Texto JSON da lista (TURMAS_ALUNOS ou arquivo do servidor local) → [{key, label, alunos}].
 * Aceita `[{label, alunos}]` ou `{turmas:[...]}`. JSON inválido ou vazio → [] (ninguém entra, mas a API funciona).
 */
export function lerTurmasJson(texto) {
  if (typeof texto !== "string" || !texto.trim()) return [];
  let dados;
  try {
    dados = JSON.parse(texto.replace(/^﻿/, ""));
  } catch {
    return [];
  }
  const lista = Array.isArray(dados) ? dados : objetoSimples(dados) && Array.isArray(dados.turmas) ? dados.turmas : null;
  return lista ? sanitizarTurmas(lista).turmas : [];
}

/**
 * Nomes do perfil de teste ("coringa"), já no formato da lista (nomeLista).
 * Variável ALUNOS_CORINGA que NÃO existe (undefined/null) → CORINGA_PADRAO (o nome do professor).
 * Existe: JSON (array de strings) ou texto com um nome por linha (também separa por vírgula ou ponto e vírgula).
 * Vazia, "[]" ou quebrada (JSON inválido, JSON que não é lista) → nenhum coringa (nunca volta para o padrão).
 * Nomes com menos de 2 palavras ou grandes demais para um id são ignorados; repetidos contam uma vez; no máximo 10.
 */
export function lerCoringas(texto) {
  if (texto === undefined || texto === null) return [...CORINGA_PADRAO];
  if (typeof texto !== "string") return [];
  const t = texto.replace(/^\uFEFF/, "").trim();
  if (!t) return [];
  let itens;
  if (t.startsWith("[") || t.startsWith("{")) {
    try {
      itens = JSON.parse(t);
    } catch {
      return [];
    }
    if (!Array.isArray(itens)) return [];
  } else {
    itens = t.split(/[\r\n,;]+/);
  }
  const nomes = [];
  for (const item of itens) {
    if (typeof item !== "string") continue;
    const nome = nomeLista(item);
    if (nome.split(" ").length < 2 || nome.length > MAX_NOME_LISTA || nomes.includes(nome)) continue;
    nomes.push(nome);
    if (nomes.length >= MAX_CORINGAS) break;
  }
  return nomes;
}

/**
 * CORINGA_SENHA ("<saltHex>:<hashHex>", saída de dev/hash-pin.mjs) → {estado, salt?, hash?}.
 * estado: "ausente" (sem a variável ou vazia), "ok" ou "invalida" (existe mas não está no formato).
 */
export function lerSenhaCoringa(texto) {
  if (typeof texto !== "string" || !texto.trim()) return { estado: "ausente" };
  const m = /^([0-9a-f]{32}):([0-9a-f]{64})$/.exec(texto.trim().toLowerCase());
  return m ? { estado: "ok", salt: m[1], hash: m[2] } : { estado: "invalida" };
}

const PALAVRAS_TURMA = /serie|ano|turma/g;
// Palavras que não mudam a turma: "2ª série do Ensino Médio B" é a mesma turma que "2º B".
const PALAVRAS_IGNORADAS = new Set(["serie", "ano", "turma", "do", "da", "de", "em", "ensino", "medio"]);
const ORDINAIS = { primeiro: "1", primeira: "1", segundo: "2", segunda: "2", terceiro: "3", terceira: "3" };

/**
 * Turma exibida + turmaKey ([a-z0-9]). "2º B", "2 b", "2ª série B", "2B", "Segundo B" → "2b".
 * Também entende "2a série B" / "2o ano B" (a/o digitados no lugar de ª/º) → "2b".
 * A chave vem do texto inteiro (não do texto cortado para exibir). Retorna null se a chave ficar vazia.
 */
export function normalizarTurma(valor) {
  if (typeof valor !== "string") return null;
  const completa = limparEspacos(valor.normalize("NFC"));
  const base = semAcentos(completa.toLowerCase().replace(/[ºª°˚]/g, " "));
  let partes = base
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((p) => (Object.hasOwn(ORDINAIS, p) ? ORDINAIS[p] : p)) // hasOwn: "constructor" não é Object.prototype.constructor
    .map((p) => (/\d/.test(p) ? p.replace(PALAVRAS_TURMA, "") : p))
    .filter((p) => p && !PALAVRAS_IGNORADAS.has(p));
  if (partes.length >= 2 && /^\d+[ao]$/.test(partes[0])) {
    partes = [partes[0].slice(0, -1), ...partes.slice(1)];
  }
  const turmaKey = partes.join("").replace(/[^a-z0-9]/g, "").slice(0, MAX_TURMA_KEY);
  if (!turmaKey) return null;
  let turma = completa;
  if (Array.from(completa).length > MAX_TURMA_EXIBIDA) {
    // Texto longo: mostra a forma curta ("2º B") quando dá, para turmas diferentes não aparecerem iguais.
    const m = /^(\d{1,2})([a-z])$/.exec(turmaKey);
    turma = m ? `${m[1]}º ${m[2].toUpperCase()}` : cortar(completa, MAX_TURMA_EXIBIDA);
  }
  return { turma, turmaKey };
}

const PIN_RE = new RegExp(`^[0-9]{${DIGITOS_PIN}}$`);

/** PIN: exatamente 6 dígitos. Retorna a string ou null. */
export function normalizarPin(valor) {
  const pin = typeof valor === "string" ? valor.trim() : typeof valor === "number" ? String(valor) : "";
  return PIN_RE.test(pin) ? pin : null;
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

/**
 * Hash de um PIN com os MESMOS parâmetros dos alunos: scrypt(pin, saltHex como texto, 32, N=16384 r=8 p=1) → hex.
 * Usado por dev/hash-pin.mjs para gerar a variável CORINGA_SENHA ("<saltHex>:<hashHex>").
 * saltHex padrão: 16 bytes aleatórios.
 */
export async function hashPin(pin, saltHex = nodeCrypto.randomBytes(16).toString("hex")) {
  const p = normalizarPin(pin);
  if (!p) throw new Error(`O PIN precisa ter exatamente ${DIGITOS_PIN} números.`);
  return { salt: saltHex, hash: await scryptHex(p, saltHex) };
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

// ---- textos por atividade ----------------------------------------------------

/** Texto de uma linha (rótulo, gênero, tema, título…): espaços colapsados, sem caracteres de controle, cortado. */
function textoLinha(v, max) {
  if (typeof v === "number" && Number.isFinite(v)) v = String(v);
  return typeof v === "string" ? cortar(limparEspacos(v), max) : "";
}

/** Uma parte (parágrafo ou estrofe): mantém as quebras de linha dos versos; corta em LIMITE_PARAGRAFO. */
function textoParte(v) {
  if (typeof v !== "string") return "";
  const s = v.replace(/\r\n?/g, "\n");
  if (s.length <= LIMITE_PARAGRAFO) return s;
  let n = LIMITE_PARAGRAFO;
  const c = s.charCodeAt(n - 1);
  if (c >= 0xd800 && c <= 0xdbff) n--; // não deixa meio emoji no fim
  return s.slice(0, n);
}

function sanitizarTexto(t) {
  return {
    rotulo: textoLinha(t.rotulo, 40),
    genero: textoLinha(t.genero, 60),
    tema: textoLinha(t.tema, 300),
    serie: textoLinha(t.serie, 4),
    titulo: textoLinha(t.titulo, 200),
    partes: Array.isArray(t.partes) ? t.partes.slice(0, MAX_PARTES).map(textoParte) : [],
    nomesPartes: Array.isArray(t.nomesPartes) ? t.nomesPartes.slice(0, MAX_PARTES).map((n) => textoLinha(n, 60)) : [],
    verso: t.verso === true,
    fases: inteiro(t.fases, 99),
    total: inteiro(t.total, 99),
    concluiu: t.concluiu === true,
    xp: inteiro(t.xp, 1e9),
  };
}

/**
 * `textos` do jogo → {<idAtividade>: texto sanitizado}. Só ids /^[a-z0-9][a-z0-9-]{0,39}$/ com valor objeto;
 * as outras chaves são ignoradas. No máximo MAX_ATIVIDADES atividades. Não é objeto → {}.
 */
export function sanitizarTextos(obj) {
  const out = {};
  if (!objetoSimples(obj)) return out;
  let n = 0;
  for (const id of Object.keys(obj)) {
    if (n >= MAX_ATIVIDADES) break;
    if (!ATIV_ID_RE.test(id) || !objetoSimples(obj[id])) continue;
    out[id] = sanitizarTexto(obj[id]);
    n++;
  }
  return out;
}

const temTexto = (t) => t.partes.some((p) => p.trim() !== "");

/**
 * Junta os textos que chegaram com os que já estavam guardados: os novos valem mais, e uma atividade
 * que não veio (por exemplo, o arquivo dela não carregou no celular do aluno) continua no painel.
 * No máximo MAX_ATIVIDADES, com os novos primeiro.
 */
function juntarTextos(antigos, novos) {
  const out = { ...novos };
  let n = Object.keys(out).length;
  for (const [id, t] of Object.entries(sanitizarTextos(antigos))) {
    if (n >= MAX_ATIVIDADES) break;
    if (!Object.hasOwn(out, id)) {
      out[id] = t;
      n++;
    }
  }
  return out;
}

// Registro ANTIGO (de quando só existia a redação dos leitores) sem `textos`: vira a atividade "leitores".
const LEITORES_ANTIGO = {
  rotulo: "Texto 1",
  genero: "Dissertativo-argumentativo",
  tema: "Os desafios para a formação de leitores no Brasil",
  serie: "2",
  titulo: "",
  nomesPartes: ["Introdução", "1º argumento", "2º argumento", "Conclusão"],
  verso: false,
  total: 7,
};

/** Textos do registro para o professor. Registro antigo sem `textos` mas com parágrafos: migra só na leitura. */
function textosDe(reg) {
  if (objetoSimples(reg.textos)) return sanitizarTextos(reg.textos);
  const partes = parasDe(reg);
  if (!partes.some((p) => p.trim() !== "")) return {};
  const r = objetoSimples(reg.resumo) ? sanitizarResumo(reg.resumo) : resumoVazio();
  const fases = Math.min(r.fases, LEITORES_ANTIGO.total);
  return {
    leitores: {
      ...LEITORES_ANTIGO,
      partes,
      nomesPartes: [...LEITORES_ANTIGO.nomesPartes],
      fases,
      concluiu: r.fases >= LEITORES_ANTIGO.total,
      xp: r.xp,
    },
  };
}

/**
 * Resumo pequeno do registro do aluno. É guardado nos metadados do Blobs a cada gravação
 * (na mesma escrita do registro), para a lista do professor não precisar baixar o estado do jogo.
 * `at` (só quando o registro tem `textos`): {<idAtividade>: [fases, total, concluiu?1:0, temTexto?1:0]}.
 */
function metaAluno(reg) {
  const r = objetoSimples(reg.resumo) ? sanitizarResumo(reg.resumo) : resumoVazio();
  const textos = objetoSimples(reg.textos) ? sanitizarTextos(reg.textos) : null;
  const m = {
    v: 1,
    nome: reg.nome,
    turma: reg.turma,
    turmaKey: reg.turmaKey,
    ...r,
    temRedacao: parasDe(reg).some((p) => p.trim() !== "") || (!!textos && Object.values(textos).some(temTexto)),
    semSenha: reg.pinHash === null,
    bloqueadoAte: Number(reg.bloqueadoAte) || 0,
    criadoEm: reg.criadoEm ?? null,
    atualizadoEm: reg.atualizadoEm ?? null,
  };
  if (reg.coringa === true) m.coringa = true;
  if (textos) {
    m.at = {};
    for (const [id, t] of Object.entries(textos)) m.at[id] = [t.fases, t.total, t.concluiu ? 1 : 0, temTexto(t) ? 1 : 0];
  }
  return m;
}

const bytesJson = (v) => Buffer.byteLength(JSON.stringify(v), "utf8");

/** Metadados para gravar: o resumo, se couber no limite do Blobs; senão {v:0} (a lista lê o registro inteiro). */
function metaGravavel(reg) {
  const m = metaAluno(reg);
  if (bytesJson(m) > LIMITE_META) {
    if (typeof m.nivel === "string") m.nivel = "";
    if (typeof m.etapa === "string") m.etapa = "";
  }
  return bytesJson(m) > LIMITE_META ? { v: 0 } : m;
}

/**
 * Progresso por atividade a partir do resumo: [{id, fases, total, concluiu, temTexto}].
 * Sem `at` (registro antigo, de antes das atividades): o progresso que existir é da atividade "leitores".
 */
function atividadesDe(m, r) {
  if (objetoSimples(m.at)) {
    return Object.keys(m.at)
      .filter((id) => ATIV_ID_RE.test(id))
      .slice(0, MAX_ATIVIDADES)
      .map((id) => {
        const v = Array.isArray(m.at[id]) ? m.at[id] : [];
        return { id, fases: inteiro(v[0], 99), total: inteiro(v[1], 99), concluiu: v[2] === 1, temTexto: v[3] === 1 };
      });
  }
  if (r.fases > 0 || m.temRedacao === true) {
    const total = LEITORES_ANTIGO.total;
    return [{ id: "leitores", fases: Math.min(r.fases, total), total, concluiu: r.fases >= total, temTexto: m.temRedacao === true }];
  }
  return [];
}

/**
 * resumoAluno da API a partir do resumo (metaAluno), venha ele dos metadados ou do registro.
 * concluiu: registro antigo (sem atividades) → fases >= 7, como antes; com atividades → começou alguma
 * e concluiu todas as que começou (o servidor não conhece o catálogo; o painel faz a conta por série).
 */
function resumoDe(chave, m, agora) {
  const r = sanitizarResumo(m);
  const atividades = atividadesDe(m, r);
  return {
    id: chave.slice(PREFIXO_ALUNOS.length),
    nome: m.nome,
    turma: m.turma,
    turmaKey: m.turmaKey,
    fases: r.fases,
    xp: r.xp,
    nivel: r.nivel,
    linhas: r.linhas,
    etapa: r.etapa,
    concluiu: objetoSimples(m.at) ? atividades.length > 0 && atividades.every((a) => a.concluiu) : r.fases >= 7,
    temRedacao: m.temRedacao === true,
    semSenha: m.semSenha === true,
    bloqueado: (Number(m.bloqueadoAte) || 0) > agora,
    coringa: m.coringa === true,
    atividades,
    criadoEm: m.criadoEm ?? null,
    atualizadoEm: m.atualizadoEm ?? null,
  };
}

function resumoAluno(chave, reg, agora) {
  return resumoDe(chave, metaAluno(reg), agora);
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

/** Outra requisição gravou a mesma chave tantas vezes seguidas que não deu para gravar. */
class ErroOcupado extends Error {
  constructor() {
    super("ocupado");
  }
}

const esperar = (tentativa) => new Promise((r) => setTimeout(r, 5 + Math.floor(Math.random() * 20 * tentativa)));

/**
 * Depois de uma senha certa: tira do contador esta tentativa e os erros de antes dela
 * (sem concorrência, o contador volta a zero). Erros de outras tentativas que chegaram
 * depois desta continuam contando, e um bloqueio que elas criaram continua valendo:
 * quem acerta a senha não dá chances extras a quem está chutando ao mesmo tempo.
 * contador = {falhas, bloqueadoAte} atual; reserva = {falhas, ultima} desta tentativa.
 * Retorna o contador novo, ou null se não precisa gravar.
 */
function liberarTentativa(contador, reserva, agora) {
  const falhas = Number(contador.falhas) || 0;
  const bloqueadoAte = Number(contador.bloqueadoAte) || 0;
  // Esta tentativa foi a 5ª/10ª e criou o bloqueio provisório: como acertou, desfaz o bloqueio.
  if (reserva.ultima) return { falhas: 0, bloqueadoAte: 0 };
  // Outra tentativa, depois desta, chegou ao limite e bloqueou: o bloqueio fica.
  if (bloqueadoAte > agora) return null;
  return { falhas: Math.max(0, falhas - reserva.falhas), bloqueadoAte: 0 };
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

/** Leitor de variáveis de ambiente: {get(k)} (Netlify.env) ou objeto simples (process.env). */
function leitorAmbiente(env) {
  if (env && typeof env.get === "function") return (k) => env.get(k);
  if (env && typeof env === "object") return (k) => env[k];
  return () => undefined;
}

/**
 * createApi({store, env, now, randomBytes}) → async (req: Request) => Response
 * store: {get(key), set(key, obj, {onlyIfNew, onlyIfMatch, metadata}) → {modified, etag}, del(key), list(prefix)}
 * Opcionais (o adaptador do Netlify e o MemoryStore têm):
 *   getWithEtag(key) → {data, etag} | null   — para gravar com onlyIfMatch (sem perder gravações simultâneas)
 *   getMeta(key) → {metadata, etag} | null   — só os metadados, para a lista do professor
 * Sem getWithEtag, as gravações não são condicionais (funciona, mas sem proteção contra corridas).
 * env: de onde vêm as variáveis — {get(k)} como Netlify.env, ou um objeto como process.env. Padrão: process.env.
 *   TURMAS_ALUNOS   lista de alunos padrão (a lista salva no painel, config/turmas, vale mais que ela)
 *   ALUNOS_CORINGA  nomes do perfil de teste do professor (sem a variável: CORINGA_PADRAO; vazia: nenhum)
 *   CORINGA_SENHA   "<saltHex>:<hashHex>" (dev/hash-pin.mjs): senha com que o perfil de teste nasce
 */
export function createApi({ store, env = globalThis.process?.env, now = () => Date.now(), randomBytes = nodeCrypto.randomBytes } = {}) {
  if (!store) throw new Error("createApi: store é obrigatório");

  const temEtag = typeof store.getWithEtag === "function";
  const temMeta = typeof store.getMeta === "function";
  const lerAmbiente = leitorAmbiente(env);

  /** {data, etag} ou null se a chave não existe. */
  async function lerComEtag(chave) {
    if (temEtag) {
      const r = await store.getWithEtag(chave);
      return r && r.data !== null && r.data !== undefined ? { data: r.data, etag: r.etag || null } : null;
    }
    const data = await store.get(chave);
    return data === null || data === undefined ? null : { data, etag: null };
  }

  /**
   * Grava. cond: {novo:true} = só se a chave não existe; {etag} = só se ninguém gravou depois da leitura.
   * Registros de aluno levam junto o resumo nos metadados. Retorna true se gravou.
   */
  async function gravar(chave, valor, cond) {
    const opcoes = {};
    if (cond && cond.novo) opcoes.onlyIfNew = true;
    else if (cond && cond.etag) opcoes.onlyIfMatch = cond.etag;
    if (chave.startsWith(PREFIXO_ALUNOS)) opcoes.metadata = metaGravavel(valor);
    const r = await store.set(chave, valor, opcoes);
    return !r || r.modified !== false;
  }

  /**
   * Lê, muda e grava com escrita condicional: se outra requisição gravou no meio, relê e refaz
   * (assim um salvamento não desfaz um "Apagar senha", um erro de senha não desfaz um salvamento etc.).
   * mudar(atual) → registro novo, ou null para não gravar. atual é null se a chave não existe
   * (com criar:false, aí nem chama mudar). Retorna o registro gravado ou null.
   * forcar: depois de todas as tentativas, grava sem condição (ações do professor não podem ficar
   * travadas por alguém salvando sem parar com um token que a própria ação vai invalidar).
   */
  async function atualizar(chave, mudar, { criar = false, forcar = false } = {}) {
    for (let i = 0; i <= TENTATIVAS_CAS; i++) {
      if (i) await esperar(i);
      const ultima = i === TENTATIVAS_CAS;
      if (ultima && !forcar) break;
      const lido = await lerComEtag(chave);
      const atual = lido && objetoSimples(lido.data) ? lido.data : null;
      if (!atual && !criar) return null;
      const novo = mudar(atual);
      if (!novo) return null;
      const cond = ultima ? null : lido ? { etag: lido.etag } : { novo: true };
      if (await gravar(chave, novo, cond)) return novo;
    }
    throw new ErroOcupado();
  }

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
  const aleatorio32 = () => Buffer.from(randomBytes(4)).readUInt32BE(0);
  // Cadastro novo começa numa versão aleatória (não em 1): se o professor excluir o aluno e
  // alguém se cadastrar de novo com o mesmo nome, os tokens do cadastro antigo não valem no novo.
  const versaoInicial = () => 1 + (aleatorio32() % 100000000);

  // Senha nova de 6 números (para o professor entregar ao aluno), sem viés: sorteia de novo
  // os valores do pedaço final de 2^32 que não completa um bloco de 1.000.000.
  const LIMITE_PIN = 10 ** DIGITOS_PIN;
  const TETO_PIN = Math.floor(2 ** 32 / LIMITE_PIN) * LIMITE_PIN;
  function novoPin() {
    for (let i = 0; i < 16; i++) {
      const n = aleatorio32();
      if (n < TETO_PIN) return String(n % LIMITE_PIN).padStart(DIGITOS_PIN, "0");
    }
    return String(nodeCrypto.randomInt(LIMITE_PIN)).padStart(DIGITOS_PIN, "0");
  }

  // ---- lista de alunos por série --------------------------------------------

  let ambienteCache = { texto: undefined, turmas: [] };

  /** Lista padrão (variável TURMAS_ALUNOS). Inválida ou ausente → [] (ninguém entra; a API continua respondendo). */
  function turmasDoAmbiente() {
    let texto;
    try {
      texto = lerAmbiente(VARIAVEL_TURMAS);
    } catch {
      texto = undefined;
    }
    if (texto !== ambienteCache.texto) {
      const turmas = lerTurmasJson(texto);
      if (typeof texto === "string" && texto.trim() && !turmas.length) {
        console.error(`[missao-redacao] ${VARIAVEL_TURMAS} não tem nenhuma série válida (JSON inválido ou fora do formato).`);
      }
      ambienteCache = { texto, turmas };
    }
    return ambienteCache.turmas;
  }

  function ambiente(nome) {
    try {
      return lerAmbiente(nome);
    } catch {
      return undefined;
    }
  }

  let coringasCache = { texto: Symbol("nada"), nomes: [] };

  /** Nomes do perfil de teste (ALUNOS_CORINGA; sem a variável, o padrão). Variável quebrada → nenhum. */
  function coringas() {
    const texto = ambiente(VARIAVEL_CORINGAS);
    if (texto !== coringasCache.texto) {
      const nomes = lerCoringas(texto);
      if (typeof texto === "string" && texto.trim() && !nomes.length) {
        console.error(`[missao-redacao] ${VARIAVEL_CORINGAS} não tem nenhum nome válido: ninguém entra como perfil de teste.`);
      }
      coringasCache = { texto, nomes };
    }
    return coringasCache.nomes;
  }

  /** {estado:"ausente"|"ok"|"invalida", salt, hash} da variável CORINGA_SENHA. */
  function senhaCoringa() {
    const s = lerSenhaCoringa(ambiente(VARIAVEL_CORINGA_SENHA));
    if (s.estado === "invalida") console.error(`[missao-redacao] ${VARIAVEL_CORINGA_SENHA} fora do formato <saltHex>:<hashHex> (use dev/hash-pin.mjs).`);
    return s;
  }

  /** {fonte:"painel"|"padrao", turmas:[{key, label, alunos}]}. A lista salva no painel vale mais que a variável. */
  async function carregarTurmas() {
    const salvo = await store.get(CHAVE_TURMAS);
    if (objetoSimples(salvo) && Array.isArray(salvo.turmas)) {
      const { turmas } = sanitizarTurmas(salvo.turmas);
      if (turmas.length) return { fonte: "painel", turmas };
    }
    return { fonte: "padrao", turmas: turmasDoAmbiente() };
  }

  /** Série pela chave que o jogo recebeu de /api/turmas ("2"). Desconhecida → null. */
  function acharSerie(turmas, valor) {
    if (typeof valor !== "string" && typeof valor !== "number") return null;
    const chave = String(valor).trim();
    return turmas.find((s) => s.key === chave) ?? null;
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

  // Marca de "aparelho do professor": entregue a cada entrada certa e guardada pelo painel.
  // Não abre o painel (não é token de sessão). Só faz o login daquele aparelho contar os erros
  // num contador separado, para quem não sabe a senha não conseguir trancar o professor fora.
  async function novoDispositivo() {
    const seg = await segredo();
    const id = Buffer.from(randomBytes(16)).toString("hex");
    return `d.${id}.${hmacHex(seg, `d|${id}`)}`;
  }

  async function dispositivoValido(marca) {
    if (typeof marca !== "string" || marca.length > 120) return false;
    const m = /^d\.([0-9a-f]{32})\.([0-9a-f]{64})$/.exec(marca);
    if (!m) return false;
    return igualHex(m[2], hmacHex(await segredo(), `d|${m[1]}`));
  }

  async function senhaProfessorConfere(senha) {
    const prof = await store.get(CHAVE_PROFESSOR);
    const ref = objetoSimples(prof) && typeof prof.salt === "string" && typeof prof.hash === "string" ? prof : SETUP;
    if (typeof senha !== "string" || !senha || senha.length > 200) return false;
    return igualHex(await scryptHex(senha, ref.salt), ref.hash);
  }

  // ---- rotas do aluno -----------------------------------------------------

  // `coringa` só vem para o perfil de teste (para os alunos, a resposta não muda).
  const alunoPublico = (id, reg) => ({ id, nome: reg.nome, turma: reg.turma, ...(reg.coringa === true ? { coringa: true } : {}) });

  async function respostaEntrada(id, reg, extra = {}) {
    return ok({
      novo: false,
      ...extra,
      token: await tokenAluno(id, Number(reg.pinVersao) || 0),
      aluno: alunoPublico(id, reg),
      estado: reg.estado ?? null,
      atualizadoEm: reg.atualizadoEm ?? null,
    });
  }

  async function entrar({ corpo }) {
    const { turmas } = await carregarTurmas();
    const serie = acharSerie(turmas, corpo.turma);
    if (!serie) return erro(400, "turma");
    const digitado = nomeLista(corpo.nome);
    if (digitado.split(" ").length < 2) return erro(400, "nome");
    const pin = normalizarPin(corpo.pin);
    if (!pin) return erro(400, "pin");

    // Perfil de teste do professor: só pelo nome COMPLETO e EXATO, antes da lista da série
    // (um aluno com nome parecido nunca cai aqui). Conta única, qualquer que seja a série escolhida.
    const coringa = coringas().includes(digitado);
    let ident;
    if (coringa) {
      ident = { nome: digitado, turma: ROTULO_CORINGA, turmaKey: TURMA_CORINGA, nomeKey: chaveNome(digitado), coringa: true };
    } else {
      const achado = encontrarNaLista(serie.alunos, digitado);
      if (achado.erro === "sem-sobrenome") return erro(400, "nome");
      if (achado.erro === "repetido") return erro(409, "nome", MSG.nomeRepetido);
      if (!achado.nome) {
        return erro(404, "nome", `Não achei esse nome na lista da ${serie.label}. Confira a série e escreva o nome completo, como na chamada.`);
      }
      // Daqui em diante, o nome é o da lista (MAIÚSCULAS) e a turma é a série oficial.
      ident = { nome: achado.nome, turma: serie.label, turmaKey: serie.key, nomeKey: chaveNome(achado.nome) };
    }
    const id = `${ident.turmaKey}/${ident.nomeKey}`;
    if (!idValido(id)) return erro(400, "nome");
    // Cadastro antigo com o nome ou o nome da série de antes: atualiza junto com a próxima gravação.
    const comIdent = (r) => (Object.keys(ident).every((k) => r[k] === ident[k]) ? r : { ...r, ...ident });
    const chave = PREFIXO_ALUNOS + id;
    let lido = await lerComEtag(chave);

    if (!lido) {
      // Perfil de teste com senha inicial do professor (CORINGA_SENHA): o cadastro nasce com ESSA senha
      // (não com a digitada) e a entrada segue a conferência normal, com os bloqueios de sempre.
      const senhaFixa = coringa ? senhaCoringa() : { estado: "ausente" };
      if (senhaFixa.estado === "invalida") return erro(503, "coringa");
      const agora = now();
      const pinSalt = senhaFixa.estado === "ok" ? senhaFixa.salt : novoSalt();
      const novo = {
        id,
        ...ident,
        pinSalt,
        pinHash: senhaFixa.estado === "ok" ? senhaFixa.hash : await scryptHex(pin, pinSalt),
        pinVersao: versaoInicial(),
        falhas: 0,
        bloqueadoAte: 0,
        estado: null,
        paras: parasVazios(),
        resumo: resumoVazio(),
        criadoEm: agora,
        atualizadoEm: agora,
      };
      if (await gravar(chave, novo, { novo: true })) {
        // Confere que gravou mesmo antes de entregar o token (um erro do Blobs não pode virar "cadastro feito").
        const conferido = await store.get(chave);
        if (!objetoSimples(conferido)) return erro(503, "corrida");
        if (conferido.pinSalt === novo.pinSalt && conferido.pinVersao === novo.pinVersao && senhaFixa.estado !== "ok") {
          return ok({
            novo: true,
            token: await tokenAluno(id, novo.pinVersao),
            aluno: alunoPublico(id, novo),
            estado: null,
            atualizadoEm: null,
          });
        }
      }
      // Perdeu a corrida (outro celular criou ao mesmo tempo) ou é o perfil de teste com a senha do
      // professor (o PIN digitado ainda precisa ser conferido): segue como registro existente.
      lido = await lerComEtag(chave);
      if (!lido) return erro(503, "corrida");
    }

    // Registro existente. A tentativa é contada como erro ANTES de conferir o PIN, numa gravação
    // condicional: assim, várias tentativas ao mesmo tempo não passam do limite de 5 erros.
    // Se o PIN estiver certo, o contador volta a zero logo depois.
    const agora = now();
    let reserva = null;
    for (let i = 0; i < TENTATIVAS_CAS && !reserva; i++) {
      if (i) {
        await esperar(i);
        lido = await lerComEtag(chave);
      }
      if (!lido || !objetoSimples(lido.data)) return erro(503, "corrida");
      const r = lido.data;
      const bloqueadoAte = Number(r.bloqueadoAte) || 0;
      if (bloqueadoAte > agora) return bloqueadoAluno(minutosRestantes(bloqueadoAte, agora));

      if (r.pinHash === null) {
        // Registro sem senha (versão antiga do "Apagar senha"): o aluno cria uma nova agora. O progresso continua.
        const pinSalt = novoSalt();
        const pinHash = await scryptHex(pin, pinSalt);
        const novo = { ...comIdent(r), pinSalt, pinHash, pinVersao: (Number(r.pinVersao) || 0) + 1, falhas: 0, bloqueadoAte: 0 };
        if (await gravar(chave, novo, { etag: lido.etag })) return respostaEntrada(id, novo, { senhaNova: true });
        continue; // outra requisição (ex.: toque duplo) mudou o registro: relê e confere de novo
      }

      const falhas = (Number(r.falhas) || 0) + 1;
      const ultima = falhas >= MAX_FALHAS_ALUNO;
      const novo = ultima ? { ...r, falhas: 0, bloqueadoAte: agora + BLOQUEIO_MS } : { ...r, falhas };
      if (await gravar(chave, novo, { etag: lido.etag })) reserva = { reg: r, falhas, ultima };
    }
    if (!reserva) return erro(503, "corrida");

    const confere = igualHex(await scryptHex(pin, String(reserva.reg.pinSalt)), reserva.reg.pinHash);
    if (confere) {
      const versao = Number(reserva.reg.pinVersao);
      let atual = null;
      const gravado = await atualizar(chave, (r) => {
        atual = Number(r.pinVersao) === versao ? r : null;
        if (!atual) return null; // a senha mudou agora mesmo (ex.: professor apagou)
        const b = liberarTentativa({ falhas: r.falhas, bloqueadoAte: r.bloqueadoAte }, reserva, agora);
        const r2 = comIdent(r);
        if (!b && r2 === r) return null; // nada a gravar
        return b ? { ...r2, ...b } : r2;
      });
      if (gravado) atual = gravado;
      if (!atual) return erro(503, "corrida"); // a senha mudou ou o aluno foi excluído agora mesmo
      return respostaEntrada(id, atual);
    }
    if (reserva.ultima) return bloqueadoAluno(minutosRestantes(agora + BLOQUEIO_MS, agora));
    return erro(401, "senha", MSG.senhaAluno, { restantes: MAX_FALHAS_ALUNO - reserva.falhas });
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
    // textos por atividade: os novos entram por cima dos que já estavam (juntarTextos); sem `textos` no corpo, fica tudo como estava.
    const textos = objetoSimples(corpo.textos) ? sanitizarTextos(corpo.textos) : null;
    const agora = now();
    const gravado = await atualizar(tk.chave, (r) => {
      if (Number(r.pinVersao) !== tk.versao) return null;
      const novo = { ...r, estado: corpo.estado, atualizadoEm: agora };
      if (paras) novo.paras = paras;
      if (resumo) novo.resumo = resumo;
      if (textos) novo.textos = juntarTextos(r.textos, textos);
      return novo;
    });
    if (!gravado) return erro(401, "sessao", MSG.sessaoAluno);
    return ok({ atualizadoEm: agora });
  }

  // ---- rotas do professor -------------------------------------------------

  // config/professor-falhas = {falhas, bloqueadoAte, disp?:{falhas, bloqueadoAte}}.
  // "geral": entradas de qualquer lugar (e erros da senha atual em /senha). "disp": entradas
  // de aparelhos onde o professor já entrou antes (com a marca de aparelho).
  function baldeDe(f, balde) {
    const x = !objetoSimples(f) ? {} : balde === "disp" ? (objetoSimples(f.disp) ? f.disp : {}) : f;
    return { falhas: Number(x.falhas) || 0, bloqueadoAte: Number(x.bloqueadoAte) || 0 };
  }

  function comBalde(f, balde, b) {
    const base = objetoSimples(f) ? f : {};
    return balde === "disp" ? { ...base, disp: b } : { ...base, falhas: b.falhas, bloqueadoAte: b.bloqueadoAte };
  }

  /** Conta a tentativa como erro antes de conferir a senha (gravação condicional). → {bloqueadoAte} ou {falhas, ultima} */
  async function reservarProfessor(balde, agora) {
    let res = null;
    await atualizar(
      CHAVE_PROFESSOR_FALHAS,
      (f) => {
        const b = baldeDe(f, balde);
        if (b.bloqueadoAte > agora) {
          res = { bloqueadoAte: b.bloqueadoAte };
          return null;
        }
        const total = b.falhas + 1;
        res = { falhas: total, ultima: total >= MAX_FALHAS_PROFESSOR };
        return comBalde(f, balde, res.ultima ? { falhas: 0, bloqueadoAte: agora + BLOQUEIO_MS } : { falhas: total, bloqueadoAte: 0 });
      },
      { criar: true },
    );
    return res;
  }

  async function liberarProfessor(balde, reserva, agora) {
    await atualizar(
      CHAVE_PROFESSOR_FALHAS,
      (f) => {
        const b = liberarTentativa(baldeDe(f, balde), reserva, agora);
        return b ? comBalde(f, balde, b) : null;
      },
      { criar: true },
    );
  }

  async function professorEntrar({ corpo }) {
    const agora = now();
    const balde = (await dispositivoValido(corpo.dispositivo)) ? "disp" : "geral";
    const senha = typeof corpo.senha === "string" ? corpo.senha.trim() : "";
    if (!senha) {
      const b = baldeDe(await store.get(CHAVE_PROFESSOR_FALHAS), balde);
      if (b.bloqueadoAte > agora) return bloqueadoProfessor(minutosRestantes(b.bloqueadoAte, agora));
      return erro(400, "senha", MSG.senhaVazia);
    }

    const reserva = await reservarProfessor(balde, agora);
    if (reserva.bloqueadoAte) return bloqueadoProfessor(minutosRestantes(reserva.bloqueadoAte, agora));

    if (await senhaProfessorConfere(senha)) {
      await liberarProfessor(balde, reserva, agora);
      return ok({
        token: await tokenProfessor(await versaoProfessor()),
        dispositivo: balde === "disp" ? corpo.dispositivo : await novoDispositivo(),
      });
    }
    if (reserva.ultima) return bloqueadoProfessor(minutosRestantes(agora + BLOQUEIO_MS, agora));
    return erro(401, "senha", MSG.senhaProfessor);
  }

  // Resumo de um aluno para a lista: lê só os metadados (pequenos). Registro antigo, sem
  // resumo nos metadados, é lido inteiro.
  async function lerResumo(chave) {
    if (temMeta) {
      const m = await store.getMeta(chave);
      if (m && objetoSimples(m.metadata) && m.metadata.v === 1) return m.metadata;
    }
    const reg = await store.get(chave);
    return objetoSimples(reg) ? metaAluno(reg) : null;
  }

  async function professorAlunos() {
    const chaves = (await store.list(PREFIXO_ALUNOS)).filter((k) => typeof k === "string" && CHAVE_ALUNO_RE.test(k));
    const lidos = [];
    for (let i = 0; i < chaves.length; i += 20) {
      const lote = chaves.slice(i, i + 20);
      const metas = await Promise.all(lote.map((k) => lerResumo(k)));
      metas.forEach((m, j) => {
        if (m) lidos.push([lote[j], m]);
      });
    }
    const agora = now();
    const ordem = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
    const alunos = lidos
      .map(([chave, m]) => resumoDe(chave, m, agora))
      .sort(
        (a, b) =>
          ordem.compare(String(a.turmaKey ?? ""), String(b.turmaKey ?? "")) ||
          ordem.compare(String(a.nome ?? ""), String(b.nome ?? "")) ||
          (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
      );
    return ok({ alunos });
  }

  // Detalhe: o resumo, os parágrafos da atividade aberta (compatibilidade) e os textos de cada atividade.
  // GET ?id=<id> ou POST {id}.
  async function professorAluno({ url, corpo }) {
    const id = url.searchParams.has("id") ? url.searchParams.get("id") : corpo.id;
    if (!idValido(id)) return erro(400, "id");
    const chave = PREFIXO_ALUNOS + id;
    const reg = await store.get(chave);
    if (!objetoSimples(reg)) return erro(404, "aluno");
    return ok({ aluno: { ...resumoAluno(chave, reg, now()), paras: parasDe(reg), textos: textosDe(reg) } });
  }

  // "Apagar senha": a senha antiga deixa de valer (e os tokens também) e o servidor cria uma
  // senha nova de 6 números, que só o professor vê e entrega ao aluno. Não fica nenhum momento
  // "sem senha" em que a primeira pessoa que digitar o nome do aluno toma a conta dele.
  async function professorRedefinir({ corpo }) {
    if (!idValido(corpo.id)) return erro(400, "id");
    const pin = novoPin();
    const pinSalt = novoSalt();
    const pinHash = await scryptHex(pin, pinSalt);
    const feito = await atualizar(
      PREFIXO_ALUNOS + corpo.id,
      (r) => ({
        ...r,
        pinSalt,
        pinHash,
        pinVersao: (Number(r.pinVersao) || 0) + 1,
        falhas: 0,
        bloqueadoAte: 0,
      }),
      { forcar: true },
    );
    if (!feito) return erro(404, "aluno");
    return ok({ pin });
  }

  async function professorApagar({ corpo }) {
    if (!idValido(corpo.id)) return erro(400, "id");
    await store.del(PREFIXO_ALUNOS + corpo.id);
    return ok();
  }

  async function professorSenha({ corpo }) {
    const agora = now();
    const atual = typeof corpo.atual === "string" ? corpo.atual.trim() : "";
    if (!atual) return erro(403, "senha", MSG.senhaAtual);
    // Erros da senha atual contam no mesmo limite do login (10 erros → 15 minutos).
    const reserva = await reservarProfessor("geral", agora);
    if (reserva.bloqueadoAte) return bloqueadoProfessor(minutosRestantes(reserva.bloqueadoAte, agora));
    if (!(await senhaProfessorConfere(atual))) {
      if (reserva.ultima) return bloqueadoProfessor(minutosRestantes(agora + BLOQUEIO_MS, agora));
      return erro(403, "senha", MSG.senhaAtual);
    }
    await liberarProfessor("geral", reserva, agora);
    const nova = typeof corpo.nova === "string" ? corpo.nova.trim() : "";
    const tamanho = Array.from(nova).length;
    if (tamanho < 6 || tamanho > 60) return erro(400, "nova", MSG.senhaNova);
    const salt = novoSalt();
    const hash = await scryptHex(nova, salt);
    let versao = 1;
    await atualizar(
      CHAVE_PROFESSOR,
      (p) => {
        versao = (objetoSimples(p) && Number.isInteger(p.versao) ? p.versao : 0) + 1;
        return { salt, hash, versao };
      },
      { criar: true },
    );
    return ok({ token: await tokenProfessor(versao) });
  }

  // ---- lista de alunos (séries) ---------------------------------------------

  // Pública (a tela de entrada do jogo monta a escolha da série): sem nomes de alunos.
  async function turmasPublicas() {
    const { turmas } = await carregarTurmas();
    return ok({ turmas: turmas.map((s) => ({ key: s.key, label: s.label, total: s.alunos.length })) });
  }

  // Para o professor: as listas, os nomes do perfil de teste (coringas) e se a senha inicial do perfil
  // (CORINGA_SENHA) está configurada e no formato certo. O valor da variável nunca sai daqui.
  // coringaSenhaInvalida: a variável existe mas está fora do formato (aí o perfil de teste não é criado).
  function infoCoringa() {
    const estado = senhaCoringa().estado;
    return { coringas: coringas(), coringaSenha: estado === "ok", ...(estado === "invalida" ? { coringaSenhaInvalida: true } : {}) };
  }

  async function professorTurmas() {
    const { fonte, turmas } = await carregarTurmas();
    return ok({ fonte, turmas, ...infoCoringa() });
  }

  async function professorSalvarTurmas({ corpo }) {
    const r = sanitizarTurmas(corpo.turmas, { estrito: true });
    if (r.erro) return erro(400, "turmas", r.erro);
    await gravar(CHAVE_TURMAS, { v: 1, turmas: r.turmas, atualizadoEm: now() });
    return ok({ fonte: "painel", turmas: r.turmas, ...infoCoringa() });
  }

  // ---- roteamento ---------------------------------------------------------

  // caminho → {GET?: fn, POST?: fn, professor?: true}
  const ROTAS = {
    "/api/entrar": { POST: entrar },
    "/api/estado": { POST: estado },
    "/api/salvar": { POST: salvar },
    "/api/turmas": { GET: turmasPublicas },
    "/api/professor/entrar": { POST: professorEntrar },
    "/api/professor/alunos": { GET: professorAlunos, professor: true },
    "/api/professor/aluno": { GET: professorAluno, POST: professorAluno, professor: true },
    "/api/professor/redefinir": { POST: professorRedefinir, professor: true },
    "/api/professor/apagar": { POST: professorApagar, professor: true },
    "/api/professor/senha": { POST: professorSenha, professor: true },
    "/api/professor/turmas": { GET: professorTurmas, POST: professorSalvarTurmas, professor: true },
  };

  return async function api(req) {
    try {
      const url = new URL(req.url, "http://localhost");
      const caminho = url.pathname.replace(/\/+$/, "") || "/";
      const rota = Object.prototype.hasOwnProperty.call(ROTAS, caminho) ? ROTAS[caminho] : null;
      if (!rota) return erro(404, "rota");
      const metodos = ["GET", "POST"].filter((m) => typeof rota[m] === "function");
      if (!metodos.includes(req.method)) return erro(405, "metodo", undefined, {}, { allow: metodos.join(", ") });
      if (rota.professor && !(await professorAutenticado(req))) return erro(401, "sessao", MSG.sessaoProfessor);
      let corpo = {};
      if (req.method === "POST") {
        try {
          corpo = await lerCorpoJson(req);
        } catch (e) {
          if (e instanceof ErroCorpo) return e.resposta;
          throw e;
        }
      }
      return await rota[req.method]({ req, url, corpo });
    } catch (e) {
      if (e instanceof ErroOcupado) return erro(503, "ocupado");
      console.error("[missao-redacao] erro na API:", e);
      return erro(500, "interno");
    }
  };
}
