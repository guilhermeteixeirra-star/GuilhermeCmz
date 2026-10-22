// Testes da API (node:test). Rodar: node --test tests/
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { scryptSync, randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createApi, normalizarNome, normalizarTurma, normalizarPin } from "../src/core.mjs";
import { MemoryStore } from "../dev/memory-store.mjs";

const MIN = 60 * 1000;
const DIA = 24 * 60 * MIN;
const SENHA_TESTE = "senha-de-teste-123";

// Senha inicial do professor (hash SETUP): lida do arquivo em tempo de execução,
// nunca escrita no código. Se o arquivo não existir, o teste correspondente é pulado.
const ARQUIVO_SENHA =
  process.env.MR_SENHA_PROFESSOR_ARQUIVO || fileURLToPath(new URL("../../senha-professor.txt", import.meta.url));

function ambiente({ store = new MemoryStore(), inicio = Date.UTC(2026, 9, 1, 12, 0, 0) } = {}) {
  let agora = inicio;
  const api = createApi({ store, now: () => agora });

  async function chamar(metodo, caminho, corpo, { headers = {}, bruto = false, token } = {}) {
    const init = { method: metodo, headers: { ...headers } };
    if (token) init.headers.authorization = `Bearer ${token}`;
    if (corpo !== undefined) {
      init.body = bruto ? corpo : JSON.stringify(corpo);
      if (!Object.keys(init.headers).some((k) => k.toLowerCase() === "content-type")) {
        init.headers["content-type"] = "application/json";
      }
    }
    const res = await api(new Request("http://teste.local" + caminho, init));
    const texto = await res.text();
    let json = null;
    try {
      json = JSON.parse(texto);
    } catch {
      /* fica null */
    }
    return { status: res.status, json, headers: res.headers, texto };
  }

  return {
    store,
    api,
    chamar,
    avancar: (ms) => {
      agora += ms;
    },
    agora: () => agora,
    entrar: (nome, turma, pin) => chamar("POST", "/api/entrar", { nome, turma, pin }),
  };
}

// Grava config/professor com uma senha conhecida só dos testes.
async function semearProfessor(store, senha = SENHA_TESTE, versao = 0) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(senha, salt, 32, { N: 16384, r: 8, p: 1 }).toString("hex");
  await store.set("config/professor", { salt, hash, versao });
}

async function ambienteProfessor() {
  const amb = ambiente();
  await semearProfessor(amb.store);
  const r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
  assert.equal(r.status, 200, r.texto);
  return { ...amb, tokenProf: r.json.token };
}

function chavesSeguras(store) {
  for (const k of store.keys()) {
    assert.match(k, /^(alunos\/[a-z0-9-]+\/[a-z0-9-]+|config\/(segredo|professor|professor-falhas))$/, `chave inesperada: ${k}`);
  }
}

// ---------------------------------------------------------------------------

describe("normalização", () => {
  test("turma: variações da mesma turma viram a mesma chave", () => {
    for (const t of ["2º B", "2 b", "2ª série B", "2B", "2ª Série b", "  2º   B ", "2° B", "2a série B", "2º ano B", "Turma 2B"]) {
      assert.equal(normalizarTurma(t)?.turmaKey, "2b", t);
    }
    assert.equal(normalizarTurma("2A").turmaKey, "2a");
    assert.equal(normalizarTurma("2º A").turmaKey, "2a");
    assert.equal(normalizarTurma("2º B").turma, "2º B");
    assert.equal(normalizarTurma("série"), null);
    assert.equal(normalizarTurma("   "), null);
    assert.equal(normalizarTurma("../.."), null);
    assert.equal(normalizarTurma(42), null);
    assert.equal(normalizarTurma("2º B integral de agro manhã").turma.length <= 20, true);
  });

  test("nome: acentos, maiúsculas e espaços não mudam a chave", () => {
    assert.deepEqual(normalizarNome("  João   da Silva "), { nome: "João da Silva", nomeKey: "joao-da-silva" });
    assert.equal(normalizarNome("JOÃO DA SILVA").nomeKey, "joao-da-silva");
    assert.equal(normalizarNome("Joao da Silva").nomeKey, "joao-da-silva");
    assert.equal(normalizarNome("Conceição Araújo").nomeKey, "conceicao-araujo");
    assert.equal(normalizarNome("A".repeat(50) + " " + "B".repeat(50)).nome.length, 60);
  });

  test("nome: exige nome e sobrenome (2 palavras com letras)", () => {
    for (const n of ["João", "  João  ", "João 2", "1 2", "", "-- --", "../ ..", null, 7]) {
      assert.equal(normalizarNome(n), null, String(n));
    }
    assert.ok(normalizarNome("Ana Silva"));
  });

  test("chaves só têm [a-z0-9-]", () => {
    assert.equal(normalizarNome("../../config/segredo x").nomeKey, "config-segredo-x");
    assert.match(normalizarNome("Ñandú O'Brien/../x").nomeKey, /^[a-z0-9-]+$/);
    assert.match(normalizarTurma("2/../B").turmaKey, /^[a-z0-9]+$/);
  });

  test("pin: exatamente 4 números", () => {
    assert.equal(normalizarPin("1234"), "1234");
    assert.equal(normalizarPin("0007"), "0007");
    for (const p of ["123", "12345", "abcd", "12a4", "", null, undefined, "١٢٣٤"]) assert.equal(normalizarPin(p), null, String(p));
  });
});

describe("aluno: entrar", () => {
  test("cadastro novo devolve token e estado vazio", async () => {
    const amb = ambiente();
    const r = await amb.entrar("Maria Souza", "2º B", "1234");
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("content-type"), "application/json; charset=utf-8");
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal(r.json.ok, true);
    assert.equal(r.json.novo, true);
    assert.equal(typeof r.json.token, "string");
    assert.deepEqual(r.json.aluno, { id: "2b/maria-souza", nome: "Maria Souza", turma: "2º B" });
    assert.equal(r.json.estado, null);
    assert.equal(r.json.atualizadoEm, null);

    const reg = await amb.store.get("alunos/2b/maria-souza");
    assert.equal(reg.id, "2b/maria-souza");
    assert.equal(reg.turmaKey, "2b");
    assert.equal(reg.nomeKey, "maria-souza");
    assert.match(reg.pinHash, /^[0-9a-f]{64}$/);
    assert.match(reg.pinSalt, /^[0-9a-f]{32}$/);
    assert.notEqual(reg.pinHash, "1234");
    assert.deepEqual(reg.paras, ["", "", "", ""]);
    assert.equal(reg.falhas, 0);
    assert.equal(reg.criadoEm, amb.agora());
    assert.ok(!JSON.stringify(reg).includes('"1234"'));

    const seg = await amb.store.get("config/segredo");
    assert.match(seg.valor, /^[0-9a-f]{64}$/);
  });

  test("mesma pessoa com turma escrita de outro jeito cai no mesmo registro", async () => {
    const amb = ambiente();
    const a = await amb.entrar("Maria Souza", "2º B", "1234");
    const b = await amb.entrar("maria  souza", "2 b", "1234");
    const c = await amb.entrar("MARIA SOUZA", "2ª série B", "1234");
    assert.equal(a.json.novo, true);
    for (const r of [b, c]) {
      assert.equal(r.status, 200);
      assert.equal(r.json.novo, false);
      assert.equal(r.json.aluno.id, "2b/maria-souza");
      assert.equal(r.json.aluno.nome, "Maria Souza"); // nome exibido do cadastro
      assert.equal(r.json.aluno.turma, "2º B");
    }
    assert.equal((await amb.store.list("alunos/")).length, 1);
  });

  test("validação: nome, turma e pin com mensagens em português", async () => {
    const amb = ambiente();
    let r = await amb.entrar("Maria", "2º B", "1234");
    assert.equal(r.status, 400);
    assert.deepEqual([r.json.ok, r.json.erro, r.json.msg], [false, "nome", "Escreva seu nome e sobrenome."]);
    r = await amb.entrar("Maria Souza", "  ", "1234");
    assert.deepEqual([r.status, r.json.erro, r.json.msg], [400, "turma", "Escreva a sua turma. Exemplo: 2º B."]);
    for (const pin of ["123", "12345", "abcd", "", 12]) {
      r = await amb.entrar("Maria Souza", "2º B", pin);
      assert.deepEqual([r.status, r.json.erro, r.json.msg], [400, "pin", "A senha tem que ter 4 números."], String(pin));
    }
    r = await amb.chamar("POST", "/api/entrar", {});
    assert.equal(r.json.erro, "nome");
    assert.equal((await amb.store.list("alunos/")).length, 0);
  });

  test("PIN certo entra; PIN errado devolve 401 com restantes", async () => {
    const amb = ambiente();
    await amb.entrar("Maria Souza", "2º B", "1234");
    let r = await amb.entrar("Maria Souza", "2º B", "9999");
    assert.equal(r.status, 401);
    assert.equal(r.json.erro, "senha");
    assert.equal(r.json.restantes, 4);
    assert.match(r.json.msg, /^Senha errada\. Confira os 4 números\./);
    assert.match(r.json.msg, /segundo sobrenome/);
    r = await amb.entrar("Maria Souza", "2º B", "9999");
    assert.equal(r.json.restantes, 3);
    r = await amb.entrar("Maria Souza", "2º B", "1234");
    assert.equal(r.status, 200);
    assert.equal(r.json.novo, false);
    assert.equal(r.json.senhaNova, undefined);
    assert.equal((await amb.store.get("alunos/2b/maria-souza")).falhas, 0, "acertar zera as falhas");
  });

  test("5 erros bloqueiam por 15 minutos; depois libera", async () => {
    const amb = ambiente();
    await amb.entrar("Maria Souza", "2º B", "1234");
    for (let i = 1; i <= 4; i++) {
      const r = await amb.entrar("Maria Souza", "2º B", "0000");
      assert.equal(r.status, 401);
      assert.equal(r.json.restantes, 5 - i);
    }
    let r = await amb.entrar("Maria Souza", "2º B", "0000");
    assert.equal(r.status, 429);
    assert.equal(r.json.erro, "bloqueado");
    assert.equal(r.json.minutos, 15);
    assert.equal(r.json.msg, "Muitas tentativas erradas. Espere 15 minutos ou peça ajuda ao professor.");

    // Bloqueado: nem o PIN certo entra.
    r = await amb.entrar("Maria Souza", "2º B", "1234");
    assert.equal(r.status, 429);
    amb.avancar(14 * MIN + 30 * 1000);
    r = await amb.entrar("Maria Souza", "2º B", "1234");
    assert.equal(r.status, 429);
    assert.equal(r.json.minutos, 1);
    assert.equal(r.json.msg, "Muitas tentativas erradas. Espere 1 minuto ou peça ajuda ao professor.");

    amb.avancar(31 * 1000);
    r = await amb.entrar("Maria Souza", "2º B", "1234");
    assert.equal(r.status, 200);
    const reg = await amb.store.get("alunos/2b/maria-souza");
    assert.equal(reg.falhas, 0);
    assert.equal(reg.bloqueadoAte, 0);
  });

  test("corrida no cadastro: quem chega depois segue o fluxo de registro existente", async () => {
    const amb = ambiente();
    const [a, b] = await Promise.all([amb.entrar("Maria Souza", "2º B", "1234"), amb.entrar("Maria Souza", "2º B", "1234")]);
    assert.deepEqual([a.status, b.status], [200, 200]);
    assert.deepEqual([a.json.novo, b.json.novo].sort(), [false, true]);
    assert.equal(a.json.token, b.json.token);
  });
});

describe("aluno: salvar e estado", () => {
  test("ida e volta do estado, parágrafos e resumo", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2º B", "1234")).json;

    let r = await amb.chamar("POST", "/api/estado", { token });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json, { ok: true, estado: null, paras: ["", "", "", ""], atualizadoEm: amb.agora() });

    amb.avancar(5 * MIN);
    const estado = { fase: 3, passo: 2, escolhas: { a: 1 }, texto: "ção ü" };
    r = await amb.chamar("POST", "/api/salvar", {
      token,
      estado,
      paras: ["Intro", "Arg 1", "x".repeat(5000), 42, "sobra"],
      resumo: { fases: 3, xp: 120.4, nivel: "Escritor", linhas: "12", etapa: "Fase 3 ".repeat(40), extra: "ignorar" },
    });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json, { ok: true, atualizadoEm: amb.agora() });

    r = await amb.chamar("POST", "/api/estado", { token });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.estado, estado);
    assert.equal(r.json.paras.length, 4);
    assert.deepEqual(r.json.paras.slice(0, 2), ["Intro", "Arg 1"]);
    assert.equal(r.json.paras[2].length, 4000);
    assert.equal(r.json.paras[3], "");
    assert.equal(r.json.atualizadoEm, amb.agora());

    const reg = await amb.store.get("alunos/2b/maria-souza");
    assert.deepEqual(Object.keys(reg.resumo).sort(), ["etapa", "fases", "linhas", "nivel", "xp"]);
    assert.equal(reg.resumo.fases, 3);
    assert.equal(reg.resumo.xp, 120);
    assert.equal(reg.resumo.nivel, "Escritor");
    assert.equal(reg.resumo.linhas, 12);
    assert.ok(reg.resumo.etapa.length <= 80);

    // Entrar de novo (outro celular) traz o estado salvo.
    r = await amb.entrar("Maria Souza", "2º B", "1234");
    assert.deepEqual(r.json.estado, estado);
    assert.equal(r.json.atualizadoEm, amb.agora());
  });

  test("salvar sem paras/resumo mantém os anteriores", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2º B", "1234")).json;
    await amb.chamar("POST", "/api/salvar", { token, estado: { v: 1 }, paras: ["a", "b", "c", "d"], resumo: { fases: 2 } });
    const r = await amb.chamar("POST", "/api/salvar", { token, estado: { v: 2 } });
    assert.equal(r.status, 200);
    const reg = await amb.store.get("alunos/2b/maria-souza");
    assert.deepEqual(reg.estado, { v: 2 });
    assert.deepEqual(reg.paras, ["a", "b", "c", "d"]);
    assert.equal(reg.resumo.fases, 2);
  });

  test("estado precisa ser objeto e ter no máximo ~250 KB", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2º B", "1234")).json;
    for (const estado of [null, [1, 2], "texto", 5, undefined]) {
      const r = await amb.chamar("POST", "/api/salvar", { token, estado, paras: [] });
      assert.equal(r.status, 400, JSON.stringify(estado));
      assert.equal(r.json.erro, "estado");
    }
    const r = await amb.chamar("POST", "/api/salvar", { token, estado: { grande: "x".repeat(260 * 1024) } });
    assert.equal(r.status, 413);
    assert.equal(r.json.erro, "grande");
  });

  test("corpo maior que 300 KB → 413", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2º B", "1234")).json;
    const corpo = JSON.stringify({ token, estado: { x: "y".repeat(301 * 1024) } });
    let r = await amb.chamar("POST", "/api/salvar", corpo, { bruto: true });
    assert.equal(r.status, 413);
    assert.equal(r.json.ok, false);
    assert.equal(r.json.erro, "grande");
    assert.equal(typeof r.json.msg, "string");

    // Sem content-length (stream): também corta.
    const enc = new TextEncoder().encode(corpo);
    const stream = new ReadableStream({
      start(c) {
        for (let i = 0; i < enc.length; i += 64 * 1024) c.enqueue(enc.slice(i, i + 64 * 1024));
        c.close();
      },
    });
    const res = await amb.api(new Request("http://teste.local/api/salvar", { method: "POST", body: stream, duplex: "half" }));
    assert.equal(res.status, 413);
  });

  test("aceita corpo text/plain (navigator.sendBeacon)", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2º B", "1234")).json;
    const r = await amb.chamar("POST", "/api/salvar", JSON.stringify({ token, estado: { beacon: true }, paras: ["p1", "", "", ""] }), {
      bruto: true,
      headers: { "content-type": "text/plain;charset=UTF-8" },
    });
    assert.equal(r.status, 200);
    assert.deepEqual((await amb.store.get("alunos/2b/maria-souza")).estado, { beacon: true });
  });

  test("token adulterado → 401 sessao", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2º B", "1234")).json;
    await amb.entrar("Pedro Lima", "2º B", "4321");
    const [idB64, versao, assinatura] = token.split(".");
    assert.equal(Buffer.from(idB64, "base64url").toString(), "2b/maria-souza");

    const outroId = Buffer.from("2b/pedro-lima").toString("base64url");
    const viraFora = Buffer.from("../config/segredo").toString("base64url");
    const outraAssinatura = (assinatura[0] === "a" ? "b" : "a") + assinatura.slice(1);
    const ruins = [
      `${outroId}.${versao}.${assinatura}`, // id trocado
      `${idB64}.${Number(versao) + 1}.${assinatura}`, // versão trocada
      `${idB64}.0${versao}.${assinatura}`, // versão com zero à esquerda
      `${idB64}.${versao}.${outraAssinatura}`, // assinatura errada
      `${viraFora}.${versao}.${assinatura}`,
      `${idB64}.${versao}`,
      `${token}.x`,
      "",
      "lixo",
      null,
      12345,
    ];
    for (const t of ruins) {
      for (const rota of ["/api/estado", "/api/salvar"]) {
        const r = await amb.chamar("POST", rota, { token: t, estado: { hack: 1 } });
        assert.equal(r.status, 401, `${rota} ${t}`);
        assert.equal(r.json.erro, "sessao");
        assert.equal(r.json.msg, "Sua entrada expirou. Entre de novo com seu nome e senha.");
      }
    }
    assert.equal((await amb.store.get("alunos/2b/pedro-lima")).estado, null);
    assert.equal((await amb.store.get("alunos/2b/maria-souza")).estado, null);

    // Token de outro servidor (segredo diferente) não vale.
    const outro = ambiente();
    const tokenOutro = (await outro.entrar("Maria Souza", "2º B", "1234")).json.token;
    const r = await amb.chamar("POST", "/api/estado", { token: tokenOutro });
    assert.equal(r.status, 401);

    // O token certo continua valendo.
    assert.equal((await amb.chamar("POST", "/api/estado", { token })).status, 200);
    chavesSeguras(amb.store);
  });

  test("chaves nunca saem do prefixo alunos/", async () => {
    const amb = ambiente();
    const r = await amb.entrar("../../config/segredo x", "../2B/..", "1234");
    assert.equal(r.status, 200);
    assert.equal(r.json.aluno.id, "2b/config-segredo-x");
    await amb.entrar("a/b c/d", "2º B", "1234");
    await amb.entrar("José \u0000 da Silva", "2º\nB", "1234");
    chavesSeguras(amb.store);
  });
});

describe("professor", () => {
  test("entra com a senha inicial (hash SETUP)", { skip: !existsSync(ARQUIVO_SENHA) && "arquivo da senha inicial ausente" }, async () => {
    const senha = readFileSync(ARQUIVO_SENHA, "utf8").trim();
    const amb = ambiente();
    let r = await amb.chamar("POST", "/api/professor/entrar", { senha });
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true);
    assert.match(r.json.token, /^p\.\d+\.0\.[0-9a-f]{64}$/);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: r.json.token });
    assert.equal(r.status, 200);

    // Senha errada.
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: senha + "x" });
    assert.deepEqual([r.status, r.json.erro, r.json.msg], [401, "senha", "Senha errada."]);

    // Depois de trocar, a senha inicial deixa de valer.
    const tk = (await amb.chamar("POST", "/api/professor/entrar", { senha })).json.token;
    r = await amb.chamar("POST", "/api/professor/senha", { atual: senha, nova: "nova-senha-legal" }, { token: tk });
    assert.equal(r.status, 200);
    r = await amb.chamar("POST", "/api/professor/entrar", { senha });
    assert.equal(r.status, 401);
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: "nova-senha-legal" });
    assert.equal(r.status, 200);
  });

  test("sem config/professor, outra senha não entra", async () => {
    const amb = ambiente();
    const r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
    assert.equal(r.status, 401);
    const vazio = await amb.chamar("POST", "/api/professor/entrar", { senha: "" });
    assert.equal(vazio.status, 400);
  });

  test("10 erros bloqueiam o login do professor por 15 minutos", async () => {
    const amb = ambiente();
    await semearProfessor(amb.store);
    for (let i = 1; i <= 9; i++) {
      const r = await amb.chamar("POST", "/api/professor/entrar", { senha: "errada-" + i });
      assert.equal(r.status, 401, `tentativa ${i}`);
    }
    let r = await amb.chamar("POST", "/api/professor/entrar", { senha: "errada-10" });
    assert.equal(r.status, 429);
    assert.equal(r.json.erro, "bloqueado");
    assert.equal(r.json.minutos, 15);
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
    assert.equal(r.status, 429, "bloqueado mesmo com a senha certa");
    amb.avancar(15 * MIN + 1);
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
    assert.equal(r.status, 200);
    assert.deepEqual(await amb.store.get("config/professor-falhas"), { falhas: 0, bloqueadoAte: 0 });
  });

  test("rotas do professor exigem token válido e não vencido", async () => {
    const amb = await ambienteProfessor();
    const rotas = [
      ["GET", "/api/professor/alunos"],
      ["GET", "/api/professor/aluno?id=2b/x-y"],
      ["POST", "/api/professor/redefinir", { id: "2b/x-y" }],
      ["POST", "/api/professor/apagar", { id: "2b/x-y" }],
      ["POST", "/api/professor/senha", { atual: SENHA_TESTE, nova: "outra-senha" }],
    ];
    const partes = amb.tokenProf.split(".");
    const ruins = [
      undefined,
      "lixo",
      `p.${Number(partes[1]) + DIA}.${partes[2]}.${partes[3]}`, // validade esticada
      `p.${partes[1]}.${Number(partes[2]) + 1}.${partes[3]}`, // versão trocada
      `p.${partes[1]}.${partes[2]}.${"0".repeat(64)}`,
    ];
    for (const [metodo, caminho, corpo] of rotas) {
      for (const t of ruins) {
        const r = await amb.chamar(metodo, caminho, corpo, { token: t });
        assert.equal(r.status, 401, `${caminho} ${t}`);
        assert.equal(r.json.erro, "sessao");
      }
    }
    // "Bearer" sem diferenciar maiúsculas.
    let r = await amb.chamar("GET", "/api/professor/alunos", undefined, { headers: { authorization: `bearer ${amb.tokenProf}` } });
    assert.equal(r.status, 200);
    // Vence em 7 dias.
    amb.avancar(7 * DIA - 1000);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    amb.avancar(1000);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 401);
    assert.equal(r.json.erro, "sessao");
  });

  test("lista de alunos: ordem por turma e nome, campos do resumo", async () => {
    const amb = await ambienteProfessor();
    const z = (await amb.entrar("Zeca Pagodinho", "2º B", "1111")).json.token;
    await amb.entrar("Ana Clara", "2º B", "2222");
    await amb.entrar("Érica Alves", "2b", "3333");
    await amb.entrar("Bruno Dias", "2º A", "4444");
    await amb.entrar("Carla Melo", "10º A", "5555");
    await amb.entrar("Davi Rocha", "2º A", "6666");

    amb.avancar(MIN);
    await amb.chamar("POST", "/api/salvar", {
      token: z,
      estado: { fim: true },
      paras: ["Introdução.", "", "", ""],
      resumo: { fases: 7, xp: 900, nivel: 5, linhas: 28, etapa: "fim" },
    });
    // Davi fica bloqueado.
    for (let i = 0; i < 5; i++) await amb.entrar("Davi Rocha", "2º A", "0000");

    const r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true);
    const nomes = r.json.alunos.map((a) => `${a.turmaKey}:${a.nome}`);
    assert.deepEqual(nomes, ["2a:Bruno Dias", "2a:Davi Rocha", "2b:Ana Clara", "2b:Érica Alves", "2b:Zeca Pagodinho", "10a:Carla Melo"]);

    const zeca = r.json.alunos.find((a) => a.nome === "Zeca Pagodinho");
    assert.deepEqual(Object.keys(zeca).sort(), [
      "atualizadoEm",
      "bloqueado",
      "concluiu",
      "criadoEm",
      "etapa",
      "fases",
      "id",
      "linhas",
      "nivel",
      "nome",
      "semSenha",
      "temRedacao",
      "turma",
      "turmaKey",
      "xp",
    ]);
    assert.deepEqual(
      { ...zeca, criadoEm: 0 },
      {
        id: "2b/zeca-pagodinho",
        nome: "Zeca Pagodinho",
        turma: "2º B",
        turmaKey: "2b",
        fases: 7,
        xp: 900,
        nivel: 5,
        linhas: 28,
        etapa: "fim",
        concluiu: true,
        temRedacao: true,
        semSenha: false,
        bloqueado: false,
        criadoEm: 0,
        atualizadoEm: amb.agora(),
      },
    );
    const ana = r.json.alunos.find((a) => a.nome === "Ana Clara");
    assert.equal(ana.concluiu, false);
    assert.equal(ana.temRedacao, false);
    assert.equal(ana.fases, 0);
    const davi = r.json.alunos.find((a) => a.nome === "Davi Rocha");
    assert.equal(davi.bloqueado, true);
    assert.ok(!("paras" in zeca) && !("pinHash" in zeca) && !("estado" in zeca), "lista não expõe dados sensíveis");
  });

  test("lista lê muitos alunos (lotes de 20)", async () => {
    const amb = await ambienteProfessor();
    const nomes = ["Ana", "Bia", "Caio", "Davi", "Edu", "Fabi", "Gil"];
    for (let i = 0; i < 45; i++) {
      await amb.store.set(`alunos/2b/aluno-${i}`, {
        id: `2b/aluno-${i}`,
        nome: `${nomes[i % 7]} Teste${i}`,
        turma: "2º B",
        turmaKey: "2b",
        nomeKey: `aluno-${i}`,
        pinSalt: "00",
        pinHash: "00",
        pinVersao: 1,
        falhas: 0,
        bloqueadoAte: 0,
        estado: null,
        paras: ["", "", "", ""],
        resumo: { fases: 0, xp: 0, nivel: 0, linhas: 0, etapa: "" },
        criadoEm: 1,
        atualizadoEm: 1,
      });
    }
    await amb.store.set("alunos/../config", { lixo: true }); // chave estranha é ignorada
    const r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.json.alunos.length, 45);
  });

  test("detalhe do aluno traz os parágrafos", async () => {
    const amb = await ambienteProfessor();
    const { token } = (await amb.entrar("Maria Souza", "2º B", "1234")).json;
    await amb.chamar("POST", "/api/salvar", { token, estado: {}, paras: ["Um.", "Dois.", "Três.", "Quatro."], resumo: { fases: 4 } });
    let r = await amb.chamar("GET", "/api/professor/aluno?id=" + encodeURIComponent("2b/maria-souza"), undefined, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.equal(r.json.aluno.id, "2b/maria-souza");
    assert.equal(r.json.aluno.nome, "Maria Souza");
    assert.equal(r.json.aluno.fases, 4);
    assert.equal(r.json.aluno.temRedacao, true);
    assert.deepEqual(r.json.aluno.paras, ["Um.", "Dois.", "Três.", "Quatro."]);
    assert.ok(!("pinHash" in r.json.aluno) && !("pinSalt" in r.json.aluno));

    r = await amb.chamar("GET", "/api/professor/aluno?id=2b/nao-existe", undefined, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json.erro], [404, "aluno"]);
    for (const id of ["", "../config/segredo", "2b/../x", "alunos/2b/maria-souza", "2B/maria-souza", "2b/maria souza", "a/b/c"]) {
      r = await amb.chamar("GET", "/api/professor/aluno?id=" + encodeURIComponent(id), undefined, { token: amb.tokenProf });
      assert.equal(r.status, 400, id);
      assert.equal(r.json.erro, "id");
    }
    r = await amb.chamar("GET", "/api/professor/aluno", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 400);
  });

  test("apagar a senha do aluno: ele cria outra e o progresso continua", async () => {
    const amb = await ambienteProfessor();
    const antigo = (await amb.entrar("Maria Souza", "2º B", "1234")).json.token;
    await amb.chamar("POST", "/api/salvar", { token: antigo, estado: { fase: 5 }, paras: ["Meu texto", "", "", ""], resumo: { fases: 5 } });
    // Deixa o aluno bloqueado para ver que a redefinição também desbloqueia.
    for (let i = 0; i < 5; i++) await amb.entrar("Maria Souza", "2º B", "0000");

    let r = await amb.chamar("POST", "/api/professor/redefinir", { id: "2b/maria-souza" }, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json], [200, { ok: true }]);
    let reg = await amb.store.get("alunos/2b/maria-souza");
    assert.equal(reg.pinHash, null);
    assert.equal(reg.falhas, 0);
    assert.equal(reg.bloqueadoAte, 0);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.json.alunos[0].semSenha, true);
    assert.equal(r.json.alunos[0].bloqueado, false);

    // O token antigo não vale mais.
    r = await amb.chamar("POST", "/api/estado", { token: antigo });
    assert.deepEqual([r.status, r.json.erro], [401, "sessao"]);
    r = await amb.chamar("POST", "/api/salvar", { token: antigo, estado: { fase: 0 } });
    assert.equal(r.status, 401);

    // Entra com um PIN novo e recebe o progresso de volta.
    r = await amb.entrar("Maria Souza", "2º B", "5678");
    assert.equal(r.status, 200);
    assert.equal(r.json.novo, false);
    assert.equal(r.json.senhaNova, true);
    assert.deepEqual(r.json.estado, { fase: 5 });
    const novoToken = r.json.token;
    assert.notEqual(novoToken, antigo);
    r = await amb.chamar("POST", "/api/estado", { token: novoToken });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.paras, ["Meu texto", "", "", ""]);

    // A senha nova passa a valer; a velha, não.
    assert.equal((await amb.entrar("Maria Souza", "2º B", "1234")).status, 401);
    assert.equal((await amb.entrar("Maria Souza", "2º B", "5678")).status, 200);
    reg = await amb.store.get("alunos/2b/maria-souza");
    assert.notEqual(reg.pinHash, null);

    // Toque duplo no "Entrar" depois de uma redefinição: as duas entradas funcionam.
    await amb.chamar("POST", "/api/professor/redefinir", { id: "2b/maria-souza" }, { token: amb.tokenProf });
    const duas = await Promise.all([amb.entrar("Maria Souza", "2º B", "2468"), amb.entrar("Maria Souza", "2º B", "2468")]);
    assert.deepEqual(
      duas.map((x) => x.status),
      [200, 200],
    );
    assert.equal(duas[0].json.token, duas[1].json.token);
    assert.deepEqual(duas.map((x) => Boolean(x.json.senhaNova)).sort(), [false, true]);

    r = await amb.chamar("POST", "/api/professor/redefinir", { id: "2b/nao-existe" }, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json.erro], [404, "aluno"]);
    r = await amb.chamar("POST", "/api/professor/redefinir", { id: "../config/segredo" }, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json.erro], [400, "id"]);
  });

  test("excluir aluno", async () => {
    const amb = await ambienteProfessor();
    const { token } = (await amb.entrar("Maria Souza", "2º B", "1234")).json;
    await amb.entrar("Pedro Lima", "2º B", "4321");
    let r = await amb.chamar("POST", "/api/professor/apagar", { id: "2b/maria-souza" }, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json], [200, { ok: true }]);
    assert.equal(await amb.store.get("alunos/2b/maria-souza"), null);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.deepEqual(
      r.json.alunos.map((a) => a.id),
      ["2b/pedro-lima"],
    );
    r = await amb.chamar("POST", "/api/estado", { token });
    assert.deepEqual([r.status, r.json.erro], [401, "sessao"]);
    r = await amb.chamar("POST", "/api/salvar", { token, estado: {} });
    assert.deepEqual([r.status, r.json.erro], [401, "sessao"]);
    assert.equal(await amb.store.get("alunos/2b/maria-souza"), null, "salvar não recria registro apagado");

    for (const id of ["../config/segredo", "alunos/2b/pedro-lima", "2b/../../config", "", null]) {
      r = await amb.chamar("POST", "/api/professor/apagar", { id }, { token: amb.tokenProf });
      assert.equal(r.status, 400, String(id));
    }
    // "config/segredo" tem o formato de id, mas vira a chave alunos/config/segredo: o segredo fica intacto.
    r = await amb.chamar("POST", "/api/professor/apagar", { id: "config/segredo" }, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.ok(await amb.store.get("config/segredo"));
    assert.ok(await amb.store.get("alunos/2b/pedro-lima"));
  });

  test("trocar a senha invalida os tokens antigos", async () => {
    const amb = await ambienteProfessor();
    const antigo = amb.tokenProf;
    let r = await amb.chamar("POST", "/api/professor/senha", { atual: "errada", nova: "nova-senha-1" }, { token: antigo });
    assert.deepEqual([r.status, r.json.erro], [403, "senha"]);
    for (const nova of ["12345", "x".repeat(61), "      ", 123456]) {
      r = await amb.chamar("POST", "/api/professor/senha", { atual: SENHA_TESTE, nova }, { token: antigo });
      assert.deepEqual([r.status, r.json.erro], [400, "nova"], String(nova));
    }
    r = await amb.chamar("POST", "/api/professor/senha", { atual: SENHA_TESTE, nova: "nova-senha-1" }, { token: antigo });
    assert.equal(r.status, 200);
    const novo = r.json.token;
    assert.match(novo, /^p\.\d+\.1\.[0-9a-f]{64}$/);
    const prof = await amb.store.get("config/professor");
    assert.equal(prof.versao, 1);
    assert.ok(!JSON.stringify(prof).includes("nova-senha-1"));

    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: antigo });
    assert.deepEqual([r.status, r.json.erro], [401, "sessao"]);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: novo });
    assert.equal(r.status, 200);

    assert.equal((await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE })).status, 401);
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: "nova-senha-1" });
    assert.equal(r.status, 200);
    assert.match(r.json.token, /^p\.\d+\.1\./);

    // Segunda troca: versão 2, tokens da versão 1 deixam de valer.
    r = await amb.chamar("POST", "/api/professor/senha", { atual: "nova-senha-1", nova: "nova-senha-2" }, { token: novo });
    assert.equal(r.status, 200);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: novo });
    assert.equal(r.status, 401);
  });
});

describe("HTTP", () => {
  test("rota desconhecida → 404", async () => {
    const amb = ambiente();
    for (const caminho of ["/api/nada", "/api", "/api/", "/api/professor", "/api/professor/alunos/x", "/api/constructor", "/api/__proto__"]) {
      const r = await amb.chamar("GET", caminho);
      assert.equal(r.status, 404, caminho);
      assert.deepEqual([r.json.ok, r.json.erro], [false, "rota"]);
      assert.equal(typeof r.json.msg, "string");
    }
  });

  test("barra no fim do caminho é aceita", async () => {
    const amb = ambiente();
    const r = await amb.chamar("POST", "/api/entrar/", { nome: "Maria Souza", turma: "2º B", pin: "1234" });
    assert.equal(r.status, 200);
  });

  test("método errado → 405", async () => {
    const amb = ambiente();
    for (const [metodo, caminho] of [
      ["GET", "/api/entrar"],
      ["PUT", "/api/salvar"],
      ["DELETE", "/api/estado"],
      ["POST", "/api/professor/alunos"],
      ["GET", "/api/professor/apagar"],
    ]) {
      const r = await amb.chamar(metodo, caminho);
      assert.equal(r.status, 405, `${metodo} ${caminho}`);
      assert.equal(r.json.erro, "metodo");
      assert.ok(r.headers.get("allow"));
    }
  });

  test("JSON inválido → 400", async () => {
    const amb = ambiente();
    for (const corpo of ["{nome:", "", "[1,2]", "null", '"texto"', "42"]) {
      const r = await amb.chamar("POST", "/api/entrar", corpo, { bruto: true });
      assert.equal(r.status, 400, JSON.stringify(corpo));
      assert.equal(r.json.erro, "json");
      assert.equal(r.headers.get("content-type"), "application/json; charset=utf-8");
    }
  });

  test("erro do store vira 500 em JSON", async () => {
    const quebrado = {
      get: async () => {
        throw new Error("falhou");
      },
      set: async () => ({ modified: true }),
      del: async () => {},
      list: async () => [],
    };
    const api = createApi({ store: quebrado });
    const erroOriginal = console.error;
    console.error = () => {};
    try {
      const res = await api(
        new Request("http://teste.local/api/entrar", {
          method: "POST",
          body: JSON.stringify({ nome: "Maria Souza", turma: "2º B", pin: "1234" }),
        }),
      );
      assert.equal(res.status, 500);
      assert.equal((await res.json()).erro, "interno");
    } finally {
      console.error = erroOriginal;
    }
  });

  test("segredo é criado uma vez só e reaproveitado", async () => {
    const store = new MemoryStore();
    const a = ambiente({ store });
    const t = (await a.entrar("Maria Souza", "2º B", "1234")).json.token;
    const seg = await store.get("config/segredo");
    const b = ambiente({ store }); // outra instância (como outra execução da função)
    const r = await b.chamar("POST", "/api/estado", { token: t });
    assert.equal(r.status, 200);
    assert.deepEqual(await store.get("config/segredo"), seg);
  });
});
