// Confere a estrutura de todas as atividades (public/atividades/*.js) sem abrir o navegador.
// Uso: node --test tests/   (ou: node tests/atividades.test.mjs)
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const PASTA = fileURLToPath(new URL("../public/atividades/", import.meta.url));
const INDEX = fileURLToPath(new URL("../public/index.html", import.meta.url));

function carregar() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  const arquivos = readdirSync(PASTA).filter((f) => f.endsWith(".js")).sort();
  for (const f of arquivos) vm.runInContext(readFileSync(PASTA + f, "utf8"), ctx, { filename: f });
  return { arquivos, lista: ctx.window.ATIVIDADES || [] };
}
const { arquivos, lista } = carregar();

const DISSERT_PARTES = [
  ["ABERT", "intro_ponte", "intro_tese"],
  ["d1_topico", "d1_explica", "d1_prova", "d1_fecha"],
  ["d2_topico", "d2_explica", "d2_prova", "d2_fecha"],
  ["c_retomada", "PROP", "c_detalhe"],
];
const ehTexto = (s) => typeof s === "string" && s.trim() !== "";
const optTexto = (o) => (Array.isArray(o) ? o[1] : o && typeof o === "object" ? o.t : o);
const RUIM = /\b(undefined|null|NaN)\b|\[object |\s{2,}|\s[,.;:!?]/;

function conferirTexto(p, onde, s) {
  if (!ehTexto(s)) p.push(`${onde}: texto vazio`);
  else if (RUIM.test(s.replace(/\n/g, " ").replace(/<[^>]*>/g, " ").replace(/\s{2,}/g, " ").trim() === s.trim() ? s : s.replace(/\n/g, " ")))
    p.push(`${onde}: texto com problema (undefined/null/espaço duplo/espaço antes de pontuação): “${s}”`);
}
function conferirCons(p, onde, cons) {
  if (cons == null) return;
  if (!Array.isArray(cons) || cons.length < 2) return p.push(`${onde}: cons precisa ter 2+ opções`);
  if (!cons.some((c) => c.ok)) p.push(`${onde}: cons sem nenhuma certa`);
  cons.forEach((c, i) => {
    if (!ehTexto(c.t)) p.push(`${onde}: cons[${i}] sem t`);
    if (!c.ok && !ehTexto(c.d)) p.push(`${onde}: cons[${i}] errada sem dica (d)`);
  });
}
function conferirGloss(p, a) {
  (a.textos || []).forEach((tx, i) => {
    for (const campo of ["html", "facil"]) {
      for (const m of String(tx[campo] || "").matchAll(/\[\[(\w+)\|([^\]]+)\]\]/g)) {
        if (!a.gloss || !a.gloss[m[1]]) p.push(`textos[${i}].${campo}: palavra “${m[2]}” usa a chave ${m[1]}, que não está em gloss`);
      }
    }
  });
  Object.entries(a.gloss || {}).forEach(([k, v]) => {
    if (!Array.isArray(v) || v.length !== 2 || !ehTexto(v[0]) || !ehTexto(v[1])) p.push(`gloss.${k}: formato ['Palavra','explicação']`);
  });
}
function conferirQuiz(p, a) {
  Object.entries(a.quiz || {}).forEach(([k, q]) => {
    if (!ehTexto(q.p) || !Array.isArray(q.ops) || q.ops.length < 2 || q.ops.length > 5) p.push(`quiz.${k}: precisa de p e 2–5 ops`);
    else if (!(Number.isInteger(q.c) && q.c >= 0 && q.c < q.ops.length)) p.push(`quiz.${k}: c fora das opções`);
    if (!ehTexto(q.ok)) p.push(`quiz.${k}: falta ok`);
    if (!ehTexto(q.dica) && !(q.dicas && q.ops && q.ops.every((_, i) => i === q.c || ehTexto(q.dicas[i]))))
      p.push(`quiz.${k}: cada opção errada precisa de dica (dicas) ou uma dica geral`);
    if (q.ops && new Set(q.ops).size !== q.ops.length) p.push(`quiz.${k}: opções repetidas`);
  });
}

// todas as combinações de escolhas (no máximo 400)
function combinacoes(escolhas) {
  const chaves = Object.keys(escolhas || {});
  let out = [{}];
  for (const k of chaves) {
    const cards = escolhas[k].cards || [];
    const novo = [];
    for (const o of out) for (const c of cards) novo.push({ ...o, [k]: c.id });
    out = novo.slice(0, 400);
  }
  return out;
}
function fazerH(a, esco, opcoes) {
  return {
    S: { esco },
    escolha: (k) => {
      const e = a.escolhas && a.escolhas[k];
      return (e && e.cards.find((c) => c.id === esco[k])) || null;
    },
    opcao: (id) => (opcoes && id in opcoes ? opcoes[id] : null),
    texto: () => "",
    escreveu: () => false,
    causa: () => null,
    abertura: () => null,
    ORD: ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º"],
    ORDF: ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª"],
    esc: (s) => String(s),
    words: (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length,
  };
}

function validar(a) {
  const p = [];
  for (const c of ["id", "serie", "rotulo", "tipo", "genero", "tema", "temaRotulo", "obra", "folhaTitulo", "folhaCabecalho", "lead", "trilhaTip"])
    if (!ehTexto(a[c])) p.push(`falta o campo ${c}`);
  if (!["1", "2", "3"].includes(String(a.serie))) p.push("serie precisa ser '1', '2' ou '3'");
  if (!["dissertativo", "poema", "cronica"].includes(a.tipo)) p.push("tipo desconhecido");
  if (!["m", "f"].includes(a.obraGenero)) p.push("obraGenero precisa ser 'm' ou 'f'");
  if (!a.proposta || !ehTexto(a.proposta.contexto) || !ehTexto(a.proposta.comando)) p.push("proposta {contexto, comando}");
  if (!Array.isArray(a.textos) || !a.textos.length) p.push("textos vazio");
  (a.textos || []).forEach((t, i) => { if (!ehTexto(t.html)) p.push(`textos[${i}].html vazio`); if (!/class="fonte"/.test(t.html || "")) p.push(`textos[${i}] sem <p class="fonte">`); });
  conferirGloss(p, a);
  conferirQuiz(p, a);
  if (a.niveis != null) {
    if (!Array.isArray(a.niveis) || a.niveis.length < 3 || a.niveis[0][0] !== 0 || a.niveis.some((n, i) => i && n[0] <= a.niveis[i - 1][0]))
      p.push("niveis: [[0,'…'],[60,'…'],…] crescente, começando em 0");
  }
  const dissert = a.tipo === "dissertativo";
  const partes = dissert ? DISSERT_PARTES : (a.partes || []).map((pt) => pt.blocos || []);
  if (!dissert) {
    if (!Array.isArray(a.partes) || !a.partes.length) p.push("partes vazio");
    (a.partes || []).forEach((pt, i) => {
      for (const c of ["nome", "curto", "campo"]) if (!ehTexto(pt[c])) p.push(`partes[${i}].${c} vazio`);
      if (!Array.isArray(pt.blocos) || !pt.blocos.length) p.push(`partes[${i}].blocos vazio`);
      (pt.blocos || []).forEach((b) => { if (typeof b !== "string" && !(b && ehTexto(b.fixo))) p.push(`partes[${i}]: bloco inválido ${JSON.stringify(b)}`); });
    });
    if (typeof a.blockDef !== "function") p.push("falta blockDef(id, H)");
    if (typeof a.checks !== "function") p.push("falta checks(ctx)");
    if (a.tituloBloco && a.tituloFixo) p.push("use tituloBloco OU tituloFixo");
  }
  // fases
  const blocoNaParte = {};
  partes.forEach((bl, i) => bl.forEach((b) => { if (typeof b === "string") blocoNaParte[b] = i; }));
  const monteVisto = {};
  const passosValidos = new Set(["proposta", "info", "quiz", "read", "escolha", "monte", "review", "reward", ...(dissert ? ["causas", "abertura", "proposal"] : [])]);
  const INFO_DISSERT = new Set(["missao", "causas", "intro", "desenv", "concl"]);
  if (!Array.isArray(a.fases) || a.fases.length < 3 || a.fases.length > 8) p.push("fases: de 3 a 8");
  const idsFase = new Set();
  let escolhaVista = new Set();
  (a.fases || []).forEach((f, fi) => {
    const onde = `fases[${fi}] (${f.id})`;
    if (!ehTexto(f.id) || idsFase.has(f.id)) p.push(`${onde}: id vazio ou repetido`);
    idsFase.add(f.id);
    if (!ehTexto(f.titulo) || !ehTexto(f.sub)) p.push(`${onde}: titulo/sub`);
    const st = f.steps || [];
    if (!st.length || st[st.length - 1].t !== "reward") p.push(`${onde}: tem que terminar com reward`);
    if (fi === 0 && (!st.length || st[0].t !== "proposta")) p.push(`${onde}: a 1ª fase começa com proposta`);
    if (typeof f.para === "number") {
      if (!partes[f.para]) p.push(`${onde}: para=${f.para} não existe em partes`);
      if (!st.some((s) => s.t === "review" && s.p === f.para)) p.push(`${onde}: falta {t:'review',p:${f.para}}`);
    }
    st.forEach((s, si) => {
      const o = `${onde}.steps[${si}]`;
      if (!passosValidos.has(s.t)) p.push(`${o}: passo desconhecido ${s.t}`);
      if (s.t === "quiz" && !(a.quiz && a.quiz[s.q])) p.push(`${o}: quiz ${s.q} não existe`);
      if (s.t === "info" && !(a.info && a.info[s.k] && a.info[s.k].html != null) && !(dissert && INFO_DISSERT.has(s.k))) p.push(`${o}: info ${s.k} não existe`);
      if (s.t === "read" && !(a.textos && a.textos[s.x || 0])) p.push(`${o}: textos[${s.x || 0}] não existe`);
      if (s.t === "escolha") {
        if (!(a.escolhas && a.escolhas[s.k])) p.push(`${o}: escolha ${s.k} não existe`);
        escolhaVista.add(s.k);
      }
      if (s.t === "review" && s.p !== f.para) p.push(`${o}: review p=${s.p} diferente do para da fase`);
      if (s.t === "monte") {
        if (monteVisto[s.id]) p.push(`${o}: bloco ${s.id} aparece em 2 passos`);
        monteVisto[s.id] = true;
        const ehTitulo = s.id === a.tituloBloco;
        if (!ehTitulo && blocoNaParte[s.id] === undefined) p.push(`${o}: bloco ${s.id} não está em nenhuma parte`);
        if (!ehTitulo && blocoNaParte[s.id] !== f.para) p.push(`${o}: bloco ${s.id} é da parte ${blocoNaParte[s.id]}, mas a fase escreve a parte ${f.para}`);
      }
      if (s.t === "proposal" && f.para !== 3) p.push(`${o}: proposal fica na fase da conclusão`);
    });
    (f.unlock || []).forEach((r) => { if (!(a.rep && a.rep[r])) p.push(`${onde}: unlock ${r} não está em rep`); });
  });
  Object.keys(blocoNaParte).forEach((b) => {
    if (dissert && (b === "ABERT" || b === "PROP")) return;
    if (!monteVisto[b]) p.push(`bloco ${b} não tem passo monte`);
  });
  if (a.tituloBloco && !monteVisto[a.tituloBloco]) p.push(`tituloBloco ${a.tituloBloco} não tem passo monte`);

  if (dissert) validarDissert(p, a);
  else validarLivre(p, a, escolhaVista);
  return p;
}

function validarDissert(p, a) {
  const rep = a.rep || {};
  Object.entries(rep).forEach(([k, r]) => { for (const c of ["tipo", "titulo", "resumo", "frase"]) if (!ehTexto(r[c])) p.push(`rep.${k}.${c} vazio`); });
  if (!Array.isArray(a.repOrdem) || a.repOrdem.some((r) => !rep[r]) || a.repOrdem.length !== Object.keys(rep).length) p.push("repOrdem tem que listar todos os rep");
  const liberadoAte = {};
  (a.fases || []).forEach((f, fi) => (f.unlock || []).forEach((r) => { if (liberadoAte[r] === undefined) liberadoAte[r] = fi; }));
  Object.keys(rep).forEach((r) => { if (liberadoAte[r] === undefined) p.push(`rep.${r} nunca é liberado (unlock)`); });
  const fase = (id) => (a.fases || []).findIndex((f) => f.id === id);
  if (!Array.isArray(a.causas) || a.causas.length < 4) p.push("causas: pelo menos 4");
  (a.causas || []).forEach((c, i) => {
    const o = `causas[${i}] (${c.id})`;
    for (const k of ["id", "nome", "desc", "tese", "por", "nom"]) if (!ehTexto(c[k])) p.push(`${o}.${k} vazio`);
    for (const [k, n] of [["topico", 3], ["explica", 3], ["fecha", 3]]) {
      if (!Array.isArray(c[k]) || c[k].length !== n) p.push(`${o}.${k}: ${n} frases`);
      (c[k] || []).forEach((s, j) => { conferirTexto(p, `${o}.${k}[${j}]`, s); if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(s) && !/^(O|A|Os|As|Um|Uma|Muitos|Muitas|Isso|Esse|Essa|Quem|Hoje|Na|No|Nas|Nos|Em|De|Para|Com|Por|Sem|Se|Quando|Mais|Ainda|Todo|Toda|Todos|Todas|Eles|Elas|Brasil|Brasília|Governo|Estado)\b/.test(s)) p.push(`${o}.${k}[${j}] começa com maiúscula (vem depois de um conectivo): “${s}”`); });
    }
    if (!Array.isArray(c.prova) || c.prova.length !== 4) p.push(`${o}.prova: 4 provas`);
    (c.prova || []).forEach((pr, j) => {
      if (!Array.isArray(pr) || !rep[pr[0]]) p.push(`${o}.prova[${j}]: [idRep, frase] com idRep em rep`);
      else {
        conferirTexto(p, `${o}.prova[${j}]`, pr[1]);
        const lib = liberadoAte[pr[0]], usa = Math.min(fase("d1"), fase("d2"));
        if (lib === undefined || lib >= usa) p.push(`${o}.prova[${j}]: rep ${pr[0]} só é liberado depois da fase de argumentos`);
      }
    });
    if (c.prova && new Set(c.prova.map((x) => x[0])).size !== c.prova.length) p.push(`${o}.prova: repertórios repetidos na mesma causa`);
  });
  if (!Array.isArray(a.aberturas) || a.aberturas.length < 3) p.push("aberturas: pelo menos 3");
  (a.aberturas || []).forEach((ab, i) => {
    if (!rep[ab.id]) p.push(`aberturas[${i}]: ${ab.id} não está em rep`);
    if (!["contraste", "dado"].includes(ab.tipo)) p.push(`aberturas[${i}]: tipo contraste|dado`);
    const lib = liberadoAte[ab.id];
    if (lib === undefined || lib >= fase("intro")) p.push(`aberturas[${i}]: rep ${ab.id} precisa ser liberado antes da introdução`);
  });
  for (const t of ["contraste", "dado"]) {
    if (!a.ponte || !Array.isArray(a.ponte[t]) || a.ponte[t].length !== 3) p.push(`ponte.${t}: 3 frases`);
    (a.ponte && a.ponte[t] || []).forEach((s, j) => conferirTexto(p, `ponte.${t}[${j}]`, s));
  }
  for (const k of ["d1", "d2", "explica", "fecha", "contraste", "dado", "tese", "retomada"]) {
    if (!a.con || !a.con[k]) p.push(`con.${k} faltando`);
    else conferirCons(p, `con.${k}`, a.con[k]);
  }
  Object.entries(a.ponteRep || {}).forEach(([t, m]) => Object.entries(m).forEach(([i, r]) => { if (!rep[r]) p.push(`ponteRep.${t}.${i}: ${r} não está em rep`); }));
  if (!Array.isArray(a.agentes) || a.agentes.length < 3 || a.agentes.some((x) => !ehTexto(x.t) || !["deve", "devem"].includes(x.v))) p.push("agentes: {t, v:'deve'|'devem'}");
  if (!Array.isArray(a.acoes) || a.acoes.length < 3 || a.acoes.some((x) => !ehTexto(x.t) || !Array.isArray(x.det) || x.det.length !== 2)) p.push("acoes: {t, det:[2 frases]}");
  for (const k of ["detGeral", "meios", "fins"]) if (!Array.isArray(a[k]) || a[k].length < 2 || a[k].some((x) => !ehTexto(x))) p.push(`${k}: lista de frases`);
  if (!ehTexto(a.causasPergunta)) p.push("causasPergunta vazio");
  if (!Array.isArray(a.teses) || a.teses.length !== 3) p.push("teses: 3 funções");
  if (typeof a.retomadas !== "function") p.push("retomadas: função");
  const cs = a.causas || [];
  for (let i = 0; i < cs.length; i++) for (let j = 0; j < cs.length; j++) {
    if (i === j) continue;
    (a.teses || []).forEach((f, k) => { try { const s = f(cs[i], cs[j]); conferirTexto(p, `teses[${k}](${cs[i].id},${cs[j].id})`, s); if (!/\.$/.test(s)) p.push(`teses[${k}] sem ponto final`); } catch (e) { p.push(`teses[${k}] erro: ${e.message}`); } });
    try { const r = a.retomadas(cs[i], cs[j]); if (!Array.isArray(r) || r.length < 2) p.push("retomadas: devolve 2+ frases"); else r.forEach((s, k) => conferirTexto(p, `retomadas[${k}](${cs[i].id},${cs[j].id})`, s)); } catch (e) { p.push(`retomadas erro: ${e.message}`); }
  }
  const inf = a.info || {};
  if (!ehTexto(inf.temaCard) || !inf.argumentoExemplo || !ehTexto(inf.introExemplo) || !inf.solucaoExemplos) p.push("info: temaCard, argumentoExemplo, introExemplo, solucaoExemplos");
  const ck = a.checagem || {};
  if (!(ck.temaRegex instanceof RegExp) && !(ck.temaRegex && typeof ck.temaRegex.test === "function")) p.push("checagem.temaRegex");
  if (!ck.repRegex || typeof ck.repRegex.test !== "function") p.push("checagem.repRegex");
  // a tese de exemplo precisa passar na checagem do tema
  else if (ck.temaRegex && !ck.temaRegex.test(inf.introExemplo || "")) p.push("checagem.temaRegex não reconhece o introExemplo");
}

function validarLivre(p, a, escolhaVista) {
  Object.entries(a.escolhas || {}).forEach(([k, e]) => {
    if (!escolhaVista.has(k)) p.push(`escolhas.${k} não tem passo escolha`);
    if (!ehTexto(e.titulo) || !Array.isArray(e.cards) || e.cards.length < 2) p.push(`escolhas.${k}: titulo e 2+ cards`);
    const ids = (e.cards || []).map((c) => c.id);
    if (new Set(ids).size !== ids.length) p.push(`escolhas.${k}: ids repetidos`);
    (e.cards || []).forEach((c, i) => { if (!ehTexto(c.id) || !ehTexto(c.nome)) p.push(`escolhas.${k}.cards[${i}]: id e nome`); });
    (e.reseta || []).forEach((b) => { if (!(a.partes || []).some((pt) => (pt.blocos || []).includes(b)) && b !== a.tituloBloco) p.push(`escolhas.${k}.reseta: ${b} não é bloco`); });
  });
  const blocos = [...(a.partes || []).flatMap((pt) => pt.blocos || []).filter((b) => typeof b === "string"), ...(a.tituloBloco ? [a.tituloBloco] : [])];
  const verso = a.juntar === "verso";
  const combos = combinacoes(a.escolhas);
  // dependências: para cada combinação de escolhas, testa também as opções anteriores (0, 1, 2) para H.opcao
  for (const esco of combos) {
    for (const pick of [0, 1, 2]) {
      const opcoes = {};
      for (const b of blocos) {
        const onde = `blockDef('${b}') com ${JSON.stringify(esco)} e opção ${pick}`;
        let d;
        try { d = a.blockDef(b, fazerH(a, esco, opcoes)); } catch (e) { p.push(`${onde}: erro ${e.message}`); continue; }
        if (!d) { p.push(`${onde}: devolveu null`); continue; }
        if (!ehTexto(d.q) || !ehTexto(d.n)) p.push(`${onde}: falta n ou q`);
        if (!Array.isArray(d.opts) || d.opts.length < 2 || d.opts.length > 4) { p.push(`${onde}: opts precisa ter 2 a 4 opções`); continue; }
        const txts = d.opts.map(optTexto);
        txts.forEach((t, i) => conferirTexto(p, `${onde} opts[${i}]`, t));
        if (new Set(txts).size !== txts.length) p.push(`${onde}: opções repetidas`);
        if (verso && !d.verso) p.push(`${onde}: no poema, todo bloco precisa de verso:true`);
        if (verso && txts.some((t) => /\n/.test(t))) p.push(`${onde}: verso não pode ter quebra de linha`);
        conferirCons(p, onde, d.cons);
        // determinismo
        const d2 = a.blockDef(b, fazerH(a, esco, opcoes));
        if (JSON.stringify(d2.opts) !== JSON.stringify(d.opts)) p.push(`${onde}: blockDef não é determinística`);
        opcoes[b] = d.opts[Math.min(pick, d.opts.length - 1)];
      }
    }
    if (p.length > 60) break;
  }
  if (a.blockDef("__nao_existe__", fazerH(a, combos[0] || {}, {})) != null) p.push("blockDef deve devolver null para id desconhecido");
  // checks
  try {
    const H = fazerH(a, combos[0] || {}, {});
    const vazio = a.checks({ ...H, paras: (a.partes || []).map(() => ""), titulo: "", linhas: 0 });
    if (!Array.isArray(vazio) || vazio.length < 3) p.push("checks: devolve 3+ itens");
    else vazio.forEach((c, i) => { if (!ehTexto(c.id) || !ehTexto(c.t) || typeof c.ok !== "boolean" || typeof c.d !== "string") p.push(`checks[${i}]: {id, ok:boolean, t, d}`); if (c.ok && /estrofe|parágrafo|título|frase/i.test(c.t)) p.push(`checks[${i}] (${c.id}): com o texto vazio, “${c.t}” não pode estar ok`); });
  } catch (e) { p.push(`checks: erro ${e.message}`); }
}

test("as atividades carregam", () => {
  assert.ok(arquivos.length >= 1, "nenhum arquivo em public/atividades");
  assert.equal(lista.length, arquivos.length, "cada arquivo deve registrar exatamente 1 atividade");
  const ids = lista.map((a) => a.id);
  assert.equal(new Set(ids).size, ids.length, "ids repetidos");
  const ordem = lista.map((a) => `${a.serie}:${a.ordem}`);
  assert.equal(new Set(ordem).size, ordem.length, "duas atividades com a mesma série e ordem");
});

test("o jogo carrega todos os arquivos de atividade", () => {
  const html = readFileSync(INDEX, "utf8");
  for (const f of arquivos) assert.ok(html.includes(`<script src="/atividades/${f}"></script>`), `index.html não carrega /atividades/${f}`);
  for (const m of html.matchAll(/<script src="\/atividades\/([^"]+)"><\/script>/g)) assert.ok(arquivos.includes(m[1]), `index.html carrega /atividades/${m[1]}, que não existe`);
});

for (const a of lista) {
  test(`atividade ${a.id}: estrutura`, () => {
    const p = validar(a);
    assert.deepEqual(p, [], `${p.length} problema(s):\n- ${p.slice(0, 60).join("\n- ")}`);
  });
}

test("o painel do professor carrega as MESMAS atividades que o jogo (mesmas tags, mesma ordem)", () => {
  const PAINEL = fileURLToPath(new URL("../public/professor/index.html", import.meta.url));
  const tags = (html) => [...html.matchAll(/<script src="\/atividades\/([^"]+)"><\/script>/g)].map((m) => m[1]);
  const jogo = tags(readFileSync(INDEX, "utf8"));
  const painel = tags(readFileSync(PAINEL, "utf8"));
  assert.deepEqual(painel, jogo, "copie para public/professor/index.html as <script src=\"/atividades/...\"> de public/index.html");
});
