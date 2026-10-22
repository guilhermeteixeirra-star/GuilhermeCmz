// Teste ponta a ponta (Playwright): aluno entra, escolhe a atividade na caixa de atividades, joga até a
// folha de redação, o texto fica salvo no servidor, outro celular continua de onde parou, o professor vê o
// texto na seção da atividade e cria uma senha nova. O perfil de teste do professor ("coringa") entra pela
// 1ª série, vê as atividades de todas as séries e aparece no painel como "Perfil de teste".
//
// Uso (sobe o servidor local sozinho, com os dados só na memória e uma lista de alunos INVENTADA,
// gravada num arquivo temporário e passada com --turmas):
//   NODE_PATH=$(npm root -g) node tests/e2e.mjs
// Variáveis opcionais:
//   BASE=http://localhost:8888       usa um servidor que já está rodando (a lista dele precisa ter
//                                    "ANA SOUZA" na série de chave "2"; ex.: --turmas com a LISTA_E2E abaixo).
//                                    As partes do perfil de teste e dos textos hostis só rodam com o servidor do próprio teste
//                                    (ele sobe com CORINGA_SENHA de um PIN inventado e sem ALUNOS_CORINGA).
//   CHROMIUM=/caminho/do/chromium    navegador (padrão: /opt/pw-browsers/chromium, se existir)
//   MR_SENHA_PROFESSOR=...           senha do professor (ou MR_SENHA_PROFESSOR_ARQUIVO=arquivo);
//                                    sem ela, a parte do professor é pulada.
// Não é rodado por `node --test tests/` (lá rodam os tests/*.test.mjs).

import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import vm from "node:vm";
import { readdirSync } from "node:fs";
import { hashPin } from "../src/core.mjs";

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("Playwright não encontrado. Rode com NODE_PATH=$(npm root -g) ou instale o playwright.");
  process.exit(2);
}

const SITE = fileURLToPath(new URL("..", import.meta.url));
const CHROMIUM = process.env.CHROMIUM || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const ARQ_SENHA = process.env.MR_SENHA_PROFESSOR_ARQUIVO || fileURLToPath(new URL("../../senha-professor.txt", import.meta.url));
const SENHA_PROF = process.env.MR_SENHA_PROFESSOR || (existsSync(ARQ_SENHA) ? readFileSync(ARQ_SENHA, "utf8").trim() : "");

let falhas = 0;
let passos = 0;
function ok(cond, msg) {
  passos++;
  if (cond) console.log("  ok  " + msg);
  else {
    falhas++;
    console.log("  FALHOU  " + msg);
  }
}
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function portaLivre() {
  return new Promise((res) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port;
      s.close(() => res(p));
    });
  });
}

// Atividades (os mesmos arquivos que o jogo e o painel carregam).
function catalogo() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of readdirSync(path.join(SITE, "public/atividades")).filter((f) => f.endsWith(".js"))) {
    try {
      vm.runInContext(readFileSync(path.join(SITE, "public/atividades", f), "utf8"), ctx);
    } catch (e) {
      console.log(`  (atividade ${f} com erro: ${e.message})`);
    }
  }
  return (ctx.window.ATIVIDADES || []).filter((a) => a && a.id && Array.isArray(a.fases));
}
const ATIVIDADES = catalogo();

// Perfil de teste: o nome padrão (sem ALUNOS_CORINGA) e um PIN INVENTADO, que vira CORINGA_SENHA do servidor.
const CORINGA = { nome: "Guilherme Camozzato Teixeira", pin: "246810" };

// Lista de alunos inventada (a lista de verdade nunca entra no repositório).
const LISTA_E2E = [
  { label: "1ª Série", alunos: ["Bruno Dias Teste", "Ana Souza"] },
  { label: "2ª Série", alunos: ["Ana Souza", "Pedro Lima Teste", "Ana Paula Ribeiro Costa"] },
];

let BASE = process.env.BASE;
let srv = null;
let dirTemp = null;
if (!BASE) {
  const porta = await portaLivre();
  BASE = `http://127.0.0.1:${porta}`;
  dirTemp = mkdtempSync(path.join(tmpdir(), "mr-e2e-"));
  const arqTurmas = path.join(dirTemp, "turmas.json");
  writeFileSync(arqTurmas, JSON.stringify(LISTA_E2E));
  const { salt, hash } = await hashPin(CORINGA.pin);
  const envServidor = { ...process.env, CORINGA_SENHA: `${salt}:${hash}` };
  delete envServidor.ALUNOS_CORINGA;
  srv = spawn(process.execPath, ["dev/server.mjs", String(porta), "--turmas", arqTurmas], { cwd: SITE, stdio: ["ignore", "ignore", "inherit"], env: envServidor });
  // Fecha o servidor e apaga o arquivo temporário em qualquer saída (até se o navegador nem abrir).
  process.on("exit", () => {
    try {
      srv.kill("SIGTERM");
    } catch {
      /* já fechado */
    }
    rmSync(dirTemp, { recursive: true, force: true });
  });
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(BASE + "/");
      break;
    } catch {
      await esperar(100);
    }
  }
}

async function api(caminho, corpo) {
  const r = await fetch(BASE + caminho, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corpo) });
  return { status: r.status, json: await r.json() };
}
async function apiGet(caminho) {
  const r = await fetch(BASE + caminho);
  const texto = await r.text();
  let json = null;
  try {
    json = JSON.parse(texto);
  } catch {
    /* fica null */
  }
  return { status: r.status, json, texto };
}

// O Chromium cria um socket Unix dentro de $TMPDIR, e caminho de socket tem limite (~107 caracteres):
// com um TMPDIR muito comprido ele nem abre. Nesse caso, só o navegador usa a pasta temporária padrão.
const envNavegador = { ...process.env };
if ((process.env.TMPDIR || "").length > 60) delete envNavegador.TMPDIR;
const browser = await chromium.launch({ ...(CHROMIUM ? { executablePath: CHROMIUM } : {}), env: envNavegador });
const errosPagina = [];
async function celular() {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (r) => r.abort()); // não depende da internet
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errosPagina.push(e.message));
  p.on("dialog", (d) => {
    errosPagina.push("dialog aberto: " + d.type());
    d.dismiss();
  });
  return { ctx, p };
}

// `turma` é a CHAVE da série ("2"), como vem de GET /api/turmas.
// DOM do jogo (public/index.html, mantido por outra pessoa): botões [data-act="serie"][data-k=<chave>],
// #in-nome, #in-pin, #btn-entrar, .erro e [data-act="sair"]. Se o jogo ainda tiver o campo antigo
// #in-turma, ele é preenchido (ou escolhido, se for <select>).
async function entrarAluno(p, nome, turma, pin) {
  await p.goto(BASE + "/");
  await p.waitForSelector("#in-nome");
  const botaoSerie = `[data-act="serie"][data-k="${turma}"]`;
  await p.waitForSelector(`${botaoSerie}, #in-turma`, { timeout: 8000 }).catch(() => {});
  if (await p.$(botaoSerie)) await p.click(botaoSerie);
  else if (await p.$("select#in-turma")) await p.selectOption("#in-turma", turma);
  else if (await p.$("#in-turma")) await p.fill("#in-turma", turma);
  await p.fill("#in-nome", nome);
  await p.fill("#in-pin", pin);
  await p.click("#btn-entrar");
  await Promise.race([p.waitForSelector('[data-act="sair"]', { timeout: 8000 }), p.waitForSelector(".erro", { timeout: 8000 })]).catch(() => {});
}

// Depois de entrar, o aluno cai na caixa de atividades: toca na atividade.
async function abrirAtividade(p, id) {
  const sel = `[data-act=ativ][data-a="${id}"]`;
  await p.waitForSelector(sel, { timeout: 8000 }).catch(() => {});
  if (!(await p.$(sel))) return false;
  await p.click(sel);
  await p.waitForSelector("[data-act=open].btn.primary", { timeout: 8000 }).catch(() => {});
  return !!(await p.$("[data-act=open].btn.primary"));
}

// Joga todas as fases escolhendo respostas até chegar na folha de redação.
// O jogo ignora o mesmo tipo de toque repetido em menos de 450 ms (toque duplo): espera mais que isso.
const TOQUE = 500;
async function jogarTudo(p) {
  let travou = 0;
  for (let n = 0; n < 300; n++) {
    if (await p.$("textarea[data-folha]")) return true;
    if ((await p.$(".station.now")) && !(await p.$(".fhead"))) {
      await (await p.$("[data-act=open].btn.primary")).click();
      await esperar(TOQUE);
      continue;
    }
    for (let k = 0; k < 5; k++) {
      if (await p.$("#next:not([disabled])")) break;
      const b = await p.$(`[data-act=ans][data-k="${k}"]:not([disabled])`);
      if (b) {
        await b.click();
        await esperar(TOQUE);
      }
    }
    if ((await p.$("[data-act=causa]")) && !(await p.$("#next:not([disabled])"))) {
      // a tela é redesenhada a cada toque: procura o botão de novo a cada vez
      const ids = await p.$$eval("[data-act=causa]", (bs) => bs.map((b) => b.getAttribute("data-c")));
      for (const id of ["acesso", "desigualdade", ...ids]) {
        if (await p.$("#next:not([disabled])")) break;
        const b = await p.$(`[data-act=causa][data-c="${id}"]:not([disabled])`);
        if (b) {
          await b.click();
          await esperar(TOQUE);
        }
      }
    }
    if ((await p.$("[data-act=abertura]")) && !(await p.$("#next:not([disabled])"))) {
      await (await p.$("[data-act=abertura]")).click();
      await esperar(TOQUE);
    }
    for (let k = 0; k < 5; k++) {
      if (await p.$("[data-act=opt]")) break;
      const b = await p.$(`[data-act=con][data-k="${k}"]:not([disabled])`);
      if (b) {
        await b.click();
        await esperar(TOQUE);
      }
    }
    if ((await p.$("[data-act=opt]")) && !(await p.$("#next:not([disabled])"))) {
      const b = await p.$("[data-act=opt]:not([disabled])");
      if (b) {
        await b.click();
        await esperar(TOQUE);
      }
    }
    if ((await p.$("[data-act=prop]")) && !(await p.$("#next:not([disabled])"))) {
      for (const g of ["agente", "acao", "meio", "fim"]) {
        const b = await p.$(`[data-act=prop][data-g=${g}][data-k="0"]`);
        if (b) {
          await b.click();
          await esperar(TOQUE);
        }
      }
    }
    const next = await p.$("#next:not([disabled])");
    if (!next) {
      if (++travou <= 2) continue; // um toque pode ter caído dentro da proteção contra toque duplo
      console.log("  (travou em: " + ((await p.textContent("#screen")) || "").slice(0, 160).replace(/\s+/g, " ") + ")");
      return false;
    }
    travou = 0;
    await next.click();
    await esperar(TOQUE);
  }
  return false;
}

async function esperarSalvo(p, ms = 15000) {
  try {
    await p.waitForSelector("#sync.ok", { timeout: ms });
    return true;
  } catch {
    return false;
  }
}

const ALUNO = { nome: "Ana Souza", turma: "2", pin: "123456" };
let codigoSaida = 0;
try {
  console.log("\n== API: lista de séries e nome da lista ==");
  const series = await apiGet("/api/turmas");
  ok(series.status === 200 && series.json.ok && series.json.turmas.some((t) => t.key === "2"), "/api/turmas tem a série 2");
  ok(!/SOUZA|LIMA|RIBEIRO/i.test(series.texto), "/api/turmas não mostra nomes de alunos");
  let r = await api("/api/entrar", { nome: "Fulano Inventado", turma: "2", pin: "123456" });
  ok(r.status === 404 && r.json.erro === "nome", "nome fora da lista → 404");
  r = await api("/api/entrar", { nome: "Ana Souza", turma: "9", pin: "123456" });
  ok(r.status === 400 && r.json.erro === "turma", "série desconhecida → 400");
  r = await api("/api/entrar", { nome: "Ana Souza", turma: "2", pin: "1234" });
  ok(r.status === 400 && r.json.erro === "pin" && /6 números/.test(r.json.msg), "senha de 4 números → 400");

  console.log("\n== Aluno: primeiro acesso e jogo inteiro ==");
  const a = await celular();
  await entrarAluno(a.p, ALUNO.nome, ALUNO.turma, ALUNO.pin);
  ok(!!(await a.p.$('[data-act="sair"]')), "aluno novo entra");
  ok(((await a.p.textContent(".lembrete").catch(() => "")) || "").includes(ALUNO.pin), "lembrete da senha aparece no primeiro acesso");
  const sessao = await a.p.evaluate(() => JSON.parse(localStorage.getItem("mr3:sessao") || "null"));
  ok(sessao && sessao.id === "2/ana-souza" && sessao.token, "sessão guardada no celular");
  ok(sessao && sessao.nome === "ANA SOUZA", "o nome guardado é o da lista (MAIÚSCULAS)");
  const caixa = await a.p.$$eval("[data-act=ativ]", (bs) => bs.map((b) => b.getAttribute("data-a")));
  const da2 = ATIVIDADES.filter((x) => String(x.serie) === "2").map((x) => x.id);
  ok(caixa.length === da2.length && da2.every((id) => caixa.includes(id)), "a caixa de atividades mostra as atividades da 2ª série: " + caixa.join(", "));
  ok(await abrirAtividade(a.p, "leitores"), "abre a atividade Texto 1 (leitores)");

  ok(await jogarTudo(a.p), "chegou na folha de redação");
  const parasTela = (await a.p.$$eval("textarea[data-folha]", (t) => t.map((x) => x.value.trim()))).slice(0, 4);
  ok(parasTela.length === 4 && parasTela.every((x) => x.length > 20), "os 4 parágrafos estão escritos na folha");
  ok(await esperarSalvo(a.p), "indicador mostra 'Salvo'");
  const noServidor = await api("/api/estado", { token: sessao.token });
  ok(noServidor.status === 200 && noServidor.json.estado, "progresso está no servidor");
  ok(
    noServidor.json.paras && noServidor.json.paras.every((x, i) => x.trim() === parasTela[i]),
    "os parágrafos do servidor são os mesmos da tela",
  );

  console.log("\n== Aluno: outro celular continua de onde parou ==");
  const b = await celular();
  await entrarAluno(b.p, "ána  souza.", ALUNO.turma, ALUNO.pin);
  ok(!!(await b.p.$('[data-act="sair"]')), "entra com o nome escrito de outro jeito (minúsculas, acento, pontos)");
  ok(((await b.p.textContent('[data-act=ativ][data-a="leitores"]').catch(() => "")) || "").includes("Concluída"), "na caixa, a atividade aparece como concluída");
  await abrirAtividade(b.p, "leitores");
  const btn = await b.p.$("[data-act=open].btn.primary");
  if (btn) await btn.click();
  await b.p.waitForSelector("textarea[data-folha]", { timeout: 5000 }).catch(() => {});
  const parasB = (await b.p.$$eval("textarea[data-folha]", (t) => t.map((x) => x.value.trim()))).slice(0, 4);
  ok(JSON.stringify(parasB) === JSON.stringify(parasTela), "a redação aparece igual no outro celular");
  await b.ctx.close();

  console.log("\n== Aluno: senha errada ==");
  const c = await celular();
  await entrarAluno(c.p, ALUNO.nome, ALUNO.turma, "999999");
  ok(((await c.p.textContent(".erro").catch(() => "")) || "").includes("Senha errada"), "senha errada mostra o aviso");

  const comCoringa = !process.env.BASE;
  const outraSerie = ATIVIDADES.find((x) => String(x.serie) !== "1") || ATIVIDADES[0];
  if (comCoringa) {
    console.log("\n== Perfil de teste: entra pela 1ª série e vê as atividades de todas as séries ==");
    const t = await celular();
    await entrarAluno(t.p, CORINGA.nome, "1", "111111");
    ok(((await t.p.textContent(".erro").catch(() => "")) || "").includes("Senha errada"), "com outro PIN não entra (a senha inicial é a do professor)");
    await entrarAluno(t.p, CORINGA.nome, "1", CORINGA.pin);
    ok(!!(await t.p.$('[data-act="sair"]')), "o perfil de teste entra pela 1ª série");
    const sess = await t.p.evaluate(() => JSON.parse(localStorage.getItem("mr3:sessao") || "null"));
    ok(sess && sess.id === "perfil-teste/guilherme-camozzato-teixeira" && sess.coringa === true && sess.turma === "Perfil de teste", "sessão do perfil de teste (id perfil-teste/…, coringa)");
    const ids = await t.p.$$eval("[data-act=ativ]", (bs) => bs.map((b) => b.getAttribute("data-a")));
    ok(ids.length === ATIVIDADES.length && ATIVIDADES.every((x) => ids.includes(x.id)), `vê as ${ATIVIDADES.length} atividades de todas as séries: ${ids.join(", ")}`);
    const grupos = await t.p.$$eval(".ativ-serie", (ps) => ps.map((x) => x.textContent.trim()));
    const series = [...new Set(ATIVIDADES.map((x) => String(x.serie)))].sort();
    ok(grupos.length === series.length && series.every((k) => grupos.includes(`${k}ª Série`)), "agrupadas por série: " + grupos.join(", "));
    ok(await abrirAtividade(t.p, outraSerie.id), `abre uma atividade de outra série (${outraSerie.id})`);
    ok(await esperarSalvo(t.p), "o progresso do perfil de teste é salvo");
    await t.ctx.close();
  }

  if (!SENHA_PROF) {
    console.log("\n== Professor: pulado (sem MR_SENHA_PROFESSOR) ==");
  } else {
    console.log("\n== Professor: vê a redação e cria uma senha nova ==");
    const pr = await celular();
    await pr.p.goto(BASE + "/professor/");
    await pr.p.fill("#senha", SENHA_PROF);
    await pr.p.click("#b-entrar");
    await pr.p.waitForSelector('#lista .ca:has-text("Ana Souza")', { timeout: 10000 });
    ok(true, "professor entra e vê a aluna na lista");
    ok(!!(await pr.p.$('.logo')) && ((await pr.p.textContent(".rodape")) || "").includes("© 2026 Professor Guilherme Camozzato Teixeira"), "painel com a logo e o rodapé do professor");
    const linhaTexto1 = (await pr.p.textContent('#lista .ca:has-text("Ana Souza") .pa:has-text("Texto 1")').catch(() => "")) || "";
    ok(linhaTexto1.includes("Concluiu"), "a lista mostra o Texto 1 concluído");
    await pr.p.click('#lista .ca:has-text("Ana Souza")');
    await pr.p.waitForSelector('#v-aluno:not([hidden]) [data-act="pedir-redefinir"]:not([disabled])');
    const folhaProf = (await pr.p.textContent('#v-aluno .ativ-sec[data-ativ="leitores"] .folha').catch(() => "")) || "";
    ok(parasTela.every((x) => folhaProf.replace(/\s+/g, " ").includes(x.replace(/\s+/g, " ").slice(0, 60))), "o professor vê os 4 parágrafos na seção do Texto 1");
    const secoes = await pr.p.$$eval("#v-aluno .ativ-sec", (ss) => ss.map((x) => x.getAttribute("data-ativ")));
    ok(secoes.length === da2.length && da2.every((id) => secoes.includes(id)), "uma seção por atividade da série: " + secoes.join(", "));
    ok(!!(await pr.p.$('#v-aluno .ativ-sec[data-ativ="leitores"] [data-act="copiar-texto"]:not([disabled])')), "botão Copiar texto da atividade");
    await pr.p.click('[data-act="pedir-redefinir"]');
    await pr.p.click('[data-act="redefinir"]');
    await pr.p.waitForSelector("#pin-novo", { timeout: 8000 });
    const pinNovo = ((await pr.p.textContent("#pin-novo")) || "").trim();
    ok(/^\d{6}$/.test(pinNovo), "o painel mostra a senha nova de 6 números: " + pinNovo);

    await entrarAluno(c.p, ALUNO.nome, ALUNO.turma, ALUNO.pin);
    ok(((await c.p.textContent(".erro").catch(() => "")) || "").includes("Senha errada"), "a senha antiga não vale mais");
    await entrarAluno(c.p, ALUNO.nome, ALUNO.turma, pinNovo);
    ok(!!(await c.p.$('[data-act="sair"]')), "a aluna entra com a senha nova");
    ok(((await c.p.textContent('[data-act=ativ][data-a="leitores"]').catch(() => "")) || "").includes("Concluída"), "o progresso continua (Texto 1 concluído)");

    if (comCoringa) {
      console.log("\n== Professor: o perfil de teste aparece como 'Perfil de teste' ==");
      await pr.p.goto(BASE + "/professor/");
      await pr.p.waitForSelector("#chips [data-turma]", { timeout: 10000 });
      const todas = (await pr.p.textContent('#chips [data-turma=""]')) || "";
      await pr.p.click('#chips [data-turma="~teste"]');
      await pr.p.waitForSelector('#lista .ca:has-text("Guilherme Camozzato Teixeira")', { timeout: 8000 }).catch(() => {});
      const cartaoProf = (await pr.p.textContent('#lista .ca:has-text("Guilherme Camozzato Teixeira")').catch(() => "")) || "";
      ok(cartaoProf.includes("Perfil de teste"), "filtro 'Perfil de teste' mostra o professor");
      ok(/Todas\s*1\b/.test(todas), "o perfil de teste não conta em 'Todas' (" + todas.trim().replace(/\s+/g, " ") + ")");
      await pr.p.click('[data-act="aba"][data-aba="turmas"]');
      await pr.p.waitForSelector("#turmas-conteudo .coringa", { timeout: 8000 }).catch(() => {});
      const cartaoTurmas = (await pr.p.textContent("#turmas-conteudo .coringa").catch(() => "")) || "";
      ok(cartaoTurmas.includes("GUILHERME CAMOZZATO TEIXEIRA") && cartaoTurmas.includes("Não conta nas turmas"), "Turmas e alunos: cartão do perfil de teste");
      ok(/Senha inicial do perfil:\s*configurada/.test(cartaoTurmas) && !cartaoTurmas.includes("não configurada"), "o cartão diz que a senha inicial do perfil (CORINGA_SENHA) está configurada");
      const s1 = (await pr.p.textContent('#turmas-conteudo [data-serie="1"]').catch(() => "")) || "";
      ok(/0\s*de\s*2/.test(s1), "o perfil de teste não entra nas contas da 1ª série (" + s1.trim().replace(/\s+/g, " ") + ")");
      await pr.p.click('#turmas-conteudo .coringa button[data-id]');
      await pr.p.waitForSelector('#v-aluno:not([hidden]) [data-act="pedir-redefinir"]:not([disabled])', { timeout: 8000 });
      ok(((await pr.p.textContent("#v-aluno .det-cab .eyebrow")) || "").includes("Perfil de teste"), "o detalhe mostra 'Perfil de teste'");
      ok(!!(await pr.p.$(`#v-aluno .ativ-sec[data-ativ="${outraSerie.id}"]`)), "o detalhe tem a atividade que o professor abriu");
    }
    await pr.ctx.close();

  }
  if (SENHA_PROF && comCoringa) { // só com o servidor do próprio teste (a lista dele tem "Pedro Lima Teste")
    console.log("\n== Professor: textos hostis e um arquivo de atividade que não carrega ==");
    // Tudo o que o celular do aluno manda em `textos` é dado do aluno: nada pode virar HTML no painel,
    // e numa atividade que está no catálogo valem os nomes das partes e o total de fases do catálogo.
    const X = (n) => `<img src=x onerror="window.__xss=${n}"><script>window.__xss=${n}</script>"'\`&amp;`;
    const tk = (await api("/api/entrar", { nome: "Pedro Lima Teste", turma: "2", pin: "654321" })).json.token;
    const hostil = {
      leitores: { rotulo: X(1), genero: X(2), tema: X(3), serie: "2", titulo: X(4), partes: [X(5), X(6) + "\n" + X(7), "", ""], nomesPartes: [X(8), X(9)], verso: true, fases: 2, total: 99, concluiu: false, xp: 7 },
      "fantasma-x": { rotulo: X(10), genero: X(11), tema: X(12), serie: "2", titulo: X(13), partes: [X(14)], nomesPartes: [X(15)], verso: true, fases: 1, total: 5, concluiu: false, xp: 5 },
      constructor: { rotulo: "Construtor", partes: ["texto do construtor"], fases: 1, total: 2 },
    };
    r = await api("/api/salvar", { token: tk, estado: { v: 4, atual: "leitores", ativ: {} }, textos: hostil, paras: [X(16), "", "", ""], resumo: { fases: 2, xp: 7, nivel: X(17), linhas: 2, etapa: X(18) } });
    ok(r.status === 200, "salvou os textos hostis");
    const errosHostil = [];
    const ch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await ch.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, (q) => q.abort());
    await ch.route("**/atividades/cronica-olhar.js", (q) => q.fulfill({ status: 404, contentType: "text/html", body: "<p>Não encontrado</p>" }));
    const ph = await ch.newPage();
    ph.on("pageerror", (e) => errosHostil.push(e.message));
    ph.on("dialog", (d) => { errosHostil.push("dialog " + d.type()); d.dismiss(); });
    await ph.goto(BASE + "/professor/");
    await ph.fill("#senha", SENHA_PROF);
    await ph.click("#b-entrar");
    await ph.waitForSelector('#lista .ca:has-text("Pedro Lima Teste")', { timeout: 10000 }).catch(() => {});
    ok(!!(await ph.$('#lista .ca:has-text("Pedro Lima Teste")')), "sem o arquivo da crônica (404), o painel abre e lista os alunos");
    await ph.evaluate(() => { location.hash = "aluno=" + encodeURIComponent("2/pedro-lima-teste"); });
    await ph.waitForSelector('#v-aluno:not([hidden]) [data-act="pedir-redefinir"]:not([disabled])', { timeout: 8000 }).catch(() => {});
    const secLeitores = (await ph.textContent('#v-aluno .ativ-sec[data-ativ="leitores"]').catch(() => "")) || "";
    ok(secLeitores.includes("Introdução") && secLeitores.includes("1º argumento") && !secLeitores.includes("window.__xss=8"), "partes com os nomes do catálogo (não os mandados pelo aluno)");
    ok(secLeitores.includes("Fase 3 de 7"), "total de fases do catálogo (7), não o mandado pelo aluno (99)");
    ok(!(await ph.$('#v-aluno .ativ-sec[data-ativ="leitores"] .folha-c.verso')), "a redação não vira poema porque o aluno mandou verso:true");
    ok(((await ph.textContent('#v-aluno .ativ-sec[data-ativ="fantasma-x"]').catch(() => "")) || "").includes('<img src=x onerror="window.__xss=10">'), "atividade fora do catálogo aparece com o texto escapado");
    await ph.click('[data-act="aba"][data-aba="turmas"]').catch(() => {});
    await ph.evaluate(() => { location.hash = "turmas"; });
    await ph.waitForSelector("#turmas-conteudo .sc", { timeout: 8000 }).catch(() => {});
    await ph.click('#turmas-conteudo [data-serie="2"]').catch(() => {});
    const turmas2 = (await ph.textContent("#turmas-conteudo").catch(() => "")) || "";
    ok(turmas2.includes("Texto 1") && !turmas2.includes("Texto 2"), "Turmas e alunos mostra só as atividades que carregaram");
    const sujo = await ph.evaluate(() => ({
      xss: window.__xss,
      img: document.querySelectorAll('img[src="x"]').length,
      over: document.documentElement.scrollWidth - window.innerWidth,
    }));
    ok(sujo.xss === undefined && sujo.img === 0, "nenhum texto do aluno virou HTML no painel");
    ok(sujo.over <= 1, "sem rolagem horizontal no celular");
    ok(errosHostil.length === 0, "sem erros nem diálogos no painel: " + errosHostil.join(" | "));
    await ch.close();
  }
  await c.ctx.close();
  await a.ctx.close();
} catch (e) {
  falhas++;
  console.log("  FALHOU  erro inesperado: " + (e && e.message ? e.message.split("\n")[0] : e));
} finally {
  await browser.close();
  if (srv) srv.kill("SIGTERM");
  if (dirTemp) rmSync(dirTemp, { recursive: true, force: true });
}

console.log("\nErros na página:", errosPagina.length ? "\n" + errosPagina.join("\n") : "nenhum");
console.log(`\n${passos - falhas}/${passos} verificações passaram.`);
codigoSaida = falhas || errosPagina.length ? 1 : 0;
process.exit(codigoSaida);
