# Missão Redação

Jogo para os alunos do Ensino Médio montarem, passo a passo, os textos pedidos pelo professor.
Cada série tem as suas atividades (poema, crônica, redação do ENEM…).

- **Alunos:** escolhem a série, escrevem o nome e sobrenome e uma senha de 6 números. Só entra quem está na lista da série. Depois de entrar, o aluno vê a **caixa de atividades** da série dele e escolhe uma. O progresso fica salvo na nuvem e ele continua de qualquer celular.
- **Professor:** acessa `/professor` com a senha do professor.
  - **Progresso:** cada aluno com o resumo de cada atividade (por exemplo, "Texto 1: Concluiu · Texto 2: Fase 2 de 6").
  - **Turmas e alunos:** a lista da chamada de cada série. Escolha a atividade (Texto 1, Texto 2…) para ver quem ainda não começou, quem está em andamento e quem concluiu. Também dá para editar as listas.
  - **Aluno:** uma parte para cada atividade, com o texto como numa folha (os versos do poema aparecem um por linha) e o botão **Copiar texto**.
- **Aluno esqueceu a senha ou ficou bloqueado?** No painel, abra o aluno e toque em **Apagar senha do aluno**. Aparece uma senha nova de 6 números: entregue ao aluno. O progresso e os textos continuam salvos.
- **Lista de alunos:** nunca fica neste repositório (ele é público). Vem da lista salva no painel ou, se ela não existir, da variável de ambiente `TURMAS_ALUNOS` do Netlify, no formato `[{"label":"1ª Série","alunos":["NOME SOBRENOME", ...]}, ...]`.

## Atividades de cada série

Cada atividade é um arquivo em `public/atividades/`. A série, a ordem na caixa e o nome saem do próprio arquivo.

| Série | Arquivo | Na caixa | Gênero |
|---|---|---|---|
| 1ª | `poema-carpe-diem.js` | Texto 1 | Poema (título + 3 estrofes de 4 versos) |
| 2ª | `leitores.js` | Texto 1 | Dissertativo-argumentativo |
| 2ª | `cronica-olhar.js` | Texto 2 | Crônica lírica ("O olhar") |
| 3ª | `justica-climatica.js` | Texto 1 | Dissertativo-argumentativo |
| 3ª | `inseguranca-alimentar.js` | Texto 2 | Dissertativo-argumentativo |

### Como acrescentar uma atividade nova

1. Copie um arquivo parecido (o modelo mais completo é `public/atividades/leitores.js`) para `public/atividades/<id>.js` e mude o conteúdo. No arquivo, `id` é um nome curto só com letras minúsculas, números e hífen (ex.: `carta-aberta`), `serie` é `'1'`, `'2'` ou `'3'` e `ordem` é a posição na caixa da série (1, 2, 3…).
2. Acrescente a linha `<script src="/atividades/<id>.js"></script>` junto das outras, **nos dois arquivos**: `public/index.html` (o jogo) e `public/professor/index.html` (o painel), na mesma ordem.
3. Rode `npm test`. O arquivo `tests/atividades.test.mjs` confere todas as atividades: os campos obrigatórios, as fases, as perguntas, todas as combinações de escolhas (nenhuma pode dar texto quebrado) e se o jogo e o painel carregam os mesmos arquivos. Tem que passar sem erros.
4. Jogue a atividade inteira num navegador de verdade e leia o texto final:
   `NODE_PATH=$(npm root -g) node tests/jogar-atividade.mjs <id> 0` (troque `0` por `1`, `2`, `0,2,1`… para escolher outras opções).

Se um arquivo de atividade faltar ou tiver erro, o painel continua funcionando, e os textos que os alunos já escreveram nessa atividade continuam aparecendo nele.

## Perfil de teste do professor

O professor pode entrar no jogo como se fosse um aluno, com o próprio nome, e ver as atividades de **todas** as séries.

- **Como entrar:** escolha qualquer série e escreva o nome completo, exatamente como está configurado (acento e maiúsculas não importam). Nome pela metade não vale: um aluno com nome parecido nunca cai no perfil de teste. É sempre a mesma conta, qualquer que seja a série escolhida.
- **Quem é:** sem configurar nada, o perfil de teste é `GUILHERME CAMOZZATO TEIXEIRA`. Para trocar, crie no Netlify a variável `ALUNOS_CORINGA` com um nome por linha (ou uma lista JSON, como `["NOME SOBRENOME"]`). Variável vazia = nenhum perfil de teste.
- **Senha inicial (recomendado):** para ninguém "pegar" o perfil antes de você, defina a senha dele numa variável:
  1. No computador, na pasta do projeto, rode `node dev/hash-pin.mjs`. Ele pergunta a senha de 6 números duas vezes (ela não aparece na tela e não fica no histórico).
  2. Copie a linha que ele mostra (`números-e-letras:números-e-letras`) e cole no Netlify, numa variável chamada `CORINGA_SENHA`. Depois faça um novo deploy.
  3. No painel, em **Turmas e alunos**, o cartão **Perfil de teste** deve mostrar "Senha inicial do perfil: configurada".
  Com a variável, o perfil só abre com essa senha, até no primeiro acesso; senha errada conta para o bloqueio, como para os alunos. Sem a variável, quem entrar primeiro com o nome cria a senha. Se alguém já criou o perfil antes de você configurar a variável, abra o perfil no painel e use **Excluir aluno**: no próximo acesso ele nasce de novo com a sua senha.
- **No painel:** aparece como "Perfil de teste" (filtro próprio em Progresso e um cartão em Turmas e alunos). Não conta em nenhuma série.

## Como funciona por dentro

- `public/index.html`: o jogo. `public/atividades/*.js`: uma atividade por arquivo.
- `public/professor/index.html`: o painel do professor.
- `netlify/functions/api.mjs` e `src/core.mjs`: a API (`/api/...`), que guarda os dados no Netlify Blobs.
- Senhas dos alunos e do professor ficam guardadas só como código embaralhado (hash), nunca em texto.

## Publicar no Netlify

Netlify → **Add new project** → **Import an existing project** → GitHub → repositório `GuilhermeCmz` →
branch **`missao-redacao`** → **Deploy**. Não precisa mudar mais nada: as configurações estão em `netlify.toml`.
Variáveis de ambiente (Site configuration → Environment variables): `TURMAS_ALUNOS` (lista de alunos),
`CORINGA_SENHA` (senha inicial do perfil de teste) e, se quiser, `ALUNOS_CORINGA`.

## Testar no computador

```bash
npm install
npm test          # testes da API e das atividades (tests/api.test.mjs e tests/atividades.test.mjs)
npm run dev -- --turmas lista.json   # abre em http://localhost:8888 (dados só na memória; lista fora do repositório)
NODE_PATH=$(npm root -g) npm run e2e   # teste completo no navegador (precisa do Playwright)
```
