# Arquitetura

Lojistas se cadastram, escolhem um modelo visual, cadastram seu conteúdo
(produtos com preço, ou portfólio de serviços) e recebem uma página pública
com link único pra compartilhar (Instagram/WhatsApp). Este documento registra
as decisões de arquitetura tomadas a partir de 3 modelos de referência em
`references/modelos/`:

- **adega-mm** — catálogo de produtos com preço: 2 páginas (hub de links +
  cardápio), seções→grupos→itens, busca, carrinho em `localStorage`, checkout
  vira mensagem de WhatsApp.
- **barbearia-tnt** — vitrine "link-in-bio": hero, carrossel de equipe,
  carrossel de galeria, mapa, links.
- **clinica** — vitrine "link-in-bio" com blocos diferentes: stats, chips de
  especialidade, carrossel de resultados com autoplay, depoimentos.

Os dois últimos já divergem entre si nos blocos que usam — por isso o sistema
de templates é "blocos configuráveis", não um layout fixo re-pintado.

## Stack

- **Next.js (App Router) + TypeScript** — SSR real é necessário porque os
  links são abertos direto do Instagram/WhatsApp, que só leem o HTML da
  primeira resposta (sem JS) pra gerar a prévia do link.
- **Tailwind CSS** pro "motor" estrutural + **CSS custom properties**
  (`--primary`, `--ink`, `--text-dim`...) por loja, geradas do campo
  `stores.theme` — o mesmo padrão que os 3 modelos de referência já usam.
- **PostgreSQL via Supabase** (Auth + Storage + DB integrados) — decisão
  revisitável se o projeto crescer e precisar de peças mais especializadas.
- **Drizzle ORM** (`db/schema.ts`) — schema como código, migrations geradas
  com `drizzle-kit`.
- **Vercel** pra hospedar o app.
- **Mobile depois**: empacotar com **Capacitor** (WebView em cima do mesmo
  código web) — é a opção que cumpre "sem reescrever"; Expo/React Native
  exigiria reimplementar a camada visual.
- Sem monorepo por enquanto — um app Next.js só, com o site público
  (`/[slug]`) separado do painel (`/dashboard`).

## Modelo de dados

Ver `db/schema.ts`. Preço em centavos (`price_cents`), tudo isolado por
`store_id`.

- `users`, `templates` (registro dos modelos), `stores`.
- Família **catálogo**: `categories` (auto-referenciada — `parent_id` nulo é
  seção, preenchido é grupo, cobre o aninhamento de 2 níveis do Adega MM sem
  fixar profundidade) e `products`.
- Compartilhado: `store_links` (Instagram, WhatsApp, app stores...).
- Família **portfólio**: `blocks` + `block_items` — as mesmas duas tabelas
  cobrem equipe, galeria, depoimentos, stats e chips, porque todos são "um
  bloco com título + lista ordenada de itens com subconjunto de {imagem,
  título, subtítulo, texto, extra}". Isso evita migration a cada novo tipo de
  bloco, mas mantém os itens consultáveis/reordenáveis — meio-termo
  deliberado entre tabela-por-tipo-de-bloco (rígido demais) e um JSON único
  por loja (perde consulta/ordenação).

Dois detalhes de correção importantes ao portar a lógica do Adega MM:

1. O carrinho original usa uma chave fixa (`mmCarrinho`) no `localStorage`
   porque é um site único. Na versão multi-loja isso vira `cart:${storeId}`,
   senão o carrinho de uma loja vaza pra outra no mesmo navegador.
2. Sem tabela `orders` no v1 — o "pedido" é a própria mensagem de WhatsApp,
   igual ao modelo original. Sem gateway de pagamento por enquanto.

## Sistema de templates

Um "modelo" = manifest (`templates/<slug>/manifest.ts`, ver `templates/types.ts`
e `templates/registry.ts`) + um pacote de componentes (a ser construído nas
próximas fases). O manifest declara quais blocos o template usa e em que
ordem — é o que a tela de cadastro de conteúdo vai ler pra saber quais campos
mostrar ao lojista.

**Motor compartilhado** (a construir, reusado por todos os templates):
`useCart(storeId)` + `useWhatsAppLink()`, `<HorizontalCarousel>` (drag por
ponteiro + autoplay/dots num componente só, cobrindo equipe/galeria/
resultados), `<MapEmbed>`, `<LinkButtonList>`, `<BlockRenderer>`.

**Específico de cada template**: tratamento visual do hero, fontes/animações,
overrides visuais pontuais de algum bloco.

`business_type` no template decide o formato de páginas (catálogo = 2
páginas com carrinho; portfólio = 1 página de blocos). Adicionar um 4º modelo
= uma pasta nova em `templates/` + uma linha na tabela `templates`, sem tocar
schema nem motor compartilhado.

## Rotas multi-loja

- Público: `app/[slug]/[[...path]]/page.tsx` — busca a loja pelo slug, 404 se
  não existir ou não estiver `published`; despacha pro formato de páginas do
  template. `generateMetadata()` gera OG tags pra prévia boa no
  Instagram/WhatsApp.
- Cache: ISR com revalidação sob demanda quando o lojista publica/salva.
- Slugs validados contra lista de palavras reservadas (`dashboard`, `api`,
  `login`...).
- Painel: `app/dashboard/**`, protegido por sessão Supabase, todo acesso ao
  banco filtrado por `owner_id = session.user.id`.

## Fases

- **Fase 0 (concluída)**: fundação do projeto — scaffold Next.js, schema
  Drizzle, estrutura de templates, esta documentação.
- **Fase 1**: loop completo com UM template — família **catálogo** (estilo
  Adega MM), porque é o fluxo que o produto descreve primeiro ("cadastra seus
  produtos") e por ser a parte mais arriscada tecnicamente (carrinho,
  categorias aninhadas, mensagem de pedido).
- **Fase 2**: família portfólio (barbearia/clínica), generalizando o motor de
  blocos; tela de escolha de modelo.
- **Fase 3**: mais modelos, QR code do link, upload de imagens, tema
  customizável.
- **Fase 4**: empacotamento mobile (Capacitor).
