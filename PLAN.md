# Plano: Wishlist Kaboom — MVP

## Contexto

O usuário frequentemente encontra produtos interessantes em sites de compras diferentes, salva o link "para depois" e acaba esquecendo onde guardou — perdendo a intenção de compra. A ideia é ter um lugar único e simples para colar o link de qualquer produto e ter nome, imagem e preço salvos automaticamente, sempre visíveis ao abrir o app.

Requisitos definidos com o usuário:
- MVP simples: colar link → item salvo com nome, imagem e valor.
- Leve de manter (poucos serviços, hospedagem gerenciada, sem infra própria).
- Arquitetura pronta para evoluir sem retrabalho grande.
- Uso pessoal no início, mas **com login** (acesso de qualquer dispositivo).
- Roadmap já sinalizado pelo usuário: alerta de queda de preço, categorias/múltiplas listas, compartilhamento público da lista.

O repositório (`wishlist-kaboom`) está vazio (só `README.md` e `LICENSE`) — este é um projeto greenfield.

## Decisões de arquitetura (validadas com o usuário)

| Decisão | Escolha |
|---|---|
| Extração de dados do link | Scraping de meta tags Open Graph, com formulário sempre editável (cobre fallback manual) |
| Usuários | Uso pessoal, mas com login |
| Login | Google OAuth |
| Stack | Next.js (recomendado) |
| Hospedagem | Serviços gratuitos gerenciados |
| Plataforma | Web responsivo (mobile + desktop no mesmo site) |
| Ações do MVP | Adicionar, editar, excluir, marcar como comprado |
| Roadmap sinalizado | Alerta de queda de preço; categorias/tags e múltiplas listas; compartilhar lista publicamente |

## Stack técnica recomendada

- **Next.js (App Router, TypeScript)** — fullstack em um único projeto (UI + rotas de API), deploy simples, ecossistema maduro.
- **Supabase** (Postgres + Auth + Storage, free tier) — escolhido em vez de "Next.js + NextAuth + Neon separados" porque:
  - Auth com Google OAuth já vem pronto, sem gerenciar sessões/senhas na mão.
  - Row Level Security (RLS) do Postgres isola dados por usuário nativamente — hoje "só eu", amanhã multiusuário, **sem mudar schema nem lógica de autorização**.
  - Um único serviço cobre banco + auth + (futuramente) storage de imagens — menos peças móveis para manter.
- **Tailwind CSS** — estilização rápida, mobile-first.
- **cheerio** — parsing leve de HTML no servidor para ler as meta tags Open Graph (não precisa de browser headless).
- **Vercel** — deploy do Next.js, free tier, integração via Git.

Todos os serviços têm free tier suficiente para uso pessoal.

## Modelo de dados

Desenhado para já comportar o roadmap sem migração pesada depois.

```sql
-- lists: existe desde o MVP mesmo com "1 lista por usuário",
-- para não exigir migração quando "múltiplas listas" for implementado.
create table lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Minha Wishlist',
  is_default boolean not null default true,
  created_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, -- redundante de propósito: simplifica policies de RLS
  url text not null,
  title text,
  image_url text,
  price numeric,
  currency text not null default 'BRL',
  status text not null default 'active', -- 'active' | 'purchased'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table lists enable row level security;
alter table items enable row level security;

create policy "own lists" on lists for all using (auth.uid() = user_id);
create policy "own items" on items for all using (auth.uid() = user_id);
```

- Ao primeiro login de um usuário, criar automaticamente uma `list` padrão (`is_default = true`) — via trigger no Supabase ou lógica no app no primeiro carregamento.
- Campos pensados para o futuro (**não implementar agora**, só documentado): `price_history` (item_id, price, checked_at) para alerta de queda de preço; `tags` + `item_tags` para categorização; `share_token`/`is_public` em `lists` para compartilhamento.

## Fluxo de extração de dados (colar link)

Endpoint server-side `POST /api/scrape { url }`:
1. Validar que a URL é `http(s)` e **bloquear IPs privados/internos** (proteção contra SSRF, já que o endpoint aceita URL arbitrária de um usuário autenticado).
2. Buscar o HTML da página (timeout curto, `User-Agent` de navegador, limite de tamanho de resposta).
3. Parsear com `cheerio` e extrair, em ordem de prioridade:
   - **Título**: `og:title` → `twitter:title` → `<title>`
   - **Imagem**: `og:image` → `twitter:image`
   - **Preço**: `og:price:amount` → `product:price:amount` → `itemprop="price"` → heurística best-effort (regex por padrões de moeda no HTML)
   - **Moeda**: `og:price:currency` → `product:price:currency` → default `BRL`
4. Responder sempre `200` com os campos encontrados (podendo vir `null`) — **nunca travar o fluxo em erro de scraping**.

No frontend, colar o link sempre abre o **mesmo formulário editável**, pré-preenchido com o que foi encontrado (vazio quando nada foi encontrado). Isso já cobre naturalmente o "fallback manual" sem precisar de duas telas diferentes.

## Páginas e fluxo de UI

- `/login` — botão "Entrar com Google" (Supabase Auth OAuth).
- `/` (protegida por middleware, redireciona para `/login` se não autenticado) — tela principal:
  - Botão "Adicionar item" → abre modal com input de URL → chama `/api/scrape` → mostra formulário editável (nome, imagem, preço) → salvar.
  - Lista de itens em cards: imagem, título, preço, link "Ver no site original", ações (Editar, Marcar como comprado, Excluir).
  - Abas/filtro simples: Ativos vs Comprados.
- `middleware.ts` — checa sessão Supabase, protege rotas fora de `/login`.

## Estrutura de pastas sugerida

```
/app
  /login/page.tsx
  /(protected)/page.tsx
  /api/scrape/route.ts
  layout.tsx
/lib
  /supabase/client.ts       -- client Supabase (browser)
  /supabase/server.ts       -- client Supabase (server components/route handlers)
  scrape.ts                 -- lógica de parsing de Open Graph
  types.ts                  -- tipos compartilhados (Item, List)
/components
  ItemCard.tsx
  AddItemDialog.tsx
  ItemForm.tsx
middleware.ts
supabase/migrations/0001_init.sql   -- schema + RLS acima
```

## Variáveis de ambiente

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

(Não é necessário `SERVICE_ROLE_KEY` no servidor para o MVP — CRUD passa pela sessão do usuário + RLS; o endpoint de scrape não acessa o banco.)

## Ordem de implementação sugerida

1. Inicializar projeto Next.js (TypeScript, App Router, Tailwind).
2. Criar projeto no Supabase; configurar provider Google OAuth no dashboard.
3. Rodar migration com schema (`lists`, `items`) + RLS + trigger de lista padrão no primeiro login.
4. Implementar autenticação (login/logout, `middleware.ts` protegendo rotas).
5. Implementar `/api/scrape` (fetch + cheerio + parsing + proteção SSRF).
6. Implementar UI: listagem, adicionar (via modal + formulário pré-preenchido), editar, marcar como comprado, excluir.
7. Estilizar mobile-first com Tailwind.
8. Deploy: conectar repositório à Vercel, configurar env vars do Supabase.
9. QA manual (ver critérios de aceite abaixo).

## Critérios de aceite / verificação

- Login com Google funciona e mantém sessão entre recarregamentos.
- Colar link de um site com Open Graph (ex: Amazon, Mercado Livre) preenche nome/imagem/preço automaticamente no formulário.
- Colar link de um site sem Open Graph abre o formulário vazio, editável, sem travar o fluxo.
- Item salvo aparece na lista imediatamente.
- Editar um item persiste as mudanças.
- Marcar como comprado tira o item da aba "Ativos" e o mantém em "Comprados".
- Excluir remove definitivamente.
- Testar com duas contas Google diferentes: dados de uma não aparecem para a outra (valida RLS).
- Layout usável tanto em largura de celular quanto desktop.

## Riscos e limitações conhecidas (MVP)

- Scraping via Open Graph não funciona em sites cujo conteúdo só é renderizado via JavaScript (SPAs) — o formulário editável cobre esse caso, mas com preenchimento manual.
- Extração de preço é heurística/best-effort; pode vir incorreta ou vazia dependendo do site.
- Imagens são referenciadas por URL externa (hotlink); se o produto sair do ar no site de origem, a imagem pode quebrar.
- Sem verificação periódica de preço no MVP (fica para o roadmap).

## Segurança

Pontos a cobrir na implementação, dado que o app usa OAuth do Google e aceita URLs arbitrárias de usuários:

- **Autenticação (Google OAuth)**:
  - Usar o fluxo OAuth padrão do Supabase Auth (PKCE) — não implementar troca de token manualmente.
  - Configurar no Google Cloud Console apenas os *redirect URIs* exatos do app (domínio de produção + `localhost` para dev); nunca usar wildcard.
  - Cookies de sessão como `httpOnly` e `secure` (padrão do Supabase Auth Helpers para Next.js) — token de sessão nunca acessível via JavaScript no browser.
  - `middleware.ts` deve validar a sessão em **toda** rota protegida (não confiar em checagem só no client).
- **Autorização e isolamento de dados**:
  - RLS (Row Level Security) é a linha de defesa principal — toda query em `lists`/`items` deve passar pela sessão do usuário, nunca usar `service_role key` no código do app para burlar RLS.
  - Testar explicitamente com duas contas diferentes que uma não acessa dados da outra (já listado nos critérios de aceite).
- **Endpoint `/api/scrape` (maior superfície de risco, pois busca URLs arbitrárias)**:
  - Validar que a URL é `http`/`https` antes de qualquer fetch.
  - Bloquear SSRF: resolver o host e rejeitar IPs privados/loopback/link-local (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `::1`, etc.) e recusar redirects para esses ranges.
  - Timeout curto (ex: 5s) e limite de tamanho de resposta (ex: 2MB) para evitar abuso/DoS no próprio servidor.
  - Rate limiting por usuário no endpoint (ex: N requisições/minuto) para evitar uso do app como proxy de scraping.
  - Exigir sessão autenticada para chamar o endpoint — não deixar público.
- **Segredos e configuração**:
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` pode ser pública (é a chave anônima, protegida por RLS); qualquer `service_role key` **nunca** deve ir para variáveis `NEXT_PUBLIC_*` nem para o client — só se necessária no futuro, fica só em variável server-side na Vercel.
  - `.env.local` no `.gitignore` desde o commit inicial.
- **Higiene geral**:
  - Sanitizar/escapar dados vindos do scraping antes de renderizar (título, imagem) para evitar XSS — o React já escapa por padrão, mas evitar `dangerouslySetInnerHTML` com conteúdo scrapado.
  - HTTPS obrigatório (Vercel já força por padrão).
  - Manter dependências atualizadas (`npm audit` / Dependabot no repositório).

## Roadmap futuro (arquitetura já preparada, não construir agora)

- **Alerta de queda de preço**: tabela `price_history` + job agendado (Vercel Cron ou Supabase Edge Function) que revisita a URL periodicamente e compara preços; notificação por email (ex: Resend).
- **Categorias/tags e múltiplas listas**: tabela `lists` já existe desde o MVP; adicionar `tags` + `item_tags` (N:N) quando necessário.
- **Compartilhar lista publicamente**: adicionar `share_token`/`is_public` em `lists` + rota pública somente leitura que expõe os itens sem exigir login.
