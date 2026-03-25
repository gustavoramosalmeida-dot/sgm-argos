# SGM API (sgm-api)

API Node (Express) + PostgreSQL para o SGM.

## Variáveis de ambiente

Copie `.env.example` para `.env` na pasta `server/` e ajuste os valores.

### Produção (EC2, Postgres local)

| Variável | Descrição |
|----------|-----------|
| `NODE_ENV` | `production` |
| `PORT` | Porta onde a API escuta (ex.: `3333` ou atrás do Nginx) |
| `CORS_ORIGIN` | Origem do frontend (uma ou várias separadas por vírgula) |
| `JWT_SECRET` | Obrigatório em produção |
| `PGHOST` | Em Postgres na mesma máquina: `127.0.0.1` |
| `PGPORT` | `5432` (padrão) |
| `PGDATABASE` | Nome da base já criada |
| `PGUSER` / `PGPASSWORD` | Credenciais do Postgres |
| `DATABASE_URL` | Opcional; se definida, substitui `PG*` |
| `TRUST_PROXY` | `1` se a API estiver atrás de Nginx/ALB (cookies/IP corretos) |
| `REQUIRE_DB_ON_STARTUP` | `1` recomendado: processo não sobe se o DB falhar |
| `PUBLIC_BASE_URL` | Base pública da API para URLs de imagem (sem `/` final) |
| `SGM_AUTH_COOKIE_SECURE` | `1` se o site for servido em **HTTPS** (flag `Secure` no cookie JWT); omita ou `0` em **HTTP** (ex.: acesso por IP sem TLS) |

### `PUBLIC_BASE_URL` (recomendado quando front e API têm origens diferentes)

URLs de imagem de máquina são gravadas no banco como **URL absoluta**. Em produção, defina a base pública da API **sem barra final**:

```env
PUBLIC_BASE_URL=https://api.seudominio.com
```

### Exemplo mínimo de `.env` (desenvolvimento)

```env
PORT=3333
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=sgm
PGUSER=postgres
PGPASSWORD=postgres
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento (ts-node-dev) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` / `npm run start:prod` | `node dist/server.js` |
| `npm run db:check` | Ping no Postgres + checagem mínima de tabelas/views |
| `npm run smoke` | Smoke test HTTP (API precisa estar em execução) |
| `npm run auth:bootstrap` | Criar primeiro admin (após migrations) |

## Endpoints de saúde

| Rota | Uso |
|------|-----|
| `GET /health` | Liveness simples (sem DB) |
| `GET /health/db` | Só status do banco |
| `GET /api/health` | Agregado: API + DB + `version` + timestamp (DB down → HTTP 503) |

## Smoke test na EC2

1. Configure `.env` e suba a API: `npm run build && npm start`
2. Opcional: `SMOKE_BASE_URL=http://127.0.0.1:3333 npm run smoke`

Valida: `/api/health`, `/api/auth/me` (401 sem cookie), `/api/sgm/machines` (401), `/health`.

## Checagem de schema

`npm run db:check` confirma a existência de: `sgm_users`, `asset_nodes`, `asset_events`, `asset_visual_layers`, `asset_visual_points`, `asset_files`, `vw_machine_overview`, `vw_machine_qr_inventory`, `vw_machine_timeline`.

Se faltar objeto, o servidor ainda sobe (com aviso no log), salvo `REQUIRE_DB_ON_STARTUP=1` só para falha de **conexão**, não para schema incompleto.

## Curl rápido

```bash
curl -sS http://127.0.0.1:3333/api/health
curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3333/api/auth/me
```

Esperado: JSON em `/api/health`; código `401` em `/api/auth/me` sem sessão.
