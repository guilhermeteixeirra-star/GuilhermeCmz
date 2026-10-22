// Joga UMA atividade inteira num navegador de verdade e imprime o texto final (JSON).
// Uso: NODE_PATH=$(npm root -g) node tests/jogar-atividade.mjs <id-da-atividade> [padrão] [--foto pasta]
//   padrão: índices das opções, separados por vírgula (padrão "0"). O jogador usa um índice por escolha,
//   girando a lista. "w" = tocar em "Quero escrever do meu jeito" e escrever uma frase de teste.
//   Ex.: 0   1   2   0,2,1   1,w
// Sobe o servidor local sozinho (dados só na memória, lista de alunos INVENTADA).
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import path from "node:path";
import net from "node:net";
import vm from "node:vm";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { console.error("Playwright não encontrado. Rode com NODE_PATH=$(npm root -g)."); process.exit(2); }

const SITE = fileURLToPath(new URL("..", import.meta.url));
const CHROMIUM = process.env.CHROMIUM || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const argv = process.argv.slice(2);
const fotoI = argv.indexOf("--foto");
const FOTO = fotoI >= 0 ? argv.splice(fotoI, 2)[1] : null;
const [ID, PADRAO = "0"] = argv;
if (!ID) { console.error("Uso: node tests/jogar-atividade.mjs <id> [padrão] [--foto pasta]"); process.exit(2); }
const padrao = PADRAO.split(",").map((x) => x.trim()).filter(Boolean);

// descobre a série da atividade
const ctx = { window: {} }; vm.createContext(ctx);
for (const f of readdirSync(path.join(SITE, "public/atividades")).filter((f) => f.endsWith(".js")))
  vm.runInContext(readFileSync(path.join(SITE, "public/atividades", f), "utf8"), ctx);
const ativ = (ctx.window.ATIVIDADES || []).find((a) => a.id === ID);
if (!ativ) { console.error(`Atividade ${ID} não encontrada.`); process.exit(2); }
const SERIE = String(ativ.serie);

const LISTA = [1, 2, 3].map((n) => ({ label: `${n}ª Série`, alunos: ["TESTE JOGADOR PRIMEIRO", "TESTE JOGADOR SEGUNDO", "TESTE JOGADOR TERCEIRO"] }));
const pasta = mkdtempSync(path.join(tmpdir(), "mr-jogar-"));
const arqLista = path.join(pasta, "lista.json");
writeFileSync(arqLista, JSON.stringify(LISTA));
const porta = await new Promise((res) => { const s = net.createServer(); s.listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
const BASE = `http://127.0.0.1:${porta}`;
const srv = spawn(process.execPath, ["dev/server.mjs", String(porta), "--turmas", arqLista], { cwd: SITE, stdio: "ignore" });
const fim = () => { try { srv.kill(); } catch {} try { rmSync(pasta, { recursive: true, force: true }); } catch {} };
process.on("exit", fim);
for (let i = 0; i < 50; i++) { try { const r = await fetch(BASE + "/api/turmas"); if (r.ok) break; } catch {} await new Promise((r) => setTimeout(r, 100)); }

const out = { atividade: ID, padrao: PADRAO, erros: [], passos: 0 };
const browser = await chromium.launch({ executablePath: CHROMIUM });
const page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage();
page.on("pageerror", (e) => out.erros.push("erro na página: " + e.message));
page.on("dialog", (d) => { out.erros.push("diálogo: " + d.message()); d.dismiss(); });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let vez = 0;
const proximo = () => padrao[vez++ % padrao.length];
const clicar = async (sel) => { const b = await page.$(sel); if (!b) return false; await b.click(); await wait(470); return true; };

try {
  await page.goto(BASE + "/");
  await page.waitForSelector(`[data-act=serie][data-k="${SERIE}"]`);
  await page.click(`[data-act=serie][data-k="${SERIE}"]`);
  await page.fill("#in-nome", "teste jogador primeiro");
  await page.fill("#in-pin", "123456");
  await page.click("#btn-entrar");
  await page.waitForSelector(`[data-act=ativ][data-a="${ID}"]`, { timeout: 8000 });
  out.caixa = await page.$$eval("[data-act=ativ]", (bs) => bs.map((b) => b.dataset.a));
  await clicar(`[data-act=ativ][data-a="${ID}"]`);
  let travou = 0;
  for (let n = 0; n < 400; n++) {
    if (await page.$("textarea[data-folha]")) break;
    out.passos++;
    if (await page.$(".station.now") && !(await page.$(".fhead"))) { await clicar("[data-act=open].btn.primary"); continue; }
    if (await page.$("[data-act=ans]")) for (let k = 0; k < 6; k++) { if (await page.$("#next:not([disabled])")) break; await clicar(`[data-act=ans][data-k="${k}"]:not([disabled])`); }
    if (await page.$("[data-act=esco]") && !(await page.$("[data-act=esco][aria-pressed=true]"))) {
      const cs = await page.$$("[data-act=esco]"); const i = Number(proximo()) || 0; await cs[i % cs.length].click(); await wait(470);
    }
    if (await page.$("[data-act=causa]") && !(await page.$("#next:not([disabled])"))) {
      const cs = await page.$$eval("[data-act=causa]", (b) => b.map((x) => x.dataset.c)); const i = Number(proximo()) || 0;
      await clicar(`[data-act=causa][data-c="${cs[i % cs.length]}"]`); await clicar(`[data-act=causa][data-c="${cs[(i + 1) % cs.length]}"]`);
    }
    if (await page.$("[data-act=abertura]") && !(await page.$("#next:not([disabled])"))) {
      const cs = await page.$$("[data-act=abertura]"); const i = Number(proximo()) || 0; await cs[i % cs.length].click(); await wait(470);
    }
    for (let k = 0; k < 6; k++) { if (await page.$("[data-act=opt]")) break; if (!(await page.$("[data-act=con]"))) break; await clicar(`[data-act=con][data-k="${k}"]:not([disabled])`); }
    if (await page.$("[data-act=opt]") && !(await page.$("#next:not([disabled])"))) {
      const q = proximo();
      if (q === "w") {
        await clicar('[data-act=opt][data-k="-1"]');
        const ta = await page.$("textarea[data-mc]");
        if (ta) { await ta.fill("aqui eu escrevi do meu próprio jeito"); await wait(350); }
      } else {
        const n = (await page.$$('[data-act=opt]:not([data-k="-1"])')).length;
        if (!(await clicar(`[data-act=opt][data-k="${(Number(q) || 0) % n}"]:not([disabled])`))) await clicar('[data-act=opt]:not([disabled]):not([data-k="-1"])');
      }
    }
    if (await page.$("[data-act=prop]") && !(await page.$("#next:not([disabled])")))
      for (const g of ["agente", "acao", "meio", "fim"]) { const n = (await page.$$(`[data-act=prop][data-g=${g}]:not([data-k="-1"])`)).length; await clicar(`[data-act=prop][data-g=${g}][data-k="${(Number(proximo()) || 0) % n}"]`); }
    const nx = await page.$("#next:not([disabled])");
    if (!nx) { if (++travou > 2) { out.erros.push("travou em: " + (await page.textContent("#screen")).replace(/\s+/g, " ").slice(0, 300)); break; } continue; }
    travou = 0;
    await nx.click(); await wait(470);
  }
  if (await page.$("textarea[data-folha]")) {
    out.titulo = await page.$eval("#fp-titulo", (i) => i.value).catch(() => null);
    out.partes = await page.$$eval("textarea[data-folha]", (t) => t.map((x) => x.value));
    out.checks = await page.$$eval(".checks li", (ls) => ls.map((l) => (l.querySelector(".ic.ok") ? "[ok] " : "[revisar] ") + l.textContent.replace(/\s+/g, " ").trim()));
    out.xp = await page.textContent("#xp-n");
    out.overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (FOTO) { mkdirSync(FOTO, { recursive: true }); const f = path.join(FOTO, `${ID}-${PADRAO.replace(/,/g, "_")}.png`); await page.screenshot({ path: f, fullPage: true }); out.foto = f; }
    // o servidor guardou o texto?
    await wait(3500);
    const sess = await page.evaluate(() => JSON.parse(localStorage.getItem("mr3:sessao")));
    const r = await (await fetch(BASE + "/api/estado", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: sess.token }) })).json();
    out.salvoNoServidor = !!(r.estado && r.estado.ativ && r.estado.ativ[ID] && r.estado.ativ[ID].done);
  } else out.erros.push("não chegou na folha");
} catch (e) {
  out.erros.push("falhou: " + e.message.split("\n")[0]);
  try { out.tela = (await page.textContent("#screen")).replace(/\s+/g, " ").slice(0, 400); } catch {}
}
await browser.close();
fim();
console.log(JSON.stringify(out, null, 1));
process.exit(out.erros.length ? 1 : 0);
