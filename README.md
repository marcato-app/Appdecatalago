# Appdecatalogo

App de catálogo digital multi-loja: lojistas se cadastram, escolhem um modelo
visual, cadastram seu conteúdo (produtos com preço, ou portfólio de serviços)
e recebem uma página pública com link único pra compartilhar no
Instagram/WhatsApp.

Veja `ARCHITECTURE.md` para o desenho técnico completo (stack, modelo de
dados, sistema de templates, rotas multi-loja e fases do projeto), e
`references/modelos/` para os modelos de referência que guiaram o design.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com credenciais do seu projeto Supabase
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Banco de dados

Schema em `db/schema.ts` (Drizzle ORM).

```bash
npx drizzle-kit generate   # gera migration a partir do schema
npx drizzle-kit migrate    # aplica migrations pendentes (precisa de DATABASE_URL)
```
