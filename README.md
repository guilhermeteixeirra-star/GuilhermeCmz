# Missão Redação

Jogo para os alunos da 2ª série montarem, passo a passo, uma redação do ENEM sobre
"Os desafios para a formação de leitores no Brasil".

- **Alunos:** entram com nome e sobrenome, turma e uma senha de 4 números. O progresso fica salvo na nuvem e eles continuam de qualquer celular.
- **Professor:** acessa `/professor` com a senha do professor e vê o progresso e as redações de todos os alunos.

## Como funciona por dentro

- `public/index.html`: o jogo.
- `public/professor/index.html`: o painel do professor.
- `netlify/functions/api.mjs` e `src/core.mjs`: a API (`/api/...`), que guarda os dados no Netlify Blobs.
- Senhas dos alunos e do professor ficam guardadas só como código embaralhado (hash), nunca em texto.

## Publicar no Netlify

Netlify → **Add new project** → **Import an existing project** → GitHub → repositório `GuilhermeCmz` →
branch **`missao-redacao`** → **Deploy**. Não precisa mudar mais nada: as configurações estão em `netlify.toml`.

## Testar no computador

```bash
npm install
npm test          # testes da API
npm run dev       # abre em http://localhost:8888 (dados só na memória)
```
