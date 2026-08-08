# Wishlist Kaboom

Cole o link de um produto e guarde nome, imagem e preço num só lugar. MVP em Next.js + Supabase — veja o raciocínio completo em [`PLAN.md`](./PLAN.md).

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- Supabase (Postgres + Auth com Google OAuth)
- cheerio (parsing de Open Graph no servidor)

## Setup local

### 1. Criar o projeto no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (free tier).
2. Em **Authentication → Providers**, habilite o provider **Google** — você vai precisar de um Client ID/Secret do Google Cloud Console (veja passo 2).
3. Em **SQL Editor**, rode o conteúdo de [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) para criar as tabelas, RLS e o trigger de lista padrão.
4. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.

### 2. Configurar o Google OAuth

1. No [Google Cloud Console](https://console.cloud.google.com/apis/credentials), crie um **OAuth 2.0 Client ID** (tipo "Web application").
2. Em **Authorized redirect URIs**, adicione a URL de callback do Supabase (formato `https://<seu-projeto>.supabase.co/auth/v1/callback`) — disponível na tela do provider Google dentro do Supabase Auth.
3. Copie o Client ID e Client Secret gerados e cole no provider Google, dentro do Supabase Dashboard.
4. Nunca use wildcard nos redirect URIs — cadastre apenas domínios exatos (produção e, se necessário, seu callback local do Supabase).

### 3. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha com os valores do passo 1:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 4. Rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — você será redirecionado para `/login`.

## Deploy (Vercel)

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. Configure as mesmas variáveis de ambiente (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) no projeto da Vercel.
3. Após o primeiro deploy, volte no Google Cloud Console e adicione o domínio de produção (`https://<seu-app>.vercel.app`) como origem autorizada, se necessário.

## Estrutura

```
/app
  /login/page.tsx            -- tela de login (Google OAuth)
  /auth/callback/route.ts    -- troca o código OAuth por sessão
  /(protected)/page.tsx      -- tela principal (lista de itens)
  /api/scrape/route.ts       -- scraping SSRF-safe de Open Graph
  actions.ts                 -- server actions (CRUD de items)
/components                  -- UI (cards, modais, formulário)
/lib
  /supabase                  -- clients Supabase (browser/server)
  scrape.ts                  -- parsing de Open Graph
  safeFetch.ts / ssrf.ts     -- fetch protegido contra SSRF
  rateLimit.ts                -- rate limit best-effort do /api/scrape
proxy.ts                     -- protege rotas fora de /login e /auth
supabase/migrations/         -- schema SQL + RLS
```

## Limitações conhecidas do MVP

- Scraping via Open Graph não funciona em sites cujo conteúdo é renderizado só via JavaScript (SPAs) — o formulário fica editável para preenchimento manual.
- Extração de preço é heurística; pode vir incorreta ou vazia.
- Sem alerta de queda de preço ainda (roadmap, ver `PLAN.md`).
