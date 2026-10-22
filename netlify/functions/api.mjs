// Função do Netlify: liga o Netlify Blobs à API de src/core.mjs.
// Atende tudo em /api/* (ver config.path abaixo).
import { getStore } from "@netlify/blobs";
import { createApi } from "../../src/core.mjs";

export default async (req, context) => {
  const b = getStore({ name: "missao-redacao", consistency: "strong" });
  const store = {
    get: (k) => b.get(k, { type: "json" }),
    set: (k, v, o = {}) => b.setJSON(k, v, o),
    del: (k) => b.delete(k),
    list: async (p) => (await b.list({ prefix: p })).blobs.map((x) => x.key),
  };
  return createApi({ store })(req);
};

export const config = { path: "/api/*" };
