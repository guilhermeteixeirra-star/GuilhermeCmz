// Gera o valor da variável CORINGA_SENHA (senha inicial do perfil de teste do professor).
// Uso: node dev/hash-pin.mjs
//   Pergunta a senha de 6 números (não aparece na tela) e imprime "<saltHex>:<hashHex>".
//   Cole esse valor na variável de ambiente CORINGA_SENHA do Netlify.
// Uso: node dev/hash-pin.mjs --painel
//   Para quem esqueceu a senha do PAINEL: pergunta a senha nova do painel (6 a 60 caracteres) e imprime
//   "<saltHex>:<hashHex>" para a variável PROFESSOR_NOVA_SENHA (vale uma vez, na próxima entrada no painel).
// O PIN é lido da ENTRADA PADRÃO, nunca da linha de comando (assim ele não fica no histórico do terminal).
// Também funciona com a entrada redirecionada (a primeira linha é o PIN), por exemplo em testes.
// O hash usa os MESMOS parâmetros do PIN dos alunos (hashPin de src/core.mjs).

import { hashPin, hashSenha, DIGITOS_PIN } from "../src/core.mjs";

const PIN_RE = new RegExp(`^[0-9]{${DIGITOS_PIN}}$`);

function sair(msg, codigo = 2) {
  process.stderr.write(msg + "\n");
  process.exit(codigo);
}

const PAINEL = process.argv[2] === "--painel";
if (process.argv.length > (PAINEL ? 3 : 2)) {
  sair(`Uso: node dev/hash-pin.mjs [--painel]\nNão escreva a senha na linha de comando: o programa pergunta e ela não aparece na tela.`);
}
// Senha do painel: mesma regra de "Trocar senha" (6 a 60 caracteres). Perfil de teste: 6 números.
const valida = (s) => (PAINEL ? Array.from(s).length >= 6 && Array.from(s).length <= 60 : PIN_RE.test(s));
const REGRA = PAINEL ? "A senha do painel precisa ter de 6 a 60 caracteres." : `A senha precisa ter exatamente ${DIGITOS_PIN} números.`;

/** Lê uma linha do terminal sem mostrar o que é digitado. */
function perguntarEscondido(pergunta) {
  return new Promise((resolve) => {
    const entrada = process.stdin;
    process.stderr.write(pergunta);
    entrada.setRawMode(true);
    entrada.resume();
    entrada.setEncoding("utf8");
    let texto = "";
    const aoDigitar = (pedaco) => {
      for (const c of pedaco) {
        if (c === "\r" || c === "\n" || c === "\u0004") {
          entrada.setRawMode(false);
          entrada.pause();
          entrada.removeListener("data", aoDigitar);
          process.stderr.write("\n");
          return resolve(texto);
        }
        if (c === "\u0003") {
          entrada.setRawMode(false);
          process.stderr.write("\n");
          process.exit(130); // Ctrl+C
        }
        if (c === "\u007f" || c === "\b") texto = texto.slice(0, -1);
        else if (c >= " ") texto += c;
      }
    };
    entrada.on("data", aoDigitar);
  });
}

/** Entrada redirecionada: a primeira linha. */
async function lerPrimeiraLinha() {
  let tudo = "";
  for await (const pedaco of process.stdin) {
    tudo += pedaco;
    if (tudo.includes("\n") || tudo.length > 1000) break;
  }
  return tudo.split(/\r?\n/)[0];
}

let pin;
if (process.stdin.isTTY) {
  const pergunta = PAINEL ? "Senha nova do painel do professor (não aparece na tela): " : `Senha do perfil de teste (${DIGITOS_PIN} números, não aparece na tela): `;
  pin = (await perguntarEscondido(pergunta)).trim();
  if (!valida(pin)) sair(REGRA);
  const outra = (await perguntarEscondido("Digite a mesma senha de novo: ")).trim();
  if (outra !== pin) sair("As duas senhas não são iguais. Rode de novo.");
} else {
  pin = (await lerPrimeiraLinha()).trim();
  if (!valida(pin)) sair(REGRA);
}

const { salt, hash } = PAINEL ? await hashSenha(pin) : await hashPin(pin);
process.stdout.write(`${salt}:${hash}\n`);
if (process.stdout.isTTY) {
  const variavel = PAINEL ? "PROFESSOR_NOVA_SENHA" : "CORINGA_SENHA";
  process.stderr.write(`Cole a linha acima na variável ${variavel} do Netlify (Site configuration → Environment variables) e faça um novo deploy.\n`);
}
