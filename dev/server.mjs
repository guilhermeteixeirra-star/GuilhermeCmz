// Servidor local para testar o site sem o Netlify.
// Uso: node dev/server.mjs [porta]   (porta padrão 8888)
// - serve os arquivos de public/
// - manda /api/* para a API (src/core.mjs) com os dados só na memória
//   (ao fechar o servidor, tudo some).

import http from "node:http";
import path from "node:path";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { createApi } from "../src/core.mjs";
import { MemoryStore } from "./memory-store.mjs";

const RAIZ = path.resolve(fileURLToPath(new URL("../public/", import.meta.url)));
const porta = Number(process.argv[2] || process.env.PORT || 8888);

const store = new MemoryStore();
const api = createApi({ store });

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

const PLACEHOLDER = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Missão Redação</title>
<style>body{font-family:system-ui,sans-serif;margin:0;padding:24px 16px;background:#fff;color:#222;line-height:1.5}</style>
</head><body><h1>Missão Redação</h1>
<p>Servidor local funcionando. O arquivo <code>public/index.html</code> ainda não existe.</p>
</body></html>`;

const SEM_REPASSE = new Set(["connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-connection", "te", "trailer"]);

async function rotearApi(req, res, url) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v === undefined || SEM_REPASSE.has(k)) continue;
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else headers.set(k, v);
  }
  const temCorpo = req.method !== "GET" && req.method !== "HEAD";
  const pedido = new Request(url, {
    method: req.method,
    headers,
    body: temCorpo ? Readable.toWeb(req) : undefined,
    duplex: "half",
  });
  const resposta = await api(pedido);
  const corpo = Buffer.from(await resposta.arrayBuffer());
  const cab = {};
  resposta.headers.forEach((v, k) => {
    cab[k] = v;
  });
  cab["content-length"] = String(corpo.length);
  res.writeHead(resposta.status, cab);
  res.end(req.method === "HEAD" ? undefined : corpo);
}

function enviarTexto(res, status, texto, tipo = "text/plain; charset=utf-8", extras = {}) {
  res.writeHead(status, { "content-type": tipo, "cache-control": "no-cache", ...extras });
  res.end(texto);
}

async function servirEstatico(req, res, url) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return enviarTexto(res, 405, "Método não permitido.", undefined, { allow: "GET, HEAD" });
  }
  let caminho;
  try {
    caminho = decodeURIComponent(url.pathname);
  } catch {
    return enviarTexto(res, 400, "Endereço inválido.");
  }
  if (caminho.includes("\0")) return enviarTexto(res, 400, "Endereço inválido.");

  let alvo = path.resolve(RAIZ, "." + path.posix.normalize("/" + caminho));
  if (alvo !== RAIZ && !alvo.startsWith(RAIZ + path.sep)) return enviarTexto(res, 403, "Proibido.");

  let info = await stat(alvo).catch(() => null);
  if (info?.isDirectory()) {
    if (!url.pathname.endsWith("/")) {
      res.writeHead(301, { location: url.pathname + "/" + url.search });
      return res.end();
    }
    alvo = path.join(alvo, "index.html");
    info = await stat(alvo).catch(() => null);
  }
  if (!info?.isFile()) {
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return enviarTexto(res, 200, req.method === "HEAD" ? undefined : PLACEHOLDER, TIPOS[".html"]);
    }
    return enviarTexto(res, 404, "<!doctype html><meta charset=utf-8><title>Não encontrado</title><p>Página não encontrada.</p>", TIPOS[".html"]);
  }

  const tipo = TIPOS[path.extname(alvo).toLowerCase()] || "application/octet-stream";
  res.writeHead(200, { "content-type": tipo, "content-length": String(info.size), "cache-control": "no-cache" });
  if (req.method === "HEAD") return res.end();
  createReadStream(alvo)
    .on("error", () => res.destroy())
    .pipe(res);
}

const servidor = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) return await rotearApi(req, res, url);
    return await servirEstatico(req, res, url);
  } catch (e) {
    console.error("[dev] erro:", e);
    if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Erro interno.");
  }
});

servidor.listen(porta, () => {
  console.log(`Missão Redação (local): http://localhost:${porta}/`);
  console.log(`Painel do professor:    http://localhost:${porta}/professor/`);
  console.log("Os dados ficam só na memória e somem ao fechar o servidor.");
});

for (const sinal of ["SIGINT", "SIGTERM"]) {
  process.on(sinal, () => {
    servidor.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  });
}
