// `node --test tests/` roda ESTE arquivo (é o "main" de tests/package.json): ele carrega todos os
// tests/*.test.mjs (a API e as atividades). Se um arquivo nem carregar (por exemplo, uma atividade
// pela metade com erro de sintaxe), aparece um teste falhando com o erro, e os outros arquivos rodam
// normalmente.
import { test } from "node:test";
import { readdirSync } from "node:fs";

const arquivos = readdirSync(new URL(".", import.meta.url))
  .filter((f) => f.endsWith(".test.mjs"))
  .sort();

for (const f of arquivos) {
  try {
    await import(new URL(f, import.meta.url));
  } catch (e) {
    test(`${f}: carregar o arquivo de teste`, () => {
      throw e;
    });
  }
}
