// Função do Netlify: liga o Netlify Blobs à API de src/core.mjs.
// Atende tudo em /api/* (ver config.path abaixo).
import { getStore } from "@netlify/blobs";
import { createApi } from "../../src/core.mjs";

export default async (req, context) => {
  const b = getStore({ name: "missao-redacao", consistency: "strong" });
  const store = {
    get: (k) => b.get(k, { type: "json" }),
    // Lê junto o etag, para a gravação condicional (onlyIfMatch) não desfazer outra gravação.
    getWithEtag: async (k) => {
      const r = await b.getWithMetadata(k, { type: "json" });
      return r ? { data: r.data, etag: r.etag || null } : null;
    },
    // Só os metadados (HEAD): o resumo do aluno, sem baixar o estado do jogo.
    getMeta: async (k) => {
      const r = await b.getMetadata(k);
      return r ? { metadata: r.metadata || {}, etag: r.etag || null } : null;
    },
    set: async (k, v, o = {}) => {
      const opcoes = {};
      if (o.onlyIfNew) opcoes.onlyIfNew = true;
      else if (o.onlyIfMatch) opcoes.onlyIfMatch = o.onlyIfMatch;
      if (o.metadata) opcoes.metadata = o.metadata;
      const r = await b.setJSON(k, v, opcoes);
      // Numa gravação condicional, o @netlify/blobs 11 devolve {modified:true} para QUALQUER
      // resposta que não seja 412 (inclusive 403 e 500). Sucesso de verdade vem com etag;
      // sem etag, confere relendo antes de dizer que gravou.
      if ((opcoes.onlyIfNew || opcoes.onlyIfMatch) && r && r.modified && !r.etag) {
        const lido = await b.get(k, { type: "json" }).catch(() => undefined);
        if (JSON.stringify(lido) !== JSON.stringify(v)) throw new Error(`Netlify Blobs não gravou a chave ${k}`);
      }
      return r;
    },
    del: (k) => b.delete(k),
    list: async (p) => (await b.list({ prefix: p })).blobs.map((x) => x.key),
  };
  // Variáveis de ambiente (TURMAS_ALUNOS = lista de alunos padrão): Netlify.env; se não tiver, process.env.
  const env = {
    get: (k) => {
      try {
        const v = globalThis.Netlify?.env?.get(k);
        if (v !== undefined && v !== null) return v;
      } catch {
        /* sem Netlify.env: usa process.env */
      }
      return process.env[k];
    },
  };
  return createApi({ store, env })(req);
};

export const config = { path: "/api/*" };
