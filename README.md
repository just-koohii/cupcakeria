# Cupcakeria

Loja online de cupcakes feita com TanStack Start (React), TanStack Query, shadcn/ui (Base UI) e SQLite em memória (sql.js + Drizzle).

## Rodando localmente

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de produção (.output/)
pnpm typecheck
pnpm lint
```

### Contas de demonstração

| Papel         | E-mail            | Senha     |
| ------------- | ----------------- | --------- |
| Administrador | `admin@admin`     | `admin`   |
| Cliente       | `cliente@cliente` | `cliente` |

## Banco de dados

- SQLite **em memória**, acessível apenas no servidor (arquivos `*.server.ts`, bloqueados no bundle do cliente).
- Ao iniciar, o banco é populado com o administrador, 37 cupcakes (todos ≤ R$ 20,00), clientes de exemplo e ~90 pedidos dos últimos 45 dias (para alimentar dashboard e relatórios).
- O banco **volta ao estado inicial a cada 2 horas**, em janelas alinhadas ao relógio (00h, 02h, 04h…). O reset acontece no primeiro acesso após o início de uma nova janela e também por um timer em servidores de longa duração. Sessões criadas antes do reset deixam de valer.
- Senhas são armazenadas com `scrypt` e salt aleatório por usuário.

## Estrutura

```
src/
  db/                 schema Drizzle, cliente em memória com reset, seed
  features/
    auth/             login, cadastro, sessão, middlewares e guards de rota
    home/             página inicial
    products/         catálogo, detalhes e server functions de produtos
    cart/             carrinho (localStorage)
    checkout/         finalização do pedido e pagamento simulado
    orders/           "meus pedidos" e constantes de status
    admin-dashboard/  dashboard administrativo
    admin-products/   gerenciamento de produtos
    admin-orders/     gerenciamento de pedidos e contato com clientes
    sales-reports/    relatórios de vendas por período (+ CSV)
    layout/           cabeçalho, rodapé e créditos das fotos
  routes/             rotas finas que apenas delegam às features
```

## Imagens

As fotos são fotografias reais do Wikimedia Commons, sob licenças livres (CC0, domínio público, CC BY, CC BY-SA). Os créditos ficam em `src/db/seed/image-credits.json` e na página `/creditos`.

## Deploy na Vercel

1. Importe o repositório na Vercel (o `vercel.json` já declara o framework TanStack Start).
2. Defina `SESSION_SECRET` em **Settings → Environment Variables** (segredo do cookie de sessão; gere com `openssl rand -base64 32`).
3. Faça o deploy.

> Em ambiente serverless, cada instância tem seu próprio banco em memória. Dados criados em uma instância (contas, pedidos) podem não aparecer em outra, e se perdem quando a instância é reciclada. Isso é inerente ao requisito de banco em memória.
