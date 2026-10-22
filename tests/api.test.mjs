// Testes da API (node:test). Rodar: node --test tests/
// Os nomes de alunos daqui são inventados. A lista de verdade NUNCA entra no repositório (ele é público):
// o teste "lista real" lê o arquivo fora do repositório em tempo de execução (e é pulado se ele não existir).
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { scryptSync, randomBytes } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  createApi,
  normalizarTurma,
  normalizarPin,
  nomeLista,
  chaveNome,
  encontrarNaLista,
  sanitizarTurmas,
  lerTurmasJson,
  sanitizarTextos,
  lerCoringas,
  lerSenhaCoringa,
  hashPin,
} from "../src/core.mjs";
import { MemoryStore } from "../dev/memory-store.mjs";

const MIN = 60 * 1000;
const DIA = 24 * 60 * MIN;
const SENHA_TESTE = "senha-de-teste-123";

// Senha inicial do professor (hash SETUP): lida do arquivo em tempo de execução,
// nunca escrita no código. Se o arquivo não existir, o teste correspondente é pulado.
const ARQUIVO_SENHA =
  process.env.MR_SENHA_PROFESSOR_ARQUIVO || fileURLToPath(new URL("../../senha-professor.txt", import.meta.url));
// Lista de alunos de verdade (fora do repositório).
const ARQUIVO_TURMAS = process.env.MR_TURMAS_ARQUIVO || fileURLToPath(new URL("../../turmas/turmas.json", import.meta.url));

// Lista de alunos inventada (o formato da variável TURMAS_ALUNOS).
const TURMAS_TESTE = [
  { label: "1ª Série", alunos: ["Bruno Dias", "Davi Rocha", "Ana Souza", "Lucas Prado Teixeira"] },
  {
    label: "2ª Série",
    alunos: [
      "Maria Souza",
      "Pedro Lima",
      "Zeca Pagodinho",
      "Ana Clara",
      "Érica Alves",
      "Bia Lima",
      "Vitima Silva",
      "Ana Souza",
      "Ana Paula Ribeiro Costa",
      "Ana Beatriz Ribeiro Lopes",
      "Maria Eduarda Aparecida dos Santos Oliveira de Souza Pereira Lima",
      "Maria Eduarda Aparecida dos Santos Oliveira de Souza Pereira Costa",
    ],
  },
  { label: "3ª Série", alunos: ["Carla Melo", "Ana Souza"] },
];

// extra: outras variáveis de ambiente (ALUNOS_CORINGA, CORINGA_SENHA). As que não estão lá não existem.
function envDe(texto, extra = {}) {
  return { get: (k) => (k === "TURMAS_ALUNOS" ? texto : Object.prototype.hasOwnProperty.call(extra, k) ? extra[k] : undefined) };
}

function ambiente({ store = new MemoryStore(), inicio = Date.UTC(2026, 9, 1, 12, 0, 0), turmas = TURMAS_TESTE, envTexto, aleatorio, envExtra } = {}) {
  let agora = inicio;
  const texto = envTexto !== undefined ? envTexto : JSON.stringify(turmas);
  const api = createApi({ store, now: () => agora, env: envDe(texto, envExtra), ...(aleatorio ? { randomBytes: aleatorio } : {}) });

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

async function ambienteProfessor(opcoes) {
  const amb = ambiente(opcoes);
  await semearProfessor(amb.store);
  const r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
  assert.equal(r.status, 200, r.texto);
  return { ...amb, tokenProf: r.json.token };
}

function chavesSeguras(store) {
  for (const k of store.keys()) {
    assert.match(k, /^(alunos\/[a-z0-9-]+\/[a-z0-9-]+|config\/(segredo|professor|professor-falhas|turmas))$/, `chave inesperada: ${k}`);
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

  test("série: o nome da série vira uma chave estável", () => {
    for (const [label, key] of [
      ["1ª Série", "1"],
      ["2ª Série", "2"],
      ["3ª Série", "3"],
      ["3ª série", "3"],
      ["1º ano", "1"],
      ["Segunda Série", "2"],
      ["2ª Série A", "2a"],
    ]) {
      assert.equal(normalizarTurma(label)?.turmaKey, key, label);
    }
  });

  test("série: palavras como 'constructor' não puxam nada de Object.prototype", () => {
    // Antes, ORDINAIS["constructor"] devolvia a função Object e a chave virava "functionbjectnativecode1".
    for (const [label, key] of [
      ["constructor 1", "constructor1"],
      ["1ª constructor", "1constructor"],
      ["Turma constructor", "constructor"],
      ["toString 3", "tostring3"],
    ]) {
      assert.equal(normalizarTurma(label)?.turmaKey, key, label);
    }
  });

  test("nomeLista: acentos, minúsculas, pontuação e espaços a mais", () => {
    assert.equal(nomeLista("Conceição Araújo"), "CONCEICAO ARAUJO");
    assert.equal(nomeLista("joão da silva"), "JOAO DA SILVA");
    assert.equal(nomeLista("João D'Ávila-Müller."), "JOAO D AVILA MULLER");
    assert.equal(nomeLista("  Ana \t  Souza\n "), "ANA SOUZA");
    assert.equal(nomeLista("Ñandú O’Brien, Jr."), "NANDU O BRIEN JR");
    assert.equal(nomeLista("Ana 2 Souza 3"), "ANA SOUZA");
    assert.equal(nomeLista("ÉRICA ALVES"), "ERICA ALVES");
    assert.equal(nomeLista("Érica Alves"), nomeLista("erica alves"));
    // NFKC: letras "de largura dupla" e ligaduras viram as letras comuns.
    assert.equal(nomeLista("Ａｎａ Ｓｏｕｚａ"), "ANA SOUZA");
    assert.equal(nomeLista("Raﬁ Souza"), "RAFI SOUZA");
    // Letra de outro alfabeto (homóglifo) não vira a letra latina.
    assert.equal(nomeLista("Аna Souza"), "NA SOUZA");
    for (const v of ["", "   ", "123", "--", null, undefined, 7, {}]) assert.equal(nomeLista(v), "", String(v));
  });

  test("chaveNome: minúsculas com hífen; só [a-z0-9-]", () => {
    assert.equal(chaveNome("JOAO D AVILA"), "joao-d-avila");
    assert.equal(chaveNome(nomeLista("../../config/segredo x")), "config-segredo-x");
    assert.match(chaveNome(nomeLista("Ñandú O'Brien/../x")), /^[a-z-]+$/);
    assert.match(normalizarTurma("2/../B").turmaKey, /^[a-z0-9]+$/);
  });

  test("pin: exatamente 6 números", () => {
    assert.equal(normalizarPin("123456"), "123456");
    assert.equal(normalizarPin("000007"), "000007");
    assert.equal(normalizarPin(" 123456 "), "123456");
    assert.equal(normalizarPin(123456), "123456");
    for (const p of ["1234", "12345", "1234567", "abcdef", "12a456", "", null, undefined, 12345, "١٢٣٤٥٦"]) {
      assert.equal(normalizarPin(p), null, String(p));
    }
  });
});

describe("lista de alunos: procurar o nome", () => {
  const lista = sanitizarTurmas(TURMAS_TESTE).turmas.find((s) => s.key === "2").alunos;

  test("igual exato", () => {
    assert.deepEqual(encontrarNaLista(lista, "MARIA SOUZA"), { nome: "MARIA SOUZA" });
    // O exato ganha de quem também combina pela regra parcial.
    assert.deepEqual(encontrarNaLista(lista, "ANA SOUZA"), { nome: "ANA SOUZA" });
  });

  test("parcial: primeiro nome + sobrenome(s) na mesma ordem", () => {
    assert.deepEqual(encontrarNaLista(lista, "ANA COSTA"), { nome: "ANA PAULA RIBEIRO COSTA" });
    assert.deepEqual(encontrarNaLista(lista, "ANA PAULA COSTA"), { nome: "ANA PAULA RIBEIRO COSTA" });
    assert.deepEqual(encontrarNaLista(lista, "ANA LOPES"), { nome: "ANA BEATRIZ RIBEIRO LOPES" });
    assert.deepEqual(encontrarNaLista(lista, "MARIA LIMA"), { nome: "MARIA EDUARDA APARECIDA DOS SANTOS OLIVEIRA DE SOUZA PEREIRA LIMA" });
  });

  test("parcial com mais de um aluno → repetido", () => {
    assert.deepEqual(encontrarNaLista(lista, "ANA RIBEIRO"), { erro: "repetido" });
    assert.deepEqual(encontrarNaLista(lista, "MARIA EDUARDA"), { erro: "repetido" });
  });

  test("parcial: só o primeiro nome + DA/DE/DOS não é nome e sobrenome", () => {
    const l = ["KELLY DE LIMA PRADO", "RUI DA SILVA", "LUIZ D AVILA NETO", "TIAGO DOS REIS", "ENZO E SILVA", "MARIA DAS DORES"];
    for (const d of ["KELLY DE", "RUI DA", "LUIZ D", "TIAGO DOS", "ENZO E", "MARIA DAS", "KELLY DE DE", "RUI DA DOS"]) {
      assert.deepEqual(encontrarNaLista(l, d), { erro: "sem-sobrenome" }, d);
    }
    // Com um sobrenome de verdade, a ligação digitada pode vir junto ou ficar de fora.
    for (const [d, nome] of [
      ["KELLY DE LIMA", "KELLY DE LIMA PRADO"],
      ["KELLY PRADO", "KELLY DE LIMA PRADO"],
      ["RUI DA SILVA", "RUI DA SILVA"],
      ["RUI SILVA", "RUI DA SILVA"],
      ["LUIZ D AVILA", "LUIZ D AVILA NETO"],
      ["TIAGO DOS REIS", "TIAGO DOS REIS"],
      ["MARIA DORES", "MARIA DAS DORES"],
    ]) {
      assert.deepEqual(encontrarNaLista(l, d), { nome }, d);
    }
    // O exato continua valendo primeiro (mesmo um nome da lista que só tem ligação depois do primeiro nome).
    assert.deepEqual(encontrarNaLista(["NOME DE", "NOME DE TAL"], "NOME DE"), { nome: "NOME DE" });
    // Ligação diferente da lista não acha (a regra parcial não adivinha DA no lugar de DE).
    assert.deepEqual(encontrarNaLista(l, "KELLY DA LIMA"), { erro: "nao-achei" });
  });

  test("não acha: primeira palavra diferente, ordem trocada, palavra pela metade, palavra a mais", () => {
    for (const d of ["PAULA COSTA", "ANA COSTA RIBEIRO", "ANA COST", "ANA PAULA RIBEIRO COSTA NETO", "FULANO DETAL", "SOUZA MARIA"]) {
      assert.deepEqual(encontrarNaLista(lista, d), { erro: "nao-achei" }, d);
    }
  });
});

describe("lista de alunos: formato e origem", () => {
  test("sanitizarTurmas (painel): normaliza, tira vazios e repetidos, ordena", () => {
    const r = sanitizarTurmas(
      [
        { label: "  2ª   Série ", alunos: ["zeca pagodinho", "", "  ", "Ána Souza.", "ANA  SOUZA", "ana souza", "Bia Lima"] },
        { label: "1ª Série", alunos: [] },
        { label: "3ª Série" },
      ],
      { estrito: true },
    );
    assert.deepEqual(r, {
      turmas: [
        { key: "2", label: "2ª Série", alunos: ["ANA SOUZA", "BIA LIMA", "ZECA PAGODINHO"] },
        { key: "1", label: "1ª Série", alunos: [] },
        { key: "3", label: "3ª Série", alunos: [] },
      ],
    });
  });

  test("sanitizarTurmas (painel): qualquer problema é erro com mensagem", () => {
    const cheia = (n, prefixo = "Aluno") => Array.from({ length: n }, (_, i) => `${prefixo} ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + Math.floor(i / 26))} Teste`);
    const casos = [
      ["lixo", /problema/],
      [null, /problema/],
      [[], /pelo menos uma série/],
      [Array.from({ length: 21 }, (_, i) => ({ label: `${i + 1}ª Série`, alunos: [] })), /no máximo 20 séries/],
      [["lixo"], /problema/],
      [[{ label: "", alunos: [] }], /precisa de um nome/],
      [[{ label: "   ", alunos: [] }], /precisa de um nome/],
      [[{ label: 3, alunos: [] }], /precisa de um nome/],
      [[{ label: "Série", alunos: [] }], /número da série/],
      [[{ label: "1ª Série " + "x".repeat(40), alunos: [] }], /grande demais/],
      [[{ label: "1ª Série", alunos: [] }, { label: "1º ano", alunos: [] }], /"1ª Série" e "1º ano" ficaram iguais/],
      [[{ label: "1ª Série", alunos: "Ana Souza" }], /lista de alunos da 1ª Série veio com problema/],
      [[{ label: "1ª Série", alunos: ["Ana Souza", 42] }], /lista de alunos da 1ª Série veio com problema/],
      [[{ label: "1ª Série", alunos: ["Ana Souza", "Pedro"] }], /nome e sobrenome de "PEDRO"/],
      [[{ label: "1ª Série", alunos: ["Ana " + "Silva ".repeat(20)] }], /grande demais \(máximo 90/],
      [[{ label: "1ª Série", alunos: cheia(81) }], /81 nomes\. O máximo é 80/],
    ];
    for (const [lista, re] of casos) {
      const r = sanitizarTurmas(lista, { estrito: true });
      assert.ok(r.erro, JSON.stringify(lista).slice(0, 80));
      assert.match(r.erro, re, JSON.stringify(lista).slice(0, 80));
      assert.equal(r.turmas, undefined);
    }
    // 80 nomes cabem; repetidos não contam no limite.
    assert.equal(sanitizarTurmas([{ label: "1ª Série", alunos: cheia(80) }], { estrito: true }).turmas[0].alunos.length, 80);
    assert.equal(sanitizarTurmas([{ label: "1ª Série", alunos: [...cheia(80), ...cheia(10)] }], { estrito: true }).turmas[0].alunos.length, 80);
    // 20 séries cabem.
    assert.equal(sanitizarTurmas(Array.from({ length: 20 }, (_, i) => ({ label: `${i + 1}ª Série`, alunos: [] })), { estrito: true }).turmas.length, 20);
  });

  test("lerTurmasJson (variável de ambiente): JSON inválido → nenhuma série; itens ruins são pulados", () => {
    for (const t of [undefined, null, "", "   ", "{lixo", "[", "42", '"texto"', "{}", "[]", '[{"label":""}]', '{"turmas":"x"}']) {
      assert.deepEqual(lerTurmasJson(t), [], String(t));
    }
    const r = lerTurmasJson(
      JSON.stringify([
        { label: "1ª Série", alunos: ["Ana Souza", 5, "", "ana souza", "Ana " + "Silva ".repeat(20), "Pedro"] },
        { label: "1º ano", alunos: ["Outra Pessoa"] }, // mesma chave da 1ª Série: fica de fora
        { label: "", alunos: ["X Y"] },
        "lixo",
        { label: "Série", alunos: [] },
        { label: "2ª Série", alunos: "lixo" },
        { label: "3ª Série", alunos: ["Carla Melo"] },
      ]),
    );
    assert.deepEqual(r, [
      { key: "1", label: "1ª Série", alunos: ["ANA SOUZA", "PEDRO"] },
      { key: "3", label: "3ª Série", alunos: ["CARLA MELO"] },
    ]);
    // Também aceita {turmas:[...]} e o BOM do UTF-8.
    assert.equal(lerTurmasJson("﻿" + JSON.stringify({ turmas: TURMAS_TESTE })).length, 3);
  });

  test("GET /api/turmas: séries com o total, SEM nomes de alunos", async () => {
    const amb = ambiente();
    const r = await amb.chamar("GET", "/api/turmas");
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.deepEqual(r.json, {
      ok: true,
      turmas: [
        { key: "1", label: "1ª Série", total: 4 },
        { key: "2", label: "2ª Série", total: 12 },
        { key: "3", label: "3ª Série", total: 2 },
      ],
    });
    const texto = r.texto.toUpperCase();
    for (const s of TURMAS_TESTE) for (const n of s.alunos) assert.ok(!texto.includes(nomeLista(n)), "a rota pública mostrou um nome");
    assert.ok(!/SOUZA|LIMA|PAGODINHO/.test(texto));
    // Não precisa de login; só GET.
    assert.equal((await amb.chamar("POST", "/api/turmas", {})).status, 405);
  });

  test("TURMAS_ALUNOS inválida ou ausente: /api/turmas responde ok com lista vazia e ninguém entra", async () => {
    const erroOriginal = console.error;
    console.error = () => {};
    try {
      for (const envTexto of ["{lixo", "[]", '{"a":1}', "", "null"]) {
        const amb = ambiente({ envTexto });
        const r = await amb.chamar("GET", "/api/turmas");
        assert.deepEqual([r.status, r.json], [200, { ok: true, turmas: [] }], envTexto);
        const e = await amb.entrar("Maria Souza", "2", "123456");
        assert.deepEqual([e.status, e.json.erro], [400, "turma"], envTexto);
      }
      // Sem a variável (env sem TURMAS_ALUNOS).
      const api = createApi({ store: new MemoryStore(), env: { get: () => undefined } });
      const res = await api(new Request("http://teste.local/api/turmas"));
      assert.deepEqual(await res.json(), { ok: true, turmas: [] });
    } finally {
      console.error = erroOriginal;
    }
  });

  test("env pode ser {get} (Netlify.env) ou um objeto como process.env", async () => {
    const texto = JSON.stringify(TURMAS_TESTE);
    for (const env of [{ TURMAS_ALUNOS: texto }, envDe(texto)]) {
      const api = createApi({ store: new MemoryStore(), env });
      const r = await (await api(new Request("http://teste.local/api/turmas"))).json();
      assert.equal(r.turmas.length, 3);
    }
  });
});

describe("aluno: entrar com a lista", () => {
  test("cadastro novo: nome da lista (MAIÚSCULAS), série oficial, token e estado vazio", async () => {
    const amb = ambiente();
    const r = await amb.entrar("Maria Souza", "2", "123456");
    assert.equal(r.status, 200);
    assert.equal(r.headers.get("content-type"), "application/json; charset=utf-8");
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.equal(r.json.ok, true);
    assert.equal(r.json.novo, true);
    assert.equal(typeof r.json.token, "string");
    assert.deepEqual(r.json.aluno, { id: "2/maria-souza", nome: "MARIA SOUZA", turma: "2ª Série" });
    assert.equal(r.json.estado, null);
    assert.equal(r.json.atualizadoEm, null);

    const reg = await amb.store.get("alunos/2/maria-souza");
    assert.equal(reg.id, "2/maria-souza");
    assert.equal(reg.nome, "MARIA SOUZA");
    assert.equal(reg.turma, "2ª Série");
    assert.equal(reg.turmaKey, "2");
    assert.equal(reg.nomeKey, "maria-souza");
    assert.match(reg.pinHash, /^[0-9a-f]{64}$/);
    assert.match(reg.pinSalt, /^[0-9a-f]{32}$/);
    assert.deepEqual(reg.paras, ["", "", "", ""]);
    assert.equal(reg.falhas, 0);
    assert.equal(reg.criadoEm, amb.agora());
    assert.ok(!JSON.stringify(reg).includes('"123456"'));

    const seg = await amb.store.get("config/segredo");
    assert.match(seg.valor, /^[0-9a-f]{64}$/);
  });

  test("nome digitado com acento, minúsculas, pontuação e espaços cai no mesmo cadastro", async () => {
    const amb = ambiente();
    const a = await amb.entrar("Maria Souza", "2", "123456");
    assert.equal(a.json.novo, true);
    for (const nome of ["maria  souza", "MARIA SOUZA", "  Mária Sôuza. ", "maria-souza", "Ｍａｒｉａ Ｓｏｕｚａ"]) {
      const r = await amb.entrar(nome, "2", "123456");
      assert.equal(r.status, 200, nome);
      assert.equal(r.json.novo, false);
      assert.deepEqual(r.json.aluno, { id: "2/maria-souza", nome: "MARIA SOUZA", turma: "2ª Série" });
    }
    // A série vai pela chave de /api/turmas ("2"); espaços em volta e número também servem.
    assert.equal((await amb.entrar("Maria Souza", " 2 ", "123456")).status, 200);
    assert.equal((await amb.entrar("Maria Souza", 2, "123456")).status, 200);
    assert.equal((await amb.store.list("alunos/")).length, 1);
  });

  test("nome parcial (primeiro nome + sobrenome) acha o nome completo da lista", async () => {
    const amb = ambiente();
    const r = await amb.entrar("ana costa", "2", "123456");
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.aluno, { id: "2/ana-paula-ribeiro-costa", nome: "ANA PAULA RIBEIRO COSTA", turma: "2ª Série" });
    // Depois, com o nome completo, é o mesmo cadastro.
    const c = await amb.entrar("Ana Paula Ribeiro Costa", "2", "123456");
    assert.deepEqual([c.status, c.json.novo, c.json.aluno.id], [200, false, "2/ana-paula-ribeiro-costa"]);
  });

  test("primeiro nome + DA/DE/DOS → 400 nome; nada é cadastrado; com sobrenome entra", async () => {
    const amb = ambiente({ turmas: [{ label: "1ª Série", alunos: ["Kelly de Lima Prado", "Rui da Silva", "Tiago dos Reis"] }] });
    for (const nome of ["kelly de", "Kelly  De ", "rui da", "tiago dos", "Tiago d'"]) {
      const r = await amb.entrar(nome, "1", "123456");
      assert.deepEqual([r.status, r.json.erro, r.json.msg], [400, "nome", "Escreva seu nome e sobrenome."], nome);
    }
    assert.equal((await amb.store.list("alunos/")).length, 0);
    const r = await amb.entrar("Kelly Prado", "1", "123456");
    assert.deepEqual([r.status, r.json.aluno.id], [200, "1/kelly-de-lima-prado"]);
  });

  test("nome parcial de mais de um aluno → 409", async () => {
    const amb = ambiente();
    const r = await amb.entrar("Ana Ribeiro", "2", "123456");
    assert.equal(r.status, 409);
    assert.deepEqual([r.json.ok, r.json.erro, r.json.msg], [
      false,
      "nome",
      "Tem mais de um aluno com esse nome nesta série. Escreva o nome completo, como na chamada.",
    ]);
    assert.equal((await amb.store.list("alunos/")).length, 0);
  });

  test("nome fora da lista da série → 404 com o nome da série", async () => {
    const amb = ambiente();
    for (const [nome, turma, label] of [
      ["Fulano Detal", "2", "2ª Série"],
      ["Carla Melo", "2", "2ª Série"], // está na 3ª Série, não na 2ª
      ["Paula Costa", "2", "2ª Série"], // primeira palavra diferente
      ["Maria Souza", "1", "1ª Série"],
    ]) {
      const r = await amb.entrar(nome, turma, "123456");
      assert.equal(r.status, 404, nome);
      assert.equal(r.json.erro, "nome");
      assert.equal(r.json.msg, `Não achei esse nome na lista da ${label}. Confira a série e escreva o nome completo, como na chamada.`);
    }
    assert.equal((await amb.store.list("alunos/")).length, 0);
  });

  test("o mesmo nome em séries diferentes são alunos diferentes", async () => {
    const amb = ambiente();
    const a = await amb.entrar("Ana Souza", "1", "111111");
    const b = await amb.entrar("Ana Souza", "2", "222222");
    const c = await amb.entrar("Ana Souza", "3", "333333");
    assert.deepEqual(
      [a, b, c].map((r) => [r.status, r.json.aluno.id, r.json.aluno.turma]),
      [
        [200, "1/ana-souza", "1ª Série"],
        [200, "2/ana-souza", "2ª Série"],
        [200, "3/ana-souza", "3ª Série"],
      ],
    );
  });

  test("validação: série, nome e senha com mensagens em português", async () => {
    const amb = ambiente();
    for (const turma of ["9", "", "  ", null, undefined, "2b", "2º B", "2ª Série", "abc", "../2", {}, [2], "x".repeat(100)]) {
      const r = await amb.entrar("Maria Souza", turma, "123456");
      assert.deepEqual([r.status, r.json.ok, r.json.erro, r.json.msg], [400, false, "turma", "Escolha a sua série."], JSON.stringify(turma));
    }
    for (const nome of ["Maria", "  Maria  ", "Maria 2", "", "--- ---", null, 7, "12 34"]) {
      const r = await amb.entrar(nome, "2", "123456");
      assert.deepEqual([r.status, r.json.erro, r.json.msg], [400, "nome", "Escreva seu nome e sobrenome."], String(nome));
    }
    for (const pin of ["1234", "12345", "1234567", "abcdef", "", 12345, null]) {
      const r = await amb.entrar("Maria Souza", "2", pin);
      assert.deepEqual([r.status, r.json.erro, r.json.msg], [400, "pin", "A senha tem que ter 6 números."], String(pin));
    }
    const r = await amb.chamar("POST", "/api/entrar", {});
    assert.equal(r.json.erro, "turma");
    assert.equal((await amb.store.list("alunos/")).length, 0);
  });

  test("PIN certo entra; PIN errado devolve 401 com restantes", async () => {
    const amb = ambiente();
    await amb.entrar("Maria Souza", "2", "123456");
    let r = await amb.entrar("Maria Souza", "2", "999999");
    assert.equal(r.status, 401);
    assert.equal(r.json.erro, "senha");
    assert.equal(r.json.restantes, 4);
    assert.equal(r.json.msg, "Senha errada. Confira os 6 números. Se você esqueceu, peça ao professor para apagar a sua senha.");
    r = await amb.entrar("Maria Souza", "2", "999999");
    assert.equal(r.json.restantes, 3);
    r = await amb.entrar("Maria Souza", "2", "123456");
    assert.equal(r.status, 200);
    assert.equal(r.json.novo, false);
    assert.equal(r.json.senhaNova, undefined);
    assert.equal((await amb.store.get("alunos/2/maria-souza")).falhas, 0, "acertar zera as falhas");
  });

  test("5 erros bloqueiam por 15 minutos; depois libera", async () => {
    const amb = ambiente();
    await amb.entrar("Maria Souza", "2", "123456");
    for (let i = 1; i <= 4; i++) {
      const r = await amb.entrar("Maria Souza", "2", "000000");
      assert.equal(r.status, 401);
      assert.equal(r.json.restantes, 5 - i);
    }
    let r = await amb.entrar("Maria Souza", "2", "000000");
    assert.equal(r.status, 429);
    assert.equal(r.json.erro, "bloqueado");
    assert.equal(r.json.minutos, 15);
    assert.equal(r.json.msg, "Muitas tentativas erradas. Espere 15 minutos ou peça ajuda ao professor.");

    // Bloqueado: nem o PIN certo entra.
    r = await amb.entrar("Maria Souza", "2", "123456");
    assert.equal(r.status, 429);
    amb.avancar(14 * MIN + 30 * 1000);
    r = await amb.entrar("Maria Souza", "2", "123456");
    assert.equal(r.status, 429);
    assert.equal(r.json.minutos, 1);
    assert.equal(r.json.msg, "Muitas tentativas erradas. Espere 1 minuto ou peça ajuda ao professor.");

    amb.avancar(31 * 1000);
    r = await amb.entrar("Maria Souza", "2", "123456");
    assert.equal(r.status, 200);
    const reg = await amb.store.get("alunos/2/maria-souza");
    assert.equal(reg.falhas, 0);
    assert.equal(reg.bloqueadoAte, 0);
  });

  test("corrida no cadastro: quem chega depois segue o fluxo de registro existente", async () => {
    const amb = ambiente();
    const [a, b] = await Promise.all([amb.entrar("Maria Souza", "2", "123456"), amb.entrar("maria souza", "2", "123456")]);
    assert.deepEqual([a.status, b.status], [200, 200]);
    assert.deepEqual([a.json.novo, b.json.novo].sort(), [false, true]);
    assert.equal(a.json.token, b.json.token);
  });
});

describe("aluno: salvar e estado", () => {
  test("ida e volta do estado, parágrafos e resumo", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;

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

    const reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual(Object.keys(reg.resumo).sort(), ["etapa", "fases", "linhas", "nivel", "xp"]);
    assert.equal(reg.resumo.fases, 3);
    assert.equal(reg.resumo.xp, 120);
    assert.equal(reg.resumo.nivel, "Escritor");
    assert.equal(reg.resumo.linhas, 12);
    assert.ok(reg.resumo.etapa.length <= 80);

    // Entrar de novo (outro celular) traz o estado salvo.
    r = await amb.entrar("Maria Souza", "2", "123456");
    assert.deepEqual(r.json.estado, estado);
    assert.equal(r.json.atualizadoEm, amb.agora());
  });

  test("salvar sem paras/resumo mantém os anteriores", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    await amb.chamar("POST", "/api/salvar", { token, estado: { v: 1 }, paras: ["a", "b", "c", "d"], resumo: { fases: 2 } });
    const r = await amb.chamar("POST", "/api/salvar", { token, estado: { v: 2 } });
    assert.equal(r.status, 200);
    const reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual(reg.estado, { v: 2 });
    assert.deepEqual(reg.paras, ["a", "b", "c", "d"]);
    assert.equal(reg.resumo.fases, 2);
  });

  test("estado precisa ser objeto e ter no máximo ~250 KB", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
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
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
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
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    const r = await amb.chamar("POST", "/api/salvar", JSON.stringify({ token, estado: { beacon: true }, paras: ["p1", "", "", ""] }), {
      bruto: true,
      headers: { "content-type": "text/plain;charset=UTF-8" },
    });
    assert.equal(r.status, 200);
    assert.deepEqual((await amb.store.get("alunos/2/maria-souza")).estado, { beacon: true });
  });

  test("token adulterado → 401 sessao", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    await amb.entrar("Pedro Lima", "2", "432100");
    const [idB64, versao, assinatura] = token.split(".");
    assert.equal(Buffer.from(idB64, "base64url").toString(), "2/maria-souza");

    const outroId = Buffer.from("2/pedro-lima").toString("base64url");
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
    assert.equal((await amb.store.get("alunos/2/pedro-lima")).estado, null);
    assert.equal((await amb.store.get("alunos/2/maria-souza")).estado, null);

    // Token de outro servidor (segredo diferente) não vale.
    const outro = ambiente();
    const tokenOutro = (await outro.entrar("Maria Souza", "2", "123456")).json.token;
    const r = await amb.chamar("POST", "/api/estado", { token: tokenOutro });
    assert.equal(r.status, 401);

    // O token certo continua valendo.
    assert.equal((await amb.chamar("POST", "/api/estado", { token })).status, 200);
    chavesSeguras(amb.store);
  });

  test("chaves nunca saem do prefixo alunos/", async () => {
    const amb = await ambienteProfessor();
    let r = await amb.entrar("../../config/segredo x", "2", "123456");
    assert.deepEqual([r.status, r.json.erro], [404, "nome"]);
    r = await amb.entrar("Maria Souza", "../2/..", "123456");
    assert.deepEqual([r.status, r.json.erro], [400, "turma"]);
    // Mesmo que o professor ponha nomes estranhos na lista, a chave fica só com [a-z-].
    r = await amb.chamar(
      "POST",
      "/api/professor/turmas",
      { turmas: [{ label: "2ª Série/../x", alunos: ["../../config/segredo x", "a/b c/d", "José \u0000 da Silva"] }] },
      { token: amb.tokenProf },
    );
    assert.equal(r.status, 200, r.texto);
    const key = r.json.turmas[0].key;
    assert.match(key, /^[a-z0-9]+$/);
    r = await amb.entrar("../../config/segredo x", key, "123456");
    assert.equal(r.status, 200);
    assert.equal(r.json.aluno.id, `${key}/config-segredo-x`);
    assert.equal((await amb.entrar("a/b c/d", key, "123456")).status, 200);
    assert.equal((await amb.entrar("José \u0000 da Silva", key, "123456")).status, 200);
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
      ["GET", "/api/professor/aluno?id=2/x-y"],
      ["POST", "/api/professor/redefinir", { id: "2/x-y" }],
      ["POST", "/api/professor/apagar", { id: "2/x-y" }],
      ["POST", "/api/professor/senha", { atual: SENHA_TESTE, nova: "outra-senha" }],
      ["GET", "/api/professor/turmas"],
      ["POST", "/api/professor/turmas", { turmas: [{ label: "1ª Série", alunos: ["Hacker Teste"] }] }],
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
    assert.equal(await amb.store.get("config/turmas"), null, "sem login não grava a lista");
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

  test("lista de alunos: ordem por série e nome, campos do resumo", async () => {
    const turmas = [
      { label: "10ª Série", alunos: ["Carla Melo"] },
      { label: "2ª Série", alunos: ["Zeca Pagodinho", "Ana Clara", "Érica Alves"] },
      { label: "1ª Série", alunos: ["Bruno Dias", "Davi Rocha"] },
    ];
    const amb = await ambienteProfessor({ turmas });
    const z = (await amb.entrar("Zeca Pagodinho", "2", "111111")).json.token;
    await amb.entrar("Ana Clara", "2", "222222");
    await amb.entrar("Érica Alves", "2", "333333");
    await amb.entrar("Bruno Dias", "1", "444444");
    await amb.entrar("Carla Melo", "10", "555555");
    await amb.entrar("Davi Rocha", "1", "666666");

    amb.avancar(MIN);
    await amb.chamar("POST", "/api/salvar", {
      token: z,
      estado: { fim: true },
      paras: ["Introdução.", "", "", ""],
      resumo: { fases: 7, xp: 900, nivel: 5, linhas: 28, etapa: "fim" },
    });
    // Davi fica bloqueado.
    for (let i = 0; i < 5; i++) await amb.entrar("Davi Rocha", "1", "000000");

    const r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true);
    const nomes = r.json.alunos.map((a) => `${a.turmaKey}:${a.nome}`);
    assert.deepEqual(nomes, ["1:BRUNO DIAS", "1:DAVI ROCHA", "2:ANA CLARA", "2:ERICA ALVES", "2:ZECA PAGODINHO", "10:CARLA MELO"]);

    const zeca = r.json.alunos.find((a) => a.nome === "ZECA PAGODINHO");
    assert.deepEqual(Object.keys(zeca).sort(), [
      "atividades",
      "atualizadoEm",
      "bloqueado",
      "concluiu",
      "coringa",
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
        id: "2/zeca-pagodinho",
        nome: "ZECA PAGODINHO",
        turma: "2ª Série",
        turmaKey: "2",
        fases: 7,
        xp: 900,
        nivel: 5,
        linhas: 28,
        etapa: "fim",
        concluiu: true,
        temRedacao: true,
        semSenha: false,
        bloqueado: false,
        coringa: false,
        // registro antigo (sem textos por atividade): o progresso é da atividade "leitores"
        atividades: [{ id: "leitores", fases: 7, total: 7, concluiu: true, temTexto: true }],
        criadoEm: 0,
        atualizadoEm: amb.agora(),
      },
    );
    const ana = r.json.alunos.find((a) => a.nome === "ANA CLARA");
    assert.equal(ana.concluiu, false);
    assert.equal(ana.temRedacao, false);
    assert.equal(ana.fases, 0);
    const davi = r.json.alunos.find((a) => a.nome === "DAVI ROCHA");
    assert.equal(davi.bloqueado, true);
    assert.ok(!("paras" in zeca) && !("pinHash" in zeca) && !("estado" in zeca), "lista não expõe dados sensíveis");
  });

  test("lista lê muitos alunos (lotes de 20)", async () => {
    const amb = await ambienteProfessor();
    const nomes = ["Ana", "Bia", "Caio", "Davi", "Edu", "Fabi", "Gil"];
    for (let i = 0; i < 45; i++) {
      await amb.store.set(`alunos/2/aluno-${i}`, {
        id: `2/aluno-${i}`,
        nome: `${nomes[i % 7]} Teste${i}`,
        turma: "2ª Série",
        turmaKey: "2",
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
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    await amb.chamar("POST", "/api/salvar", { token, estado: {}, paras: ["Um.", "Dois.", "Três.", "Quatro."], resumo: { fases: 4 } });
    let r = await amb.chamar("GET", "/api/professor/aluno?id=" + encodeURIComponent("2/maria-souza"), undefined, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.equal(r.json.aluno.id, "2/maria-souza");
    assert.equal(r.json.aluno.nome, "MARIA SOUZA");
    assert.equal(r.json.aluno.turma, "2ª Série");
    assert.equal(r.json.aluno.fases, 4);
    assert.equal(r.json.aluno.temRedacao, true);
    assert.deepEqual(r.json.aluno.paras, ["Um.", "Dois.", "Três.", "Quatro."]);
    assert.ok(!("pinHash" in r.json.aluno) && !("pinSalt" in r.json.aluno));

    r = await amb.chamar("GET", "/api/professor/aluno?id=2/nao-existe", undefined, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json.erro], [404, "aluno"]);
    for (const id of ["", "../config/segredo", "2/../x", "alunos/2/maria-souza", "2/Maria-souza", "2/maria souza", "a/b/c"]) {
      r = await amb.chamar("GET", "/api/professor/aluno?id=" + encodeURIComponent(id), undefined, { token: amb.tokenProf });
      assert.equal(r.status, 400, id);
      assert.equal(r.json.erro, "id");
    }
    r = await amb.chamar("GET", "/api/professor/aluno", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 400);
  });

  test("apagar a senha do aluno: o servidor cria uma senha nova de 6 números; o progresso continua", async () => {
    const amb = await ambienteProfessor();
    const antigo = (await amb.entrar("Maria Souza", "2", "123456")).json.token;
    await amb.chamar("POST", "/api/salvar", { token: antigo, estado: { fase: 5 }, paras: ["Meu texto", "", "", ""], resumo: { fases: 5 } });
    // Deixa o aluno bloqueado para ver que a redefinição também desbloqueia.
    for (let i = 0; i < 5; i++) await amb.entrar("Maria Souza", "2", "000000");

    let r = await amb.chamar("POST", "/api/professor/redefinir", { id: "2/maria-souza" }, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true);
    assert.match(r.json.pin, /^\d{6}$/);
    const pinNovo = r.json.pin;
    let reg = await amb.store.get("alunos/2/maria-souza");
    assert.match(reg.pinHash, /^[0-9a-f]{64}$/);
    assert.ok(!JSON.stringify(reg).includes(`"${pinNovo}"`), "a senha nova não fica guardada em texto");
    assert.equal(reg.falhas, 0);
    assert.equal(reg.bloqueadoAte, 0);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.json.alunos[0].semSenha, false);
    assert.equal(r.json.alunos[0].bloqueado, false);

    // O token antigo não vale mais.
    r = await amb.chamar("POST", "/api/estado", { token: antigo });
    assert.deepEqual([r.status, r.json.erro], [401, "sessao"]);
    r = await amb.chamar("POST", "/api/salvar", { token: antigo, estado: { fase: 0 } });
    assert.equal(r.status, 401);

    // Quem chega primeiro com outra senha NÃO toma a conta (não existe momento "sem senha").
    const outroPin = pinNovo === "111111" ? "222222" : "111111";
    r = await amb.entrar("maria souza", "2", outroPin);
    assert.deepEqual([r.status, r.json.erro], [401, "senha"]);
    assert.equal((await amb.entrar("Maria Souza", "2", "123456")).status, 401, "a senha velha não vale");

    // O aluno entra com a senha que o professor entregou e recebe o progresso de volta.
    r = await amb.entrar("Maria Souza", "2", pinNovo);
    assert.equal(r.status, 200);
    assert.equal(r.json.novo, false);
    assert.deepEqual(r.json.estado, { fase: 5 });
    const novoToken = r.json.token;
    assert.notEqual(novoToken, antigo);
    r = await amb.chamar("POST", "/api/estado", { token: novoToken });
    assert.equal(r.status, 200);
    assert.deepEqual(r.json.paras, ["Meu texto", "", "", ""]);
    reg = await amb.store.get("alunos/2/maria-souza");
    assert.equal(reg.falhas, 0, "acertar zera os erros");

    // Toque duplo no "Entrar" com a senha nova: as duas entradas funcionam.
    const duas = await Promise.all([amb.entrar("Maria Souza", "2", pinNovo), amb.entrar("Maria Souza", "2", pinNovo)]);
    assert.deepEqual(
      duas.map((x) => x.status),
      [200, 200],
    );
    assert.equal(duas[0].json.token, duas[1].json.token);

    r = await amb.chamar("POST", "/api/professor/redefinir", { id: "2/nao-existe" }, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json.erro], [404, "aluno"]);
    r = await amb.chamar("POST", "/api/professor/redefinir", { id: "../config/segredo" }, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json.erro], [400, "id"]);
  });

  test("senha nova do 'Apagar senha': 6 números com zeros à esquerda, sorteio sem viés", async () => {
    // randomBytes(4) controlado: 1º sorteio 0xFFFFFFFF (acima do teto múltiplo de 1.000.000: descartado), 2º = 42.
    const fila = [];
    const aleatorio = (n) => (n === 4 && fila.length ? Buffer.from(fila.shift()) : randomBytes(n));
    const amb = await ambienteProfessor({ aleatorio });
    await amb.entrar("Maria Souza", "2", "123456");
    fila.push([0xff, 0xff, 0xff, 0xff], [0, 0, 0, 42]);
    let r = await amb.chamar("POST", "/api/professor/redefinir", { id: "2/maria-souza" }, { token: amb.tokenProf });
    assert.equal(r.json.pin, "000042");
    assert.equal(fila.length, 0, "o valor acima do teto foi sorteado de novo");
    assert.equal((await amb.entrar("Maria Souza", "2", "000042")).status, 200);
    // 4.294.000.000 é o teto (múltiplo de 1.000.000 que cabe em 32 bits): ele é descartado, 4.293.999.999 vale.
    fila.push([0xff, 0xf1, 0x3d, 0x80], [0xff, 0xf1, 0x3d, 0x7f]);
    r = await amb.chamar("POST", "/api/professor/redefinir", { id: "2/maria-souza" }, { token: amb.tokenProf });
    assert.equal(r.json.pin, "999999");
    assert.equal(fila.length, 0);
    // Sem controle: sempre 6 dígitos.
    const vistos = new Set();
    for (let i = 0; i < 5; i++) {
      r = await amb.chamar("POST", "/api/professor/redefinir", { id: "2/maria-souza" }, { token: amb.tokenProf });
      assert.match(r.json.pin, /^\d{6}$/);
      vistos.add(r.json.pin);
    }
    assert.ok(vistos.size > 1, "a senha nova muda a cada vez");
  });

  test("registro antigo sem senha (pinHash null): o aluno cria uma senha nova ao entrar", async () => {
    const amb = await ambienteProfessor();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    await amb.chamar("POST", "/api/salvar", { token, estado: { fase: 4 }, paras: ["Texto", "", "", ""] });
    const reg = await amb.store.get("alunos/2/maria-souza");
    await amb.store.set("alunos/2/maria-souza", { ...reg, pinHash: null, pinVersao: reg.pinVersao + 1 });
    let r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.json.alunos[0].semSenha, true);

    // Toque duplo no "Entrar": as duas entradas funcionam, só uma cria a senha.
    const duas = await Promise.all([amb.entrar("Maria Souza", "2", "246810"), amb.entrar("Maria Souza", "2", "246810")]);
    assert.deepEqual(
      duas.map((x) => x.status),
      [200, 200],
    );
    assert.equal(duas[0].json.token, duas[1].json.token);
    assert.deepEqual(duas.map((x) => Boolean(x.json.senhaNova)).sort(), [false, true]);
    assert.deepEqual(duas[0].json.estado, { fase: 4 });
    assert.equal((await amb.entrar("Maria Souza", "2", "123456")).status, 401);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.json.alunos[0].semSenha, false);
  });

  test("excluir aluno", async () => {
    const amb = await ambienteProfessor();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    await amb.entrar("Pedro Lima", "2", "432100");
    let r = await amb.chamar("POST", "/api/professor/apagar", { id: "2/maria-souza" }, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json], [200, { ok: true }]);
    assert.equal(await amb.store.get("alunos/2/maria-souza"), null);
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.deepEqual(
      r.json.alunos.map((a) => a.id),
      ["2/pedro-lima"],
    );
    r = await amb.chamar("POST", "/api/estado", { token });
    assert.deepEqual([r.status, r.json.erro], [401, "sessao"]);
    r = await amb.chamar("POST", "/api/salvar", { token, estado: {} });
    assert.deepEqual([r.status, r.json.erro], [401, "sessao"]);
    assert.equal(await amb.store.get("alunos/2/maria-souza"), null, "salvar não recria registro apagado");

    for (const id of ["../config/segredo", "alunos/2/pedro-lima", "2/../../config", "", null]) {
      r = await amb.chamar("POST", "/api/professor/apagar", { id }, { token: amb.tokenProf });
      assert.equal(r.status, 400, String(id));
    }
    // "config/segredo" tem o formato de id, mas vira a chave alunos/config/segredo: o segredo fica intacto.
    r = await amb.chamar("POST", "/api/professor/apagar", { id: "config/segredo" }, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.ok(await amb.store.get("config/segredo"));
    assert.ok(await amb.store.get("alunos/2/pedro-lima"));
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

describe("professor: lista de alunos por série", () => {
  test("GET /api/professor/turmas: lista padrão (TURMAS_ALUNOS) com os nomes da lista", async () => {
    const amb = await ambienteProfessor();
    const r = await amb.chamar("GET", "/api/professor/turmas", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.equal(r.json.ok, true);
    assert.equal(r.json.fonte, "padrao");
    assert.deepEqual(
      r.json.turmas.map((s) => [s.key, s.label, s.alunos.length]),
      [
        ["1", "1ª Série", 4],
        ["2", "2ª Série", 12],
        ["3", "3ª Série", 2],
      ],
    );
    assert.deepEqual(r.json.turmas[0].alunos, ["ANA SOUZA", "BRUNO DIAS", "DAVI ROCHA", "LUCAS PRADO TEIXEIRA"]);
    assert.ok(r.json.turmas[1].alunos.includes("ERICA ALVES"));
  });

  test("POST /api/professor/turmas: normaliza, tira repetidos, ordena e grava em config/turmas", async () => {
    const amb = await ambienteProfessor();
    const r = await amb.chamar(
      "POST",
      "/api/professor/turmas",
      {
        turmas: [
          { label: "1ª Série", alunos: ["bruno dias", "Davi  Rocha", "", "DAVI ROCHA", "Dávi Rocha.", "Ana-Clara D'Ávila"] },
          { label: " 2ª   Série ", alunos: ["Zeca Pagodinho", "  ", "Érica Alves"] },
        ],
      },
      { token: amb.tokenProf },
    );
    assert.equal(r.status, 200, r.texto);
    const esperado = [
      { key: "1", label: "1ª Série", alunos: ["ANA CLARA D AVILA", "BRUNO DIAS", "DAVI ROCHA"] },
      { key: "2", label: "2ª Série", alunos: ["ERICA ALVES", "ZECA PAGODINHO"] },
    ];
    const coringas = ["GUILHERME CAMOZZATO TEIXEIRA"]; // padrão, sem a variável ALUNOS_CORINGA
    assert.deepEqual(r.json, { ok: true, fonte: "painel", turmas: esperado, coringas, coringaSenha: false });
    const salvo = await amb.store.get("config/turmas");
    assert.deepEqual(salvo.turmas, esperado);
    assert.equal(salvo.atualizadoEm, amb.agora());

    // O GET mostra a lista do painel.
    const g = await amb.chamar("GET", "/api/professor/turmas", undefined, { token: amb.tokenProf });
    assert.deepEqual(g.json, { ok: true, fonte: "painel", turmas: esperado, coringas, coringaSenha: false });
    chavesSeguras(amb.store);
  });

  test("POST /api/professor/turmas: validação (400 turmas) e nada é gravado", async () => {
    const amb = await ambienteProfessor();
    const muitos = Array.from({ length: 81 }, (_, i) => `Aluno ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + Math.floor(i / 26))} Teste`);
    const casos = [
      {},
      { turmas: "1ª Série" },
      { turmas: [] },
      { turmas: [{ label: "", alunos: [] }] },
      { turmas: [{ label: "Série", alunos: [] }] },
      { turmas: [{ label: "1ª Série", alunos: [] }, { label: "1º Ano", alunos: [] }] },
      { turmas: [{ label: "1ª Série", alunos: "Ana Souza" }] },
      { turmas: [{ label: "1ª Série", alunos: [null] }] },
      { turmas: [{ label: "1ª Série", alunos: ["Pedro"] }] },
      { turmas: [{ label: "1ª Série", alunos: ["Ana " + "Silva ".repeat(20)] }] },
      { turmas: [{ label: "1ª Série", alunos: muitos }] },
      { turmas: Array.from({ length: 21 }, (_, i) => ({ label: `${i + 1}ª Série`, alunos: [] })) },
    ];
    for (const corpo of casos) {
      const r = await amb.chamar("POST", "/api/professor/turmas", corpo, { token: amb.tokenProf });
      assert.equal(r.status, 400, JSON.stringify(corpo).slice(0, 80));
      assert.equal(r.json.ok, false);
      assert.equal(r.json.erro, "turmas");
      assert.equal(typeof r.json.msg, "string");
      assert.ok(r.json.msg.length > 5);
    }
    assert.equal(await amb.store.get("config/turmas"), null);
    // A lista padrão continua valendo.
    assert.equal((await amb.chamar("GET", "/api/professor/turmas", undefined, { token: amb.tokenProf })).json.fonte, "padrao");
  });

  test("a lista do painel vale mais que a variável de ambiente (também para /api/turmas e /api/entrar)", async () => {
    const amb = await ambienteProfessor();
    assert.equal((await amb.entrar("Maria Souza", "2", "123456")).status, 200);
    let r = await amb.chamar(
      "POST",
      "/api/professor/turmas",
      { turmas: [{ label: "2ª Série", alunos: ["Maria Souza", "Nova Aluna Teste"] }, { label: "4ª Série", alunos: ["Outro Novo Teste"] }] },
      { token: amb.tokenProf },
    );
    assert.equal(r.status, 200);
    r = await amb.chamar("GET", "/api/turmas");
    assert.deepEqual(r.json.turmas, [
      { key: "2", label: "2ª Série", total: 2 },
      { key: "4", label: "4ª Série", total: 1 },
    ]);
    // Série que só existe na variável não vale mais.
    r = await amb.entrar("Bruno Dias", "1", "123456");
    assert.deepEqual([r.status, r.json.erro], [400, "turma"]);
    // Série nova do painel funciona.
    r = await amb.entrar("Outro Novo", "4", "123456");
    assert.deepEqual([r.status, r.json.aluno], [200, { id: "4/outro-novo-teste", nome: "OUTRO NOVO TESTE", turma: "4ª Série" }]);
  });

  test("entrar depois que o professor edita a lista", async () => {
    const amb = await ambienteProfessor();
    const pedro = await amb.entrar("Pedro Lima", "2", "111111");
    assert.equal(pedro.status, 200);
    const maria = await amb.entrar("Maria Souza", "2", "222222");
    assert.equal((await amb.entrar("Aluna Nova", "2", "333333")).status, 404, "ainda não está na lista");

    // O professor tira o Pedro, põe a Aluna Nova e muda o nome da série (a chave continua "2").
    const r = await amb.chamar(
      "POST",
      "/api/professor/turmas",
      { turmas: [{ label: "2º Ano", alunos: ["Maria Souza", "Aluna Nova da Silva"] }, ...TURMAS_TESTE.filter((s) => s.label !== "2ª Série")] },
      { token: amb.tokenProf },
    );
    assert.equal(r.status, 200, r.texto);

    // Quem entrou na lista consegue entrar (com o nome parcial também).
    let e = await amb.entrar("Aluna Nova", "2", "333333");
    assert.deepEqual([e.status, e.json.novo, e.json.aluno], [200, true, { id: "2/aluna-nova-da-silva", nome: "ALUNA NOVA DA SILVA", turma: "2º Ano" }]);

    // Quem saiu da lista não entra mais (nem com a senha certa), mas o cadastro continua no painel.
    e = await amb.entrar("Pedro Lima", "2", "111111");
    assert.deepEqual([e.status, e.json.erro], [404, "nome"]);
    assert.match(e.json.msg, /lista da 2º Ano/);
    assert.equal((await amb.chamar("POST", "/api/estado", { token: pedro.json.token })).status, 200, "a sessão aberta continua (o professor pode excluir)");
    const lista = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.ok(lista.json.alunos.some((a) => a.id === "2/pedro-lima"));

    // Quem continua na lista entra com a mesma senha e o mesmo progresso; o nome da série é atualizado.
    e = await amb.entrar("maria souza", "2", "222222");
    assert.deepEqual([e.status, e.json.novo, e.json.token], [200, false, maria.json.token]);
    assert.equal(e.json.aluno.turma, "2º Ano");
    assert.equal((await amb.store.get("alunos/2/maria-souza")).turma, "2º Ano");
    const det = await amb.chamar("GET", "/api/professor/aluno?id=2/maria-souza", undefined, { token: amb.tokenProf });
    assert.equal(det.json.aluno.turma, "2º Ano");
  });

  test("config/turmas estragado: volta para a lista padrão", async () => {
    const amb = await ambienteProfessor();
    for (const ruim of [{ turmas: "lixo" }, { turmas: [] }, { turmas: [{ label: "" }] }, "texto", [1, 2]]) {
      await amb.store.set("config/turmas", ruim);
      const r = await amb.chamar("GET", "/api/professor/turmas", undefined, { token: amb.tokenProf });
      assert.equal(r.json.fonte, "padrao", JSON.stringify(ruim));
      assert.equal(r.json.turmas.length, 3);
    }
  });
});

describe("HTTP", () => {
  test("rota desconhecida → 404", async () => {
    const amb = ambiente();
    for (const caminho of ["/api/nada", "/api", "/api/", "/api/professor", "/api/professor/alunos/x", "/api/turmas/x", "/api/constructor", "/api/__proto__"]) {
      const r = await amb.chamar("GET", caminho);
      assert.equal(r.status, 404, caminho);
      assert.deepEqual([r.json.ok, r.json.erro], [false, "rota"]);
      assert.equal(typeof r.json.msg, "string");
    }
  });

  test("barra no fim do caminho é aceita", async () => {
    const amb = ambiente();
    const r = await amb.chamar("POST", "/api/entrar/", { nome: "Maria Souza", turma: "2", pin: "123456" });
    assert.equal(r.status, 200);
    assert.equal((await amb.chamar("GET", "/api/turmas/")).status, 200);
  });

  test("método errado → 405", async () => {
    const amb = ambiente();
    for (const [metodo, caminho, allow] of [
      ["GET", "/api/entrar", "POST"],
      ["PUT", "/api/salvar", "POST"],
      ["DELETE", "/api/estado", "POST"],
      ["POST", "/api/professor/alunos", "GET"],
      ["GET", "/api/professor/apagar", "POST"],
      ["POST", "/api/turmas", "GET"],
      ["PUT", "/api/professor/turmas", "GET, POST"],
      ["DELETE", "/api/professor/turmas", "GET, POST"],
      ["HEAD", "/api/turmas", "GET"],
    ]) {
      const r = await amb.chamar(metodo, caminho);
      assert.equal(r.status, 405, `${metodo} ${caminho}`);
      if (metodo !== "HEAD") assert.equal(r.json.erro, "metodo");
      assert.equal(r.headers.get("allow"), allow);
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
    const api = createApi({ store: quebrado, env: envDe(JSON.stringify(TURMAS_TESTE)) });
    const erroOriginal = console.error;
    console.error = () => {};
    try {
      for (const req of [
        new Request("http://teste.local/api/entrar", { method: "POST", body: JSON.stringify({ nome: "Maria Souza", turma: "2", pin: "123456" }) }),
        new Request("http://teste.local/api/turmas"),
      ]) {
        const res = await api(req);
        assert.equal(res.status, 500);
        assert.equal((await res.json()).erro, "interno");
      }
    } finally {
      console.error = erroOriginal;
    }
  });

  test("segredo é criado uma vez só e reaproveitado", async () => {
    const store = new MemoryStore();
    const a = ambiente({ store });
    const t = (await a.entrar("Maria Souza", "2", "123456")).json.token;
    const seg = await store.get("config/segredo");
    const b = ambiente({ store }); // outra instância (como outra execução da função)
    const r = await b.chamar("POST", "/api/estado", { token: t });
    assert.equal(r.status, 200);
    assert.deepEqual(await store.get("config/segredo"), seg);
  });
});

// ---------------------------------------------------------------------------
// Revisão: corridas, bloqueios e casos de borda (cada teste reproduz um defeito encontrado)
// ---------------------------------------------------------------------------

const esperarMs = (ms) => new Promise((r) => setTimeout(r, ms));

// Store com latência por operação (no Netlify cada get/set é uma chamada HTTP ao Blobs).
class StoreLento extends MemoryStore {
  constructor(ms = 10) {
    super();
    this.ms = ms;
  }
  async get(k) {
    await esperarMs(this.ms);
    return super.get(k);
  }
  async getWithEtag(k) {
    await esperarMs(this.ms);
    return super.getWithEtag(k);
  }
  async set(k, v, o) {
    await esperarMs(this.ms);
    return super.set(k, v, o);
  }
  async del(k) {
    await esperarMs(this.ms);
    return super.del(k);
  }
}

// Store com "portão": a próxima gravação da chave que satisfaz `quando` fica parada
// (como uma requisição ao Blobs ainda a caminho) até soltar().
class StoreComPortao extends MemoryStore {
  portao = null;
  armar(chave, quando = () => true, { depois = false } = {}) {
    let soltar, chegou;
    const liberado = new Promise((r) => (soltar = r));
    const parou = new Promise((r) => (chegou = r));
    this.portao = { chave, quando, liberado, chegou, depois };
    return { soltar, parou };
  }
  async set(key, obj, o) {
    const p = this.portao;
    if (p && key === p.chave && p.quando(obj)) {
      this.portao = null;
      if (p.depois) {
        // grava e só então para (a requisição continua "pensando" com a gravação já feita)
        const r = await super.set(key, obj, o);
        p.chegou();
        await p.liberado;
        return r;
      }
      p.chegou();
      await p.liberado;
    }
    return super.set(key, obj, o);
  }
}

async function comProfessor(amb) {
  await semearProfessor(amb.store);
  const r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
  assert.equal(r.status, 200, r.texto);
  return r.json.token;
}

const contar = (rs) => rs.reduce((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {});

describe("revisão: excluir aluno", () => {
  test("token de um cadastro EXCLUÍDO não vale no cadastro novo com o mesmo nome", async () => {
    const amb = ambiente();
    const tokenProf = await comProfessor(amb);
    const velho = (await amb.entrar("Ana Souza", "2", "111111")).json.token; // ex.: colega se passando pela Ana
    let r = await amb.chamar("POST", "/api/professor/apagar", { id: "2/ana-souza" }, { token: tokenProf });
    assert.equal(r.status, 200);
    r = await amb.entrar("Ana Souza", "2", "222222"); // a Ana de verdade se cadastra
    assert.equal(r.json.novo, true);
    assert.notEqual(r.json.token, velho);
    await amb.chamar("POST", "/api/salvar", { token: r.json.token, estado: { v: 1 }, paras: ["Texto da Ana", "", "", ""] });

    const lido = await amb.chamar("POST", "/api/estado", { token: velho });
    assert.deepEqual([lido.status, lido.json.erro], [401, "sessao"], "token antigo leu a redação nova");
    const escrito = await amb.chamar("POST", "/api/salvar", { token: velho, estado: { v: 9 }, paras: ["apagado", "", "", ""] });
    assert.deepEqual([escrito.status, escrito.json.erro], [401, "sessao"], "token antigo sobrescreveu a redação nova");
    assert.equal((await amb.store.get("alunos/2/ana-souza")).paras[0], "Texto da Ana");
  });
});

const MAX_FALHAS_TESTE = 5;

describe("revisão: bloqueio com tentativas ao mesmo tempo", () => {
  for (const [nome, criarStore] of [
    ["store sem atraso", () => new MemoryStore()],
    ["store com atraso de rede", () => new StoreLento(8)],
  ]) {
    test(`aluno: 60 PINs errados ao mesmo tempo conferem no máximo 4 e bloqueiam (${nome})`, async () => {
      const amb = ambiente({ store: criarStore() });
      await amb.entrar("Vitima Silva", "2", "739100");
      const pins = Array.from({ length: 60 }, (_, i) => String(100000 + i));
      const rs = await Promise.all(pins.map((pin) => amb.entrar("Vitima Silva", "2", pin)));
      const st = contar(rs);
      assert.ok((st[401] || 0) <= MAX_FALHAS_TESTE - 1, `PINs errados conferidos: ${JSON.stringify(st)}`);
      assert.ok((st[429] || 0) >= 1, JSON.stringify(st));
      const reg = await amb.store.get("alunos/2/vitima-silva");
      assert.ok(reg.bloqueadoAte > amb.agora(), "ficou bloqueado");
      assert.equal((await amb.entrar("Vitima Silva", "2", "739100")).status, 429, "nem o PIN certo entra durante o bloqueio");
    });
  }

  test("professor: 40 senhas erradas ao mesmo tempo conferem no máximo 9 e bloqueiam", async () => {
    const amb = ambiente({ store: new StoreLento(5) });
    await semearProfessor(amb.store);
    const senhas = Array.from({ length: 40 }, (_, i) => "errada-" + i);
    const rs = await Promise.all(senhas.map((senha) => amb.chamar("POST", "/api/professor/entrar", { senha })));
    const st = contar(rs);
    assert.ok((st[401] || 0) <= 9, `senhas erradas conferidas: ${JSON.stringify(st)}`);
    const f = await amb.store.get("config/professor-falhas");
    assert.ok(f.bloqueadoAte > amb.agora(), JSON.stringify(f));
    assert.equal((await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE })).status, 429);
  });

  test("aluno certo entrando no meio dos chutes não dá chances extras a quem chuta", async () => {
    const store = new StoreComPortao();
    const amb = ambiente({ store });
    await amb.entrar("Maria Souza", "2", "123456");
    // A entrada certa já contou a tentativa (falhas 1) e está conferindo o PIN...
    const { soltar, parou } = store.armar("alunos/2/maria-souza", (o) => o.falhas === 1, { depois: true });
    const certa = amb.entrar("Maria Souza", "2", "123456");
    await parou;
    // ...enquanto alguém chuta duas vezes.
    assert.equal((await amb.entrar("Maria Souza", "2", "000001")).json.restantes, 3);
    assert.equal((await amb.entrar("Maria Souza", "2", "000002")).json.restantes, 2);
    soltar();
    assert.equal((await certa).status, 200);
    assert.equal((await store.get("alunos/2/maria-souza")).falhas, 2, "os chutes de depois continuam contando");
    // Quem chuta continua com 5 erros no total: 2 já usados + 3.
    assert.equal((await amb.entrar("Maria Souza", "2", "000003")).json.restantes, 2);
    assert.equal((await amb.entrar("Maria Souza", "2", "000004")).json.restantes, 1);
    assert.equal((await amb.entrar("Maria Souza", "2", "000005")).status, 429);
  });

  test("uma pessoa errando a senha não atrapalha o aluno certo que entra depois", async () => {
    const amb = ambiente();
    await amb.entrar("Maria Souza", "2", "123456");
    for (let i = 0; i < 3; i++) await amb.entrar("Maria Souza", "2", "000000");
    const r = await amb.entrar("Maria Souza", "2", "123456");
    assert.equal(r.status, 200);
    assert.equal((await amb.store.get("alunos/2/maria-souza")).falhas, 0);
  });

  test("a 5ª tentativa certa entra e desfaz o bloqueio provisório", async () => {
    const amb = ambiente();
    await amb.entrar("Maria Souza", "2", "123456");
    for (let i = 0; i < 4; i++) assert.equal((await amb.entrar("Maria Souza", "2", "000000")).status, 401);
    assert.equal((await amb.entrar("Maria Souza", "2", "123456")).status, 200);
    const reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual([reg.falhas, reg.bloqueadoAte], [0, 0]);
  });
});

describe("revisão: gravações ao mesmo tempo não se desfazem", () => {
  test("salvar que respondeu 200 não é desfeito por um PIN errado ao mesmo tempo", async () => {
    const store = new StoreComPortao();
    const amb = ambiente({ store });
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    await amb.chamar("POST", "/api/salvar", { token, estado: { fase: 1 }, paras: ["v1", "", "", ""] });
    const { soltar, parou } = store.armar("alunos/2/maria-souza", (o) => o.falhas === 1);
    const errada = amb.entrar("Maria Souza", "2", "999999");
    await parou;
    const salvo = await amb.chamar("POST", "/api/salvar", { token, estado: { fase: 2 }, paras: ["v2 texto novo", "", "", ""] });
    assert.equal(salvo.status, 200);
    soltar();
    assert.equal((await errada).status, 401);
    const reg = await store.get("alunos/2/maria-souza");
    assert.deepEqual(reg.estado, { fase: 2 });
    assert.equal(reg.paras[0], "v2 texto novo");
    assert.equal(reg.falhas, 1, "o erro também foi contado");
  });

  test("salvar que respondeu 200 não é desfeito pelo professor apagando a senha ao mesmo tempo", async () => {
    const store = new StoreComPortao();
    const amb = ambiente({ store });
    const tokenProf = await comProfessor(amb);
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    const { soltar, parou } = store.armar("alunos/2/maria-souza");
    const redefinir = amb.chamar("POST", "/api/professor/redefinir", { id: "2/maria-souza" }, { token: tokenProf });
    await parou;
    const salvo = await amb.chamar("POST", "/api/salvar", { token, estado: { fase: 6 }, paras: ["texto final", "", "", ""] });
    assert.equal(salvo.status, 200);
    soltar();
    const red = await redefinir;
    assert.equal(red.status, 200);
    const reg = await store.get("alunos/2/maria-souza");
    assert.deepEqual(reg.estado, { fase: 6 }, "progresso confirmado foi revertido");
    assert.equal((await amb.entrar("Maria Souza", "2", red.json.pin)).status, 200, "a senha nova vale");
  });

  test("salvar em andamento não ressuscita um aluno que o professor acabou de excluir", async () => {
    const store = new StoreComPortao();
    const amb = ambiente({ store });
    const tokenProf = await comProfessor(amb);
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    const { soltar, parou } = store.armar("alunos/2/maria-souza", (o) => o.estado && o.estado.passo === 9);
    const salvando = amb.chamar("POST", "/api/salvar", { token, estado: { passo: 9 } });
    await parou;
    const del = await amb.chamar("POST", "/api/professor/apagar", { id: "2/maria-souza" }, { token: tokenProf });
    assert.equal(del.status, 200);
    soltar();
    const s = await salvando;
    assert.deepEqual([s.status, s.json.erro], [401, "sessao"]);
    assert.equal(await store.get("alunos/2/maria-souza"), null, "aluno excluído voltou");
    const lista = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: tokenProf });
    assert.deepEqual(lista.json.alunos, []);
  });

  test("salvar em andamento não desfaz 'Apagar senha do aluno'", async () => {
    const store = new StoreComPortao();
    const amb = ambiente({ store });
    const tokenProf = await comProfessor(amb);
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    const pinHashAntigo = (await store.get("alunos/2/maria-souza")).pinHash;
    const { soltar, parou } = store.armar("alunos/2/maria-souza", (o) => o.estado && o.estado.passo === 3);
    const salvando = amb.chamar("POST", "/api/salvar", { token, estado: { passo: 3 } });
    await parou;
    const red = await amb.chamar("POST", "/api/professor/redefinir", { id: "2/maria-souza" }, { token: tokenProf });
    assert.equal(red.status, 200);
    soltar();
    const s = await salvando;
    assert.deepEqual([s.status, s.json.erro], [401, "sessao"]);
    const reg = await store.get("alunos/2/maria-souza");
    assert.notEqual(reg.pinHash, pinHashAntigo, "a senha antiga voltou");
    assert.equal((await amb.chamar("POST", "/api/estado", { token })).status, 401, "token velho voltou a valer");
    assert.equal((await amb.entrar("Maria Souza", "2", red.json.pin)).status, 200);
  });

  test("alguém salvando sem parar não impede o professor de apagar a senha", async () => {
    class StoreRede extends MemoryStore {
      async getWithEtag(k) {
        const v = await super.getWithEtag(k);
        await esperarMs(5);
        return v;
      }
      async set(k, v, o) {
        await esperarMs(40); // a gravação demora para chegar
        return super.set(k, v, o);
      }
    }
    const amb = ambiente({ store: new StoreRede() });
    const tokenProf = await comProfessor(amb);
    const { token } = (await amb.entrar("Bia Lima", "2", "444444")).json;
    let parar = false;
    const voos = [];
    const spam = (async () => {
      while (!parar) {
        voos.push(amb.chamar("POST", "/api/salvar", { token, estado: { v: 3 }, paras: ["x", "", "", ""] }));
        await esperarMs(3);
      }
    })();
    await esperarMs(20);
    let r;
    try {
      r = await amb.chamar("POST", "/api/professor/redefinir", { id: "2/bia-lima" }, { token: tokenProf });
    } finally {
      parar = true;
      await spam;
      await Promise.all(voos);
    }
    assert.equal(r.status, 200, JSON.stringify(r.json));
    assert.equal((await amb.chamar("POST", "/api/estado", { token })).status, 401, "token velho continua valendo");
    assert.equal((await amb.entrar("Bia Lima", "2", "444444")).status, 401, "senha velha continua valendo");
    assert.equal((await amb.entrar("Bia Lima", "2", r.json.pin)).status, 200);
  });

  test("muitos salvamentos e erros de senha ao mesmo tempo: nada se perde", async () => {
    const amb = ambiente({ store: new StoreLento(3) });
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    const ops = [];
    for (let i = 1; i <= 6; i++) {
      ops.push(amb.chamar("POST", "/api/salvar", { token, estado: { n: i }, paras: [`v${i}`, "", "", ""] }));
      if (i <= 3) ops.push(amb.entrar("Maria Souza", "2", "000000"));
    }
    const rs = await Promise.all(ops);
    const salvos = rs.filter((r) => r.json.atualizadoEm !== undefined && r.status === 200);
    assert.equal(salvos.length, 6, JSON.stringify(contar(rs)));
    const reg = await amb.store.get("alunos/2/maria-souza");
    assert.equal(reg.falhas, 3, "os 3 erros foram contados");
    assert.ok(reg.estado && reg.estado.n >= 1);
  });
});

describe("revisão: professor", () => {
  test("erros de quem não sabe a senha não trancam o professor no aparelho dele", async () => {
    const amb = ambiente();
    await semearProfessor(amb.store);
    let r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
    const marca = r.json.dispositivo;
    assert.match(marca, /^d\.[0-9a-f]{32}\.[0-9a-f]{64}$/);

    for (let i = 0; i < 10; i++) await amb.chamar("POST", "/api/professor/entrar", { senha: "aluno-zoando-" + i });
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
    assert.equal(r.status, 429, "sem a marca do aparelho continua bloqueado (limite geral)");
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE, dispositivo: marca });
    assert.equal(r.status, 200, "com a marca do aparelho o professor entra");
    assert.equal(r.json.dispositivo, marca);
    assert.equal((await amb.chamar("GET", "/api/professor/alunos", undefined, { token: r.json.token })).status, 200);

    // Marca falsificada vale como entrada comum (continua bloqueada).
    const falsa = marca.slice(0, -1) + (marca.endsWith("0") ? "1" : "0");
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE, dispositivo: falsa });
    assert.equal(r.status, 429);
    // A marca não abre o painel.
    r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: marca });
    assert.equal(r.status, 401);

    // O aparelho também tem limite: 10 erros com a marca bloqueiam só os aparelhos.
    for (let i = 0; i < 9; i++) {
      r = await amb.chamar("POST", "/api/professor/entrar", { senha: "errada-" + i, dispositivo: marca });
      assert.equal(r.status, 401);
    }
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: "errada-10", dispositivo: marca });
    assert.equal(r.status, 429);
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE, dispositivo: marca });
    assert.equal(r.status, 429);
    amb.avancar(15 * MIN + 1);
    r = await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE });
    assert.equal(r.status, 200);
  });

  test("trocar senha: erros da senha atual contam no limite (10 → 15 minutos)", async () => {
    const amb = ambiente();
    const tokenProf = await comProfessor(amb);
    for (let i = 1; i <= 9; i++) {
      const r = await amb.chamar("POST", "/api/professor/senha", { atual: "chute-" + i, nova: "novasenha1" }, { token: tokenProf });
      assert.deepEqual([r.status, r.json.erro], [403, "senha"], `tentativa ${i}`);
    }
    let r = await amb.chamar("POST", "/api/professor/senha", { atual: "chute-10", nova: "novasenha1" }, { token: tokenProf });
    assert.deepEqual([r.status, r.json.erro, r.json.minutos], [429, "bloqueado", 15]);
    r = await amb.chamar("POST", "/api/professor/senha", { atual: SENHA_TESTE, nova: "novasenha1" }, { token: tokenProf });
    assert.equal(r.status, 429, "bloqueado mesmo com a senha atual certa");
    assert.equal((await amb.chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE })).status, 429);
    amb.avancar(15 * MIN + 1);
    r = await amb.chamar("POST", "/api/professor/senha", { atual: SENHA_TESTE, nova: "novasenha1" }, { token: tokenProf });
    assert.equal(r.status, 200);
    assert.deepEqual(await amb.store.get("config/professor-falhas"), { falhas: 0, bloqueadoAte: 0 });
  });

  test("lista do professor lê só os resumos (não baixa o estado do jogo)", async () => {
    const inner = new MemoryStore();
    let bytes = 0;
    const contando = Object.create(inner);
    for (const m of ["get", "getWithEtag"]) {
      contando[m] = async (k) => {
        const v = await inner[m](k);
        if (v) bytes += JSON.stringify(v).length;
        return v;
      };
    }
    for (const m of ["set", "del", "list", "getMeta", "keys"]) contando[m] = inner[m].bind(inner);
    const N = 25;
    const nomeDe = (i) => `Aluno Numero${String.fromCharCode(97 + i)}`;
    const amb = ambiente({ store: contando, turmas: [{ label: "2ª Série", alunos: Array.from({ length: N }, (_, i) => nomeDe(i)) }] });
    const tokenProf = await comProfessor(amb);
    const grande = { lixo: "x".repeat(200 * 1024) };
    for (let i = 0; i < N; i++) {
      const r = await amb.entrar(nomeDe(i), "2", "123456");
      await amb.chamar("POST", "/api/salvar", { token: r.json.token, estado: grande, paras: [i % 2 ? "texto" : "", "", "", ""], resumo: { fases: i % 8, xp: i, nivel: "N", linhas: i, etapa: "E" } });
    }
    for (let i = 0; i < 5; i++) await amb.entrar(nomeDe(0), "2", "000000"); // bloqueia um

    bytes = 0;
    const l = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: tokenProf });
    assert.equal(l.status, 200);
    assert.equal(l.json.alunos.length, N);
    assert.ok(bytes < 2 * 1024, `a lista leu ${bytes} bytes de registros inteiros`);
    const a0 = l.json.alunos.find((a) => a.id === "2/aluno-numeroa");
    assert.equal(a0.bloqueado, true);
    assert.equal(a0.temRedacao, false);
    const a1 = l.json.alunos.find((a) => a.id === "2/aluno-numerob");
    assert.deepEqual(
      [a1.fases, a1.xp, a1.nivel, a1.linhas, a1.etapa, a1.temRedacao, a1.concluiu, a1.semSenha],
      [1, 1, "N", 1, "E", true, false, false],
    );
    // Mesmo resultado que o detalhe (que lê o registro inteiro).
    const det = await amb.chamar("GET", "/api/professor/aluno?id=2/aluno-numerob", undefined, { token: tokenProf });
    const { paras, textos, ...semParas } = det.json.aluno;
    assert.deepEqual(semParas, a1);
  });
});

describe("revisão: nomes e séries", () => {
  test("letras de outro alfabeto (homóglifos) não entram como outro aluno; largura dupla é o mesmo aluno", async () => {
    const amb = ambiente();
    await amb.entrar("Ana Souza", "2", "123456");
    for (const nome of ["Аna Souza", "Ana Sоuza", "Αna Souza"]) {
      const r = await amb.entrar(nome, "2", "999999");
      assert.deepEqual([r.status, r.json.erro], [404, "nome"], nome);
    }
    const larga = await amb.entrar("Ａｎａ Ｓｏｕｚａ", "2", "123456");
    assert.equal(larga.status, 200);
    assert.equal(larga.json.aluno.id, "2/ana-souza");
    assert.equal((await amb.store.list("alunos/")).length, 1);
    assert.equal((await amb.store.get("alunos/2/ana-souza")).falhas, 0, "os homóglifos não contaram como erro de senha da Ana");
  });

  test("turmas escritas por extenso não se misturam; 'Segundo B' é o 2º B", () => {
    const a = normalizarTurma("2ª série do Ensino Médio A");
    const b = normalizarTurma("2ª série do Ensino Médio B");
    assert.deepEqual([a.turmaKey, b.turmaKey], ["2a", "2b"]);
    assert.deepEqual([a.turma, b.turma], ["2º A", "2º B"], "rótulos diferentes no painel");
    for (const t of ["Segundo B", "Segunda série B", "segundo ano b", "2º ano do Ensino Médio B", "2B EM"]) {
      assert.equal(normalizarTurma(t)?.turmaKey, "2b", t);
    }
    assert.equal(normalizarTurma("Terceiro A").turmaKey, "3a");
    assert.equal(normalizarTurma("Primeira série C").turmaKey, "1c");
    assert.equal(normalizarTurma("Ensino Médio"), null);
    assert.ok(normalizarTurma("x".repeat(500)).turmaKey.length <= 24);
  });

  test("nomes longos que só mudam no fim são alunos diferentes; nome gigante digitado não quebra", async () => {
    const amb = ambiente();
    const n1 = "Maria Eduarda Aparecida dos Santos Oliveira de Souza Pereira Lima";
    const n2 = "Maria Eduarda Aparecida dos Santos Oliveira de Souza Pereira Costa";
    const r1 = await amb.entrar(n1, "2", "111111");
    const r2 = await amb.entrar(n2, "2", "222222");
    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200, `${r2.json.erro}: ${r2.json.msg}`);
    assert.notEqual(r1.json.aluno.id, r2.json.aluno.id);
    assert.equal(r1.json.aluno.nome, nomeLista(n1), "o nome da lista vem inteiro");
    const r3 = await amb.entrar("Ana " + "Silva ".repeat(5000), "2", "333333");
    assert.deepEqual([r3.status, r3.json.erro], [404, "nome"]);
    chavesSeguras(amb.store);
  });

  test("cadastro antigo com o nome da série de antes é atualizado quando o aluno entra", async () => {
    const amb = ambiente();
    await amb.entrar("Maria Souza", "2", "123456");
    const reg = await amb.store.get("alunos/2/maria-souza");
    await amb.store.set("alunos/2/maria-souza", { ...reg, nome: "Maria Souza", turma: "2º B" });
    const r = await amb.entrar("Maria Souza", "2", "123456");
    assert.deepEqual(r.json.aluno, { id: "2/maria-souza", nome: "MARIA SOUZA", turma: "2ª Série" });
    const novo = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual([novo.nome, novo.turma, novo.pinVersao], ["MARIA SOUZA", "2ª Série", reg.pinVersao]);
  });

  test("lista real (fora do repositório): todos entram pelo nome; /api/turmas não mostra nomes", { skip: !existsSync(ARQUIVO_TURMAS) && "arquivo da lista real ausente" }, async () => {
    const texto = readFileSync(ARQUIVO_TURMAS, "utf8");
    const turmas = lerTurmasJson(texto);
    assert.ok(turmas.length >= 1, "a lista real tem séries");
    for (const s of turmas) {
      assert.match(s.key, /^[a-z0-9]+$/);
      s.alunos.forEach((nome, i) => {
        assert.equal(nomeLista(nome), nome, `${s.label} #${i}: já está no formato da lista`);
        assert.deepEqual(encontrarNaLista(s.alunos, nome), { nome }, `${s.label} #${i}: nome completo`);
        assert.equal(nomeLista(nome.toLowerCase()), nome, `${s.label} #${i}: minúsculas`);
        const p = nome.split(" ");
        const parcial = encontrarNaLista(s.alunos, `${p[0]} ${p[p.length - 1]}`);
        assert.ok(parcial.nome === nome || parcial.erro === "repetido", `${s.label} #${i}: primeiro + último nome não acha outro aluno`);
        // Qualquer pedaço do nome (primeiro nome + algumas das outras palavras, na ordem) acha este
        // aluno, ou é repetido, ou é só primeiro nome + DA/DE/DOS (recusado): nunca outro aluno.
        const resto = p.slice(1);
        for (let m = 1; m < 1 << resto.length; m++) {
          const pedaco = [p[0], ...resto.filter((_, j) => m & (1 << j))].join(" ");
          const r = encontrarNaLista(s.alunos, pedaco);
          assert.ok(r.nome === nome || r.erro === "repetido" || r.erro === "sem-sobrenome", `${s.label} #${i}: pedaço ${m} acha outro aluno`);
        }
      });
    }
    const amb = ambiente({ envTexto: texto });
    const r = await amb.chamar("GET", "/api/turmas");
    assert.deepEqual(
      r.json.turmas.map((s) => [s.key, s.total]),
      turmas.map((s) => [s.key, s.alunos.length]),
    );
    for (const s of turmas) for (const [i, nome] of s.alunos.entries()) assert.ok(!r.texto.toUpperCase().includes(nome), `${s.label} #${i} apareceu na rota pública`);
    // Um aluno de cada série entra com o nome em minúsculas.
    for (const s of turmas.filter((x) => x.alunos.length)) {
      const e = await amb.entrar(s.alunos[0].toLowerCase(), s.key, "123456");
      assert.equal(e.status, 200, s.label);
      assert.equal(e.json.aluno.turma, s.label);
    }
  });
});

describe("revisão: Netlify Blobs", () => {
  test("store que diz que gravou mas não gravou: o cadastro não finge que deu certo", async () => {
    const store = new MemoryStore();
    const real = store.set.bind(store);
    store.set = async (k, v, o) => (k.startsWith("alunos/") ? { modified: true, etag: "" } : real(k, v, o));
    const amb = ambiente({ store });
    const r = await amb.entrar("Maria Souza", "2", "123456");
    assert.notEqual(r.status, 200);
    assert.equal(r.json.token, undefined);
  });

  const temBlobs = existsSync(fileURLToPath(new URL("../node_modules/@netlify/blobs/package.json", import.meta.url)));

  // Chama a função do Netlify (netlify/functions/api.mjs) com o Blobs apontando para `url`.
  // TURMAS_ALUNOS vem de process.env (como no Netlify sem Netlify.env) durante o teste.
  async function comContextoBlobs(url, fn, { turmas = TURMAS_TESTE } = {}) {
    const antes = globalThis.netlifyBlobsContext;
    const envAntes = process.env.TURMAS_ALUNOS;
    globalThis.netlifyBlobsContext = Buffer.from(JSON.stringify({ edgeURL: url, uncachedEdgeURL: url, siteID: "s1", token: "tok" })).toString("base64");
    process.env.TURMAS_ALUNOS = JSON.stringify(turmas);
    try {
      const { default: handler } = await import("../netlify/functions/api.mjs");
      const chamar = async (metodo, caminho, corpo, token) => {
        const headers = token ? { authorization: "Bearer " + token } : {};
        const res = await handler(new Request("https://x.netlify.app" + caminho, { method: metodo, headers, body: corpo === undefined ? undefined : JSON.stringify(corpo) }), {});
        return { status: res.status, json: await res.json() };
      };
      return await fn(chamar);
    } finally {
      if (antes === undefined) delete globalThis.netlifyBlobsContext;
      else globalThis.netlifyBlobsContext = antes;
      if (envAntes === undefined) delete process.env.TURMAS_ALUNOS;
      else process.env.TURMAS_ALUNOS = envAntes;
    }
  }

  // Servidor falso do Blobs: só config/segredo existe; GET do resto → 404; PUT → `statusPut`.
  async function blobsFalso(statusPut) {
    const http = await import("node:http");
    const srv = http.createServer((req, res) => {
      if (req.method === "GET" && /config(%2F|\/)segredo/.test(req.url)) {
        res.writeHead(200, { "content-type": "application/json", etag: '"1"' });
        return res.end(JSON.stringify({ valor: "a".repeat(64) }));
      }
      req.resume();
      res.writeHead(req.method === "PUT" ? statusPut : 404);
      res.end();
    });
    await new Promise((r) => srv.listen(0, "127.0.0.1", r));
    return { url: `http://127.0.0.1:${srv.address().port}`, fechar: () => srv.close() };
  }

  test("adaptador: Blobs recusando a gravação não vira 'cadastro feito'", { skip: !temBlobs && "@netlify/blobs não instalado" }, async () => {
    const srv = await blobsFalso(403);
    const erroOriginal = console.error;
    console.error = () => {};
    try {
      await comContextoBlobs(srv.url, async (chamar) => {
        const r = await chamar("POST", "/api/entrar", { nome: "Maria Souza", turma: "2", pin: "123456" });
        assert.notEqual(r.status, 200);
        assert.equal(r.json.token, undefined);
      });
    } finally {
      console.error = erroOriginal;
      srv.fechar();
    }
  });

  test("adaptador: TURMAS_ALUNOS vem de Netlify.env; sem ele, de process.env", { skip: !temBlobs && "@netlify/blobs não instalado" }, async () => {
    const srv = await blobsFalso(403);
    const netlifyAntes = globalThis.Netlify;
    try {
      await comContextoBlobs(srv.url, async (chamar) => {
        let r = await chamar("GET", "/api/turmas");
        assert.deepEqual(
          r.json.turmas.map((s) => s.key),
          ["1", "2", "3"],
          "process.env",
        );
        const doNetlify = JSON.stringify([{ label: "5ª Série", alunos: ["Teste Netlify Env"] }]);
        globalThis.Netlify = { env: { get: (k) => (k === "TURMAS_ALUNOS" ? doNetlify : undefined) } };
        r = await chamar("GET", "/api/turmas");
        assert.deepEqual(r.json, { ok: true, turmas: [{ key: "5", label: "5ª Série", total: 1 }] }, "Netlify.env");
        // Netlify.env sem a variável: usa process.env.
        globalThis.Netlify = { env: { get: () => undefined } };
        r = await chamar("GET", "/api/turmas");
        assert.equal(r.json.turmas.length, 3);
      });
    } finally {
      if (netlifyAntes === undefined) delete globalThis.Netlify;
      else globalThis.Netlify = netlifyAntes;
      srv.fechar();
    }
  });

  // Servidor local do Blobs (o mesmo do `netlify dev`). No 11.1.6 ele não manda etag no GET
  // (o Blobs de verdade manda); aqui ele passa a mandar, com etag pelo conteúdo, para testar as
  // gravações condicionais do adaptador.
  async function servidorBlobs() {
    const { mkdtempSync, rmSync, readFileSync: lerArquivo } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const path = await import("node:path");
    const { createHash } = await import("node:crypto");
    const { BlobsServer } = await import("@netlify/blobs/server");
    const geraEtagOriginal = BlobsServer.generateETag;
    BlobsServer.generateETag = async (arquivo) => {
      try {
        return `"${createHash("sha256").update(lerArquivo(arquivo)).digest("hex")}"`;
      } catch {
        return "";
      }
    };
    class ComEtag extends BlobsServer {
      async get(req) {
        const res = await super.get(req);
        const { dataPath, key } = this.getLocalPaths(new URL(req.url ?? "", "http://localhost"));
        if (res.status !== 200 || !key || !dataPath) return res;
        const headers = new Headers(res.headers);
        headers.set("etag", await BlobsServer.generateETag(dataPath));
        return new Response(await res.arrayBuffer(), { status: 200, headers });
      }
    }
    const dir = mkdtempSync(path.join(tmpdir(), "mr-blobs-"));
    const server = new ComEtag({ directory: dir, token: "tok" });
    const { port } = await server.start();
    return {
      url: `http://localhost:${port}`,
      fechar: async () => {
        await server.stop();
        BlobsServer.generateETag = geraEtagOriginal;
        rmSync(dir, { recursive: true, force: true });
      },
    };
  }

  test("adaptador + servidor local do Blobs: salvar, lista por metadados, senha nova, excluir, lista de alunos", { skip: !temBlobs && "@netlify/blobs não instalado" }, async () => {
    const srv = await servidorBlobs();
    try {
      await comContextoBlobs(srv.url, async (chamar) => {
        const { getStore } = await import("@netlify/blobs");
        const b = getStore({ name: "missao-redacao", consistency: "strong" });
        const salt = randomBytes(16).toString("hex");
        await b.setJSON("config/professor", { salt, hash: scryptSync(SENHA_TESTE, salt, 32, { N: 16384, r: 8, p: 1 }).toString("hex"), versao: 0 });
        const tp = (await chamar("POST", "/api/professor/entrar", { senha: SENHA_TESTE })).json.token;
        const a = await chamar("POST", "/api/entrar", { nome: "Maria Souza", turma: "2", pin: "111111" });
        assert.equal(a.status, 200);
        assert.equal(a.json.novo, true);
        assert.deepEqual(a.json.aluno, { id: "2/maria-souza", nome: "MARIA SOUZA", turma: "2ª Série" });
        let r = await chamar("POST", "/api/salvar", { token: a.json.token, estado: { fase: 3 }, paras: ["Texto", "", "", ""], resumo: { fases: 3, xp: 50 } });
        assert.equal(r.status, 200);
        r = await chamar("POST", "/api/entrar", { nome: "maria souza", turma: "2", pin: "999999" });
        assert.deepEqual([r.status, r.json.restantes], [401, 4]);
        r = await chamar("POST", "/api/estado", { token: a.json.token });
        assert.deepEqual([r.status, r.json.estado, r.json.paras[0]], [200, { fase: 3 }, "Texto"]);

        const meta = await b.getMetadata("alunos/2/maria-souza");
        assert.equal(meta.metadata.v, 1);
        assert.equal(meta.metadata.fases, 3);
        r = await chamar("GET", "/api/professor/alunos", undefined, tp);
        assert.deepEqual(r.json.alunos.map((x) => [x.id, x.fases, x.xp, x.temRedacao]), [["2/maria-souza", 3, 50, true]]);

        // Escrita condicional com etag velho é recusada; com o etag atual, aceita.
        const lido = await b.getWithMetadata("alunos/2/maria-souza", { type: "json" });
        assert.match(lido.etag, /^"[0-9a-f]{64}"$/);
        await chamar("POST", "/api/salvar", { token: a.json.token, estado: { fase: 4 } });
        assert.equal((await b.setJSON("alunos/2/maria-souza", { lixo: true }, { onlyIfMatch: lido.etag })).modified, false);
        assert.deepEqual((await b.get("alunos/2/maria-souza", { type: "json" })).estado, { fase: 4 });

        r = await chamar("POST", "/api/professor/redefinir", { id: "2/maria-souza" }, tp);
        assert.match(r.json.pin, /^\d{6}$/);
        r = await chamar("POST", "/api/entrar", { nome: "Maria Souza", turma: "2", pin: r.json.pin });
        assert.deepEqual([r.status, r.json.estado], [200, { fase: 4 }]);

        r = await chamar("POST", "/api/professor/apagar", { id: "2/maria-souza" }, tp);
        assert.equal(r.status, 200);
        const b2 = await chamar("POST", "/api/entrar", { nome: "Maria Souza", turma: "2", pin: "222222" });
        assert.equal(b2.json.novo, true);
        assert.notEqual(b2.json.token, a.json.token);
        r = await chamar("POST", "/api/estado", { token: a.json.token });
        assert.equal(r.status, 401);

        // Lista de alunos: a do painel fica no Blobs (config/turmas) e vale mais que TURMAS_ALUNOS.
        r = await chamar("GET", "/api/professor/turmas", undefined, tp);
        assert.equal(r.json.fonte, "padrao");
        r = await chamar("POST", "/api/professor/turmas", { turmas: [{ label: "2ª Série", alunos: ["Maria Souza", "Aluno Do Painel"] }] }, tp);
        assert.equal(r.status, 200);
        assert.deepEqual((await b.get("config/turmas", { type: "json" })).turmas, [{ key: "2", label: "2ª Série", alunos: ["ALUNO DO PAINEL", "MARIA SOUZA"] }]);
        r = await chamar("GET", "/api/turmas");
        assert.deepEqual(r.json.turmas, [{ key: "2", label: "2ª Série", total: 2 }]);
        r = await chamar("POST", "/api/entrar", { nome: "Aluno Painel", turma: "2", pin: "333333" });
        assert.deepEqual([r.status, r.json.aluno.id], [200, "2/aluno-do-painel"]);
        r = await chamar("POST", "/api/entrar", { nome: "Bruno Dias", turma: "1", pin: "333333" });
        assert.deepEqual([r.status, r.json.erro], [400, "turma"]);
      });
    } finally {
      await srv.fechar();
    }
  });
});

// ---------------------------------------------------------------------------
// Mudança 3: textos por atividade. Nomes de alunos inventados.
// ---------------------------------------------------------------------------

// Texto de uma atividade como o jogo manda (resumoTexto em public/index.html).
function textoJogo(extra = {}) {
  return {
    rotulo: "Texto 1",
    genero: "Dissertativo-argumentativo",
    tema: "Tema de teste",
    serie: "2",
    titulo: "",
    partes: ["Introdução de teste.", "Argumento um.", "", ""],
    nomesPartes: ["Introdução", "1º argumento", "2º argumento", "Conclusão"],
    verso: false,
    fases: 2,
    total: 7,
    concluiu: false,
    xp: 40,
    ...extra,
  };
}
const POEMA = textoJogo({
  rotulo: "Texto 1",
  genero: "Poema",
  tema: "Carpe diem",
  serie: "1",
  titulo: "O hoje",
  partes: ["Verso um\nVerso dois\r\nVerso três\nVerso quatro", "Outro verso\nMais um", ""],
  nomesPartes: ["1ª estrofe", "2ª estrofe", "3ª estrofe"],
  verso: true,
  fases: 6,
  total: 6,
  concluiu: true,
  xp: 300,
});

async function salvarTextos(amb, token, textos, extra = {}) {
  const r = await amb.chamar("POST", "/api/salvar", {
    token,
    estado: { v: 4, atual: null, ativ: {} },
    paras: ["", "", "", ""],
    resumo: { fases: 0, xp: 0, nivel: "N", linhas: 0, etapa: "Escolhendo a atividade" },
    ...(textos === undefined ? {} : { textos }),
    ...extra,
  });
  assert.equal(r.status, 200, r.texto);
  return r;
}

describe("atividades: textos por atividade", () => {
  test("salvar com textos: sanitiza (ids ruins ignorados, cortes, tipos estritos)", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    const nomeLongo = "a".repeat(41);
    // corpo cru: "__proto__" como chave de verdade (JSON.stringify de um objeto literal não faria isso)
    const textos = {
      leitores: {
        rotulo: "  Texto   1 ",
        genero: "Dissertativo-argumentativo",
        tema: "Tema " + "x".repeat(400),
        serie: 2,
        titulo: "  Meu   título \n novo ",
        partes: ["Intro", "p".repeat(5000), 42, null, "e", "f", "g", "h", "i", "j"],
        nomesPartes: ["Introdução", "n".repeat(100), 7, { x: 1 }],
        verso: "true",
        fases: "3",
        total: 7.4,
        concluiu: 1,
        xp: -5,
        extra: "ignorar",
      },
      "poema-carpe-diem": { ...POEMA, rotulo: "Texto 1 ".repeat(10), fases: 150, partes: [...POEMA.partes, "\u{1F600}".repeat(2500)] },
      Maiuscula: textoJogo(),
      "../x": textoJogo(),
      "-hifen-no-comeco": textoJogo(),
      [nomeLongo]: textoJogo(),
      "com espaco": textoJogo(),
      lista: [1, 2],
      nulo: null,
      texto: "não é objeto",
    };
    const corpo = JSON.stringify({ token, estado: { v: 4 }, textos }).replace('"textos":{', '"textos":{"__proto__":{"rotulo":"x"},');
    const r = await amb.chamar("POST", "/api/salvar", corpo, { bruto: true });
    assert.equal(r.status, 200, r.texto);

    const reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual(Object.keys(reg.textos), ["leitores", "poema-carpe-diem"]);
    const l = reg.textos.leitores;
    assert.deepEqual(Object.keys(l).sort(), ["concluiu", "fases", "genero", "nomesPartes", "partes", "rotulo", "serie", "tema", "titulo", "total", "verso", "xp"]);
    assert.equal(l.rotulo, "Texto 1");
    assert.equal(l.serie, "2");
    assert.equal(l.tema.length, 300);
    assert.equal(l.titulo, "Meu título novo");
    assert.equal(l.partes.length, 8, "até 8 partes");
    assert.deepEqual(l.partes.slice(0, 5), ["Intro", "p".repeat(4000), "", "", "e"]);
    assert.deepEqual(l.nomesPartes, ["Introdução", "n".repeat(60), "7", ""]);
    assert.equal(l.verso, false, "verso só true de verdade");
    assert.equal(l.concluiu, false, "concluiu só true de verdade");
    assert.deepEqual([l.fases, l.total, l.xp], [3, 7, 0]);
    const p = reg.textos["poema-carpe-diem"];
    assert.equal(p.rotulo.length <= 40, true);
    assert.equal(p.fases, 99, "fases de 0 a 99");
    assert.equal(p.verso, true);
    assert.equal(p.concluiu, true);
    assert.equal(p.partes[0], "Verso um\nVerso dois\nVerso três\nVerso quatro", "os versos continuam em linhas separadas");
    assert.equal(p.partes[3].length, 4000, "parte cortada em LIMITE_PARAGRAFO sem quebrar emoji");
    assert.equal(p.partes[3], "\u{1F600}".repeat(2000));
    assert.equal(Object.getPrototypeOf(reg.textos), Object.prototype);

    // A mesma regra, direto na função.
    assert.deepEqual(sanitizarTextos(null), {});
    assert.deepEqual(sanitizarTextos([textoJogo()]), {});
    assert.deepEqual(Object.keys(sanitizarTextos({ a: {}, "a-1": {}, "1": {} })), ["1", "a", "a-1"]);
    chavesSeguras(amb.store);
  });

  test("no máximo 12 atividades (as primeiras)", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    const textos = {};
    for (let i = 0; i < 15; i++) textos[`atividade-${String(i).padStart(2, "0")}`] = textoJogo({ fases: i });
    await salvarTextos(amb, token, textos);
    const reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual(Object.keys(reg.textos), Object.keys(textos).slice(0, 12));
  });

  test("salvar sem textos (ou com textos que não é objeto) mantém os de antes; textos novos entram por cima dos antigos", async () => {
    const amb = ambiente();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    await salvarTextos(amb, token, { leitores: textoJogo(), "cronica-olhar": textoJogo({ genero: "Crônica lírica" }) });
    await salvarTextos(amb, token, undefined);
    await salvarTextos(amb, token, "lixo");
    await salvarTextos(amb, token, null);
    await salvarTextos(amb, token, [textoJogo()]);
    let reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual(Object.keys(reg.textos), ["leitores", "cronica-olhar"]);
    // Só a crônica veio (ex.: o arquivo dos leitores não carregou no celular): a crônica é atualizada
    // e o texto dos leitores continua guardado.
    await salvarTextos(amb, token, { "cronica-olhar": textoJogo({ fases: 5 }) });
    reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual(Object.keys(reg.textos), ["cronica-olhar", "leitores"]);
    assert.equal(reg.textos["cronica-olhar"].fases, 5);
    assert.equal(reg.textos.leitores.genero, textoJogo().genero);
    await salvarTextos(amb, token, {});
    reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual(Object.keys(reg.textos), ["cronica-olhar", "leitores"]);
    // Junto com os antigos, continua no máximo MAX_ATIVIDADES (12), com os novos primeiro.
    const muitos = {};
    for (let i = 0; i < 12; i++) muitos[`nova-${String(i).padStart(2, "0")}`] = textoJogo();
    await salvarTextos(amb, token, muitos);
    reg = await amb.store.get("alunos/2/maria-souza");
    assert.deepEqual(Object.keys(reg.textos), Object.keys(muitos));
    // /api/estado continua devolvendo o estado como foi salvo (sem textos).
    const e = await amb.chamar("POST", "/api/estado", { token });
    assert.deepEqual(e.json.estado, { v: 4, atual: null, ativ: {} });
    assert.ok(!("textos" in e.json));
  });

  test("metadados: 5 atividades com textos longos cabem no resumo (sem baixar o registro)", async () => {
    const amb = await ambienteProfessor();
    const { token } = (await amb.entrar("Maria Souza", "2", "123456")).json;
    const longo = (n) => "Frase comprida de teste. ".repeat(160).slice(0, 4000) + n;
    const ids = ["leitores", "cronica-olhar", "poema-carpe-diem", "justica-climatica", "inseguranca-alimentar"];
    const textos = {};
    ids.forEach((id, i) => {
      textos[id] = textoJogo({ partes: Array.from({ length: 8 }, (_, k) => longo(k)), fases: i, total: 6, concluiu: i === 4, titulo: "T".repeat(300) });
    });
    textos["sem-texto"] = textoJogo({ partes: ["", "  ", ""], fases: 1, total: 6 });
    await salvarTextos(amb, token, textos, { resumo: { fases: 2, xp: 10, nivel: "Nível bem comprido ".repeat(4), linhas: 9, etapa: "Texto 2 · Fase 3 · ".repeat(8) } });
    const meta = (await amb.store.getMeta("alunos/2/maria-souza")).metadata;
    assert.equal(meta.v, 1);
    assert.ok(Buffer.byteLength(JSON.stringify(meta)) <= 1400);
    assert.deepEqual(meta.at, {
      leitores: [0, 6, 0, 1],
      "cronica-olhar": [1, 6, 0, 1],
      "poema-carpe-diem": [2, 6, 0, 1],
      "justica-climatica": [3, 6, 0, 1],
      "inseguranca-alimentar": [4, 6, 1, 1],
      "sem-texto": [1, 6, 0, 0],
    });
    const r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    const a = r.json.alunos[0];
    assert.deepEqual(a.atividades.map((x) => [x.id, x.fases, x.total, x.concluiu, x.temTexto]), [
      ["leitores", 0, 6, false, true],
      ["cronica-olhar", 1, 6, false, true],
      ["poema-carpe-diem", 2, 6, false, true],
      ["justica-climatica", 3, 6, false, true],
      ["inseguranca-alimentar", 4, 6, true, true],
      ["sem-texto", 1, 6, false, false],
    ]);
    assert.equal(a.concluiu, false);
    assert.equal(a.temRedacao, true, "tem texto em alguma atividade (mesmo com paras vazios)");
  });

  test("metadados: 12 atividades com ids longos cortam nível/etapa; se nem assim couber, {v:0} e a lista lê o registro", async () => {
    const nome = ("MARIA " + "TESTE ".repeat(14)).trim(); // 88 letras (o máximo da lista é 90)
    const amb = await ambienteProfessor({ turmas: [{ label: "2ª Série", alunos: [nome] }] });
    const { token } = (await amb.entrar(nome, "2", "123456")).json;
    const chave = "alunos/2/" + nome.toLowerCase().replace(/ /g, "-");
    const textos = {};
    for (let i = 0; i < 12; i++) textos[`${String(i).padStart(2, "0")}-${"a".repeat(37)}`] = textoJogo({ fases: 99, total: 99, concluiu: true });
    const emoji = "\u{1F600}";
    await salvarTextos(amb, token, textos, { resumo: { fases: 3, xp: 1, nivel: emoji.repeat(40), linhas: 2, etapa: emoji.repeat(80) } });
    let meta = (await amb.store.getMeta(chave)).metadata;
    assert.equal(meta.v, 1);
    assert.equal(Object.keys(meta.at).length, 12);
    assert.equal(meta.nivel, "");
    assert.equal(meta.etapa, "");
    assert.ok(Buffer.byteLength(JSON.stringify(meta)) <= 1400);

    // Nome enorme (registro antigo/estranho): o resumo não cabe nem cortando → {v:0}.
    const reg = await amb.store.get(chave);
    await amb.store.set(chave, { ...reg, nome: "MARIA " + "SOUZA ".repeat(150) });
    await salvarTextos(amb, token, textos);
    meta = (await amb.store.getMeta(chave)).metadata;
    assert.deepEqual(meta, { v: 0 });
    const r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    const a = r.json.alunos[0];
    assert.equal(a.atividades.length, 12);
    assert.equal(a.concluiu, true, "começou atividades e concluiu todas");
    assert.equal(a.nivel, "N", "lido do registro inteiro");
  });

  test("lista: atividades de cada aluno, concluiu e registros antigos (atividade leitores)", async () => {
    const amb = await ambienteProfessor();
    const ana = (await amb.entrar("Ana Souza", "1", "111111")).json.token;
    const bia = (await amb.entrar("Bia Lima", "2", "222222")).json.token;
    const carla = (await amb.entrar("Carla Melo", "3", "333333")).json.token;
    await amb.entrar("Davi Rocha", "1", "444444"); // só entrou
    await salvarTextos(amb, ana, { "poema-carpe-diem": POEMA });
    await salvarTextos(amb, bia, { leitores: textoJogo({ fases: 7, total: 7, concluiu: true }), "cronica-olhar": textoJogo({ fases: 0, total: 6, partes: [] }) });
    await salvarTextos(amb, carla, {}, { resumo: { fases: 7 } }); // abriu o jogo, nenhuma atividade
    // Registro antigo (sem textos), gravado do jeito de antes (sem metadados).
    await amb.store.set("alunos/2/pedro-lima", {
      id: "2/pedro-lima", nome: "PEDRO LIMA", turma: "2ª Série", turmaKey: "2", nomeKey: "pedro-lima",
      pinSalt: "00", pinHash: "00", pinVersao: 1, falhas: 0, bloqueadoAte: 0, estado: { v: 3 },
      paras: ["Parágrafo antigo.", "", "", ""], resumo: { fases: 4, xp: 200, nivel: 2, linhas: 5, etapa: "Fase 5" }, criadoEm: 1, atualizadoEm: 2,
    });
    const r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    const por = Object.fromEntries(r.json.alunos.map((a) => [a.id, a]));
    assert.deepEqual(por["1/ana-souza"].atividades, [{ id: "poema-carpe-diem", fases: 6, total: 6, concluiu: true, temTexto: true }]);
    assert.equal(por["1/ana-souza"].concluiu, true);
    assert.deepEqual(por["2/bia-lima"].atividades.map((a) => [a.id, a.concluiu, a.temTexto]), [["leitores", true, true], ["cronica-olhar", false, false]]);
    assert.equal(por["2/bia-lima"].concluiu, false, "ainda falta a crônica");
    assert.deepEqual(por["3/carla-melo"].atividades, []);
    assert.equal(por["3/carla-melo"].concluiu, false, "com textos (mesmo vazio), concluiu vem das atividades");
    assert.deepEqual(por["1/davi-rocha"].atividades, []);
    assert.equal(por["1/davi-rocha"].concluiu, false);
    assert.deepEqual(por["2/pedro-lima"].atividades, [{ id: "leitores", fases: 4, total: 7, concluiu: false, temTexto: true }]);
    assert.equal(por["2/pedro-lima"].concluiu, false);
    for (const a of r.json.alunos) {
      assert.equal(a.coringa, false);
      assert.ok(!("textos" in a) && !("paras" in a), "a lista não traz os textos");
    }
  });

  test("professor/aluno: devolve os textos (GET e POST) e migra o registro antigo só na leitura", async () => {
    const amb = await ambienteProfessor();
    const { token } = (await amb.entrar("Ana Souza", "1", "111111")).json;
    await salvarTextos(amb, token, { "poema-carpe-diem": POEMA, leitores: textoJogo() });
    let r = await amb.chamar("GET", "/api/professor/aluno?id=1/ana-souza", undefined, { token: amb.tokenProf });
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.json.aluno.textos), ["poema-carpe-diem", "leitores"]);
    assert.deepEqual(r.json.aluno.textos["poema-carpe-diem"], { ...POEMA, partes: ["Verso um\nVerso dois\nVerso três\nVerso quatro", "Outro verso\nMais um", ""] });
    assert.deepEqual(r.json.aluno.atividades.map((a) => a.id), ["poema-carpe-diem", "leitores"]);
    const post = await amb.chamar("POST", "/api/professor/aluno", { id: "1/ana-souza" }, { token: amb.tokenProf });
    assert.deepEqual(post.json, r.json);
    r = await amb.chamar("POST", "/api/professor/aluno", { id: "../config/segredo" }, { token: amb.tokenProf });
    assert.deepEqual([r.status, r.json.erro], [400, "id"]);
    r = await amb.chamar("POST", "/api/professor/aluno", { id: "1/ana-souza" });
    assert.equal(r.status, 401, "precisa do token do professor");

    // Registro antigo com parágrafos: vira a atividade "leitores" na leitura (o registro não muda).
    const antigo = {
      id: "2/pedro-lima", nome: "PEDRO LIMA", turma: "2ª Série", turmaKey: "2", nomeKey: "pedro-lima",
      pinSalt: "00", pinHash: "00", pinVersao: 1, falhas: 0, bloqueadoAte: 0, estado: { v: 3 },
      paras: ["Intro antiga.", "Arg 1.", "", "Conclusão."], resumo: { fases: 5, xp: 300, nivel: 2, linhas: 5, etapa: "" }, criadoEm: 1, atualizadoEm: 2,
    };
    await amb.store.set("alunos/2/pedro-lima", antigo);
    r = await amb.chamar("GET", "/api/professor/aluno?id=2/pedro-lima", undefined, { token: amb.tokenProf });
    assert.deepEqual(r.json.aluno.textos, {
      leitores: {
        rotulo: "Texto 1",
        genero: "Dissertativo-argumentativo",
        tema: "Os desafios para a formação de leitores no Brasil",
        serie: "2",
        titulo: "",
        partes: ["Intro antiga.", "Arg 1.", "", "Conclusão."],
        nomesPartes: ["Introdução", "1º argumento", "2º argumento", "Conclusão"],
        verso: false,
        fases: 5,
        total: 7,
        concluiu: false,
        xp: 300,
      },
    });
    assert.deepEqual(await amb.store.get("alunos/2/pedro-lima"), antigo, "migração só na leitura");
    await amb.store.set("alunos/2/pedro-lima", { ...antigo, resumo: { fases: 7, xp: 9 } });
    r = await amb.chamar("GET", "/api/professor/aluno?id=2/pedro-lima", undefined, { token: amb.tokenProf });
    assert.deepEqual([r.json.aluno.textos.leitores.concluiu, r.json.aluno.textos.leitores.fases, r.json.aluno.concluiu], [true, 7, true]);
    // Antigo sem parágrafos: sem textos.
    await amb.store.set("alunos/2/pedro-lima", { ...antigo, paras: ["", " ", "", ""] });
    r = await amb.chamar("GET", "/api/professor/aluno?id=2/pedro-lima", undefined, { token: amb.tokenProf });
    assert.deepEqual(r.json.aluno.textos, {});
  });
});

// ---------------------------------------------------------------------------
// Mudança 4: perfil de teste do professor ("coringa"). PINs inventados.
// ---------------------------------------------------------------------------

const PROF = "GUILHERME CAMOZZATO TEIXEIRA"; // o padrão (o nome do professor já aparece no site)
const ID_PROF = "perfil-teste/guilherme-camozzato-teixeira";

describe("perfil de teste (coringa)", () => {
  test("lerCoringas: padrão sem a variável; lista JSON; texto por linha/vírgula/ponto e vírgula; vazia ou quebrada → nenhum", () => {
    assert.deepEqual(lerCoringas(undefined), [PROF]);
    assert.deepEqual(lerCoringas(null), [PROF]);
    for (const v of ["", "   ", "[]", "[quebrado", '{"a":1}', "{}", '["Fulano"]', 42, "Fulano"]) {
      assert.deepEqual(lerCoringas(v), [], String(v));
    }
    assert.deepEqual(lerCoringas('["Prof Teste Um", "prof   teste um", 7, "Sozinho", "Ána Teste"]'), ["PROF TESTE UM", "ANA TESTE"]);
    assert.deepEqual(lerCoringas("﻿Prof Teste Um\nProf Teste Dois;Prof Teste Tres, Prof Teste Quatro\r\n\nUma"), [
      "PROF TESTE UM",
      "PROF TESTE DOIS",
      "PROF TESTE TRES",
      "PROF TESTE QUATRO",
    ]);
    const muitos = Array.from({ length: 14 }, (_, i) => `Prof Teste ${"x".repeat(i + 1)}`);
    assert.equal(lerCoringas(JSON.stringify(muitos)).length, 10);
    assert.deepEqual(lerCoringas(JSON.stringify(["Prof " + "Longo ".repeat(20), "Prof Curto"])), ["PROF CURTO"], "nome que não cabe num id é ignorado");
  });

  test("lerSenhaCoringa: formato <salt>:<hash>", () => {
    const salt = "a".repeat(32), hash = "b".repeat(64);
    assert.deepEqual(lerSenhaCoringa(undefined), { estado: "ausente" });
    assert.deepEqual(lerSenhaCoringa("  "), { estado: "ausente" });
    assert.deepEqual(lerSenhaCoringa(` ${salt.toUpperCase()}:${hash} `), { estado: "ok", salt, hash });
    for (const v of ["123456", `${salt}:${hash.slice(1)}`, `${salt}${hash}`, `${salt}:${hash}:x`, `zz${salt.slice(2)}:${hash}`]) {
      assert.equal(lerSenhaCoringa(v).estado, "invalida", v);
    }
  });

  test("entra por qualquer série com o mesmo cadastro; só o nome exato; turma 'Perfil de teste'", async () => {
    const amb = ambiente();
    let r = await amb.entrar("Guilherme Camozzato Teixeira", "1", "135790");
    assert.equal(r.status, 200, r.texto);
    assert.equal(r.json.novo, true);
    assert.deepEqual(r.json.aluno, { id: ID_PROF, nome: PROF, turma: "Perfil de teste", coringa: true });
    const reg = await amb.store.get("alunos/" + ID_PROF);
    assert.deepEqual([reg.coringa, reg.turmaKey, reg.turma, reg.nome], [true, "perfil-teste", "Perfil de teste", PROF]);

    for (const [serie, nome] of [["3", "GUILHERME CAMOZZATO TEIXEIRA"], ["2", "  guilhérme   camozzato teixeira. "]]) {
      r = await amb.entrar(nome, serie, "135790");
      assert.equal(r.status, 200, serie);
      assert.equal(r.json.novo, false);
      assert.equal(r.json.aluno.id, ID_PROF);
      assert.equal(r.json.aluno.coringa, true);
    }
    r = await amb.entrar("Guilherme Camozzato Teixeira", "9", "135790");
    assert.deepEqual([r.status, r.json.erro], [400, "turma"], "a série precisa existir");
    // Parcial não vira coringa (cai na busca normal da série).
    for (const nome of ["Guilherme Teixeira", "Guilherme Camozzato", "Guilherme Camozzato Teixeira Junior"]) {
      r = await amb.entrar(nome, "2", "135790");
      assert.deepEqual([r.status, r.json.erro], [404, "nome"], nome);
    }
    assert.deepEqual((await amb.store.list("alunos/")).sort(), ["alunos/" + ID_PROF]);
    // A resposta de um aluno normal não muda (sem `coringa`).
    r = await amb.entrar("Maria Souza", "2", "123456");
    assert.deepEqual(r.json.aluno, { id: "2/maria-souza", nome: "MARIA SOUZA", turma: "2ª Série" });
    // /api/turmas continua sem nomes (nem o do coringa).
    const t = await amb.chamar("GET", "/api/turmas");
    assert.ok(!/GUILHERME|CAMOZZATO|SOUZA/i.test(t.texto));
    chavesSeguras(amb.store);
  });

  test("o coringa vem antes da lista; um aluno com nome parecido nunca cai no perfil de teste", async () => {
    const turmas = [
      { label: "1ª Série", alunos: ["Guilherme Camozzato Teixeira Junior", "Guilherme Souza"] },
      { label: "2ª Série", alunos: ["Guilherme Camozzato Teixeira"] },
    ];
    const amb = ambiente({ turmas });
    let r = await amb.entrar("Guilherme Camozzato Teixeira", "2", "135790");
    assert.equal(r.json.aluno.id, ID_PROF, "o professor está na lista da 2ª, mas vale o coringa");
    r = await amb.entrar("Guilherme Camozzato Teixeira", "1", "135790");
    assert.equal(r.json.aluno.id, ID_PROF, "na 1ª, o nome parcial do aluno Junior não importa");
    r = await amb.entrar("Guilherme Camozzato Teixeira Junior", "1", "246802");
    assert.deepEqual([r.status, r.json.aluno.id, r.json.aluno.coringa], [200, "1/guilherme-camozzato-teixeira-junior", undefined]);
    r = await amb.entrar("Guilherme Junior", "1", "246802");
    assert.equal(r.json.aluno.id, "1/guilherme-camozzato-teixeira-junior");
  });

  test("ALUNOS_CORINGA: lista própria; vazia ou quebrada → ninguém é coringa e nada quebra", async () => {
    let amb = ambiente({ envExtra: { ALUNOS_CORINGA: '["Prof Teste Um"]' } });
    let r = await amb.entrar("prof teste um", "3", "111111");
    assert.deepEqual([r.status, r.json.aluno.id, r.json.aluno.turma], [200, "perfil-teste/prof-teste-um", "Perfil de teste"]);
    r = await amb.entrar("Guilherme Camozzato Teixeira", "1", "111111");
    assert.deepEqual([r.status, r.json.erro], [404, "nome"], "com a variável, o padrão não vale");

    amb = ambiente({ envExtra: { ALUNOS_CORINGA: "Prof Teste Um\nProf Teste Dois" } });
    r = await amb.entrar("Prof Teste Dois", "1", "111111");
    assert.equal(r.json.aluno.id, "perfil-teste/prof-teste-dois");

    const erroOriginal = console.error;
    console.error = () => {};
    try {
      for (const v of ["", "[]", "[quebrado"]) {
        amb = ambiente({ envExtra: { ALUNOS_CORINGA: v } });
        r = await amb.entrar("Guilherme Camozzato Teixeira", "1", "111111");
        assert.deepEqual([r.status, r.json.erro], [404, "nome"], JSON.stringify(v));
        r = await amb.entrar("Ana Souza", "1", "111111");
        assert.equal(r.status, 200, "alunos continuam entrando");
        assert.equal((await amb.chamar("GET", "/api/turmas")).status, 200);
      }
    } finally {
      console.error = erroOriginal;
    }
  });

  test("CORINGA_SENHA: o cadastro nasce com a senha do professor; PIN errado conta para o bloqueio", async () => {
    const { salt, hash } = await hashPin("246810");
    const amb = ambiente({ envExtra: { CORINGA_SENHA: `${salt}:${hash}` } });
    let r = await amb.entrar("Guilherme Camozzato Teixeira", "1", "111111");
    assert.deepEqual([r.status, r.json.erro, r.json.restantes], [401, "senha", 4], "quem chega antes com outro PIN não fica com o perfil");
    const reg = await amb.store.get("alunos/" + ID_PROF);
    assert.deepEqual([reg.pinSalt, reg.pinHash, reg.coringa, reg.falhas], [salt, hash, true, 1]);
    r = await amb.entrar("Guilherme Camozzato Teixeira", "2", "246810");
    assert.deepEqual([r.status, r.json.novo, r.json.aluno.id], [200, false, ID_PROF]);
    assert.equal(r.json.senhaNova, undefined);
    assert.equal((await amb.store.get("alunos/" + ID_PROF)).falhas, 0);
    for (let i = 0; i < 4; i++) await amb.entrar("Guilherme Camozzato Teixeira", "3", "000000");
    r = await amb.entrar("Guilherme Camozzato Teixeira", "3", "000000");
    assert.deepEqual([r.status, r.json.erro], [429, "bloqueado"]);
    r = await amb.entrar("Guilherme Camozzato Teixeira", "3", "246810");
    assert.equal(r.status, 429, "bloqueado mesmo com a senha certa");
    amb.avancar(16 * MIN);
    r = await amb.entrar("Guilherme Camozzato Teixeira", "3", "246810");
    assert.equal(r.status, 200);

    // Depois de criado, é um cadastro como os outros: "Apagar senha do aluno" gera 6 números novos.
    const tp = await comProfessor(amb);
    r = await amb.chamar("POST", "/api/professor/redefinir", { id: ID_PROF }, { token: tp });
    assert.match(r.json.pin, /^\d{6}$/);
    assert.equal((await amb.entrar("Guilherme Camozzato Teixeira", "1", "246810")).status, 401);
    assert.equal((await amb.entrar("Guilherme Camozzato Teixeira", "1", r.json.pin)).status, 200);
  });

  test("CORINGA_SENHA: sem a variável, o 1º acesso cria a senha digitada; inválida, o perfil não é criado", async () => {
    let amb = ambiente();
    let r = await amb.entrar("Guilherme Camozzato Teixeira", "1", "121212");
    assert.deepEqual([r.status, r.json.novo], [200, true]);
    assert.equal((await amb.entrar("Guilherme Camozzato Teixeira", "1", "343434")).status, 401);

    const erroOriginal = console.error;
    console.error = () => {};
    try {
      amb = ambiente({ envExtra: { CORINGA_SENHA: "121212" } });
      r = await amb.entrar("Guilherme Camozzato Teixeira", "1", "121212");
      assert.deepEqual([r.status, r.json.erro], [503, "coringa"]);
      assert.deepEqual(await amb.store.list("alunos/"), []);
      assert.equal((await amb.entrar("Ana Souza", "1", "121212")).status, 200, "alunos continuam entrando");
    } finally {
      console.error = erroOriginal;
    }
  });

  test("dev/hash-pin.mjs gera um valor que a API aceita (PIN pela entrada padrão)", async () => {
    const { spawnSync } = await import("node:child_process");
    const script = fileURLToPath(new URL("../dev/hash-pin.mjs", import.meta.url));
    const p = spawnSync(process.execPath, [script], { input: "975310\n", encoding: "utf8" });
    assert.equal(p.status, 0, p.stderr);
    const valor = p.stdout.trim();
    assert.match(valor, /^[0-9a-f]{32}:[0-9a-f]{64}$/);
    assert.ok(!p.stdout.includes("975310") && !p.stderr.includes("975310"), "não mostra o PIN");
    const amb = ambiente({ envExtra: { CORINGA_SENHA: valor } });
    assert.equal((await amb.entrar("Guilherme Camozzato Teixeira", "1", "975311")).status, 401);
    assert.equal((await amb.entrar("Guilherme Camozzato Teixeira", "1", "975310")).status, 200);
    // PIN errado ou na linha de comando: não gera nada.
    for (const [args, input] of [[[], "12345\n"], [[], "abcdef\n"], [["975310"], ""]]) {
      const q = spawnSync(process.execPath, [script, ...args], { input, encoding: "utf8" });
      assert.notEqual(q.status, 0);
      assert.equal(q.stdout, "");
    }
  });

  test("lista, metadados e GET /api/professor/turmas mostram o perfil de teste", async () => {
    const amb = await ambienteProfessor();
    const t = (await amb.entrar("Guilherme Camozzato Teixeira", "2", "135790")).json.token;
    await amb.entrar("Maria Souza", "2", "123456");
    await salvarTextos(amb, t, { "poema-carpe-diem": POEMA, leitores: textoJogo(), "justica-climatica": textoJogo({ serie: "3", total: 7 }) });
    const meta = (await amb.store.getMeta("alunos/" + ID_PROF)).metadata;
    assert.equal(meta.coringa, true);
    assert.equal(meta.turmaKey, "perfil-teste");
    assert.ok(!("coringa" in (await amb.store.getMeta("alunos/2/maria-souza")).metadata));

    let r = await amb.chamar("GET", "/api/professor/alunos", undefined, { token: amb.tokenProf });
    const prof = r.json.alunos.find((a) => a.id === ID_PROF);
    assert.deepEqual([prof.coringa, prof.turma, prof.turmaKey, prof.atividades.length], [true, "Perfil de teste", "perfil-teste", 3]);
    assert.equal(r.json.alunos.find((a) => a.id === "2/maria-souza").coringa, false);
    r = await amb.chamar("GET", "/api/professor/aluno?id=" + ID_PROF, undefined, { token: amb.tokenProf });
    assert.equal(r.json.aluno.coringa, true);
    assert.deepEqual(Object.keys(r.json.aluno.textos), ["poema-carpe-diem", "leitores", "justica-climatica"]);

    r = await amb.chamar("GET", "/api/professor/turmas", undefined, { token: amb.tokenProf });
    assert.deepEqual(r.json.coringas, [PROF]);
    const sem = ambiente({ envExtra: { ALUNOS_CORINGA: "" } });
    const tp = await comProfessor(sem);
    r = await sem.chamar("GET", "/api/professor/turmas", undefined, { token: tp });
    assert.deepEqual(r.json.coringas, []);
  });

  test("GET/POST /api/professor/turmas dizem se CORINGA_SENHA está configurada (sem nunca mostrar o valor)", async () => {
    const { salt, hash } = await hashPin("864200");
    const erroOriginal = console.error;
    console.error = () => {};
    try {
      for (const [valor, esperado] of [
        [undefined, false],
        ["", false],
        ["   ", false],
        ["864200", false], // PIN em texto não é o formato
        [`${salt}:${hash.slice(2)}`, false],
        [`${salt}:${hash}`, true],
        [` ${salt.toUpperCase()}:${hash}\n`, true],
      ]) {
        const amb = ambiente({ envExtra: valor === undefined ? {} : { CORINGA_SENHA: valor } });
        const tp = await comProfessor(amb);
        const g = await amb.chamar("GET", "/api/professor/turmas", undefined, { token: tp });
        assert.equal(g.status, 200);
        assert.equal(g.json.coringaSenha, esperado, JSON.stringify(valor));
        // Existe mas está fora do formato: o painel avisa (o perfil de teste não é criado até corrigir).
        const invalida = typeof valor === "string" && valor.trim() !== "" && !esperado;
        assert.equal(g.json.coringaSenhaInvalida === true, invalida, "coringaSenhaInvalida " + JSON.stringify(valor));
        const p = await amb.chamar("POST", "/api/professor/turmas", { turmas: [{ label: "1ª Série", alunos: ["Ana Souza"] }] }, { token: tp });
        assert.equal(p.json.coringaSenha, esperado);
        for (const r of [g, p]) {
          assert.ok(!r.texto.includes(hash) && !r.texto.includes(salt) && !r.texto.includes("864200"), "o valor da variável não sai na resposta");
        }
        // Só para o professor; a rota pública não diz nada sobre o perfil de teste.
        assert.equal((await amb.chamar("GET", "/api/professor/turmas")).status, 401);
        const pub = await amb.chamar("GET", "/api/turmas");
        assert.ok(!("coringaSenha" in pub.json) && !("coringas" in pub.json));
      }
    } finally {
      console.error = erroOriginal;
    }
  });
});
