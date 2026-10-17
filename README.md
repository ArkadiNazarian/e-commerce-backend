# E-Commerce API

A REST API for an e-commerce platform built with **Node.js**, **TypeScript**, **Express 5**, **MongoDB** and **Redis** — plus an AI shopping assistant that answers product questions with retrieval-augmented generation (RAG) over a Redis vector index.

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Runtime | Node.js 20, TypeScript (ESM, `strict`) |
| Web framework | Express 5, helmet, express-rate-limit, morgan, cookie-parser |
| Database | MongoDB + Mongoose |
| Cache / vectors | Redis (`redis` client, RediSearch vector index) |
| AI | OpenRouter SDK (embeddings + chat completions) |
| Auth | JWT (`jsonwebtoken`), bcryptjs, httpOnly cookies |
| Scheduling | node-cron |
| Tooling | tsx, nodemon, Docker, Docker Compose |

---

## Features

**Catalog & commerce**
- Products with slug, SKU, images, stock, brand, tags and ratings — full CRUD (admin only for writes)
- Categories with slug lookups and "products in category" queries
- Cart and wishlist (add / remove item / get / delete)
- Addresses book per user
- Checkout flow: pick a shipping address and create an order with item totals, shipping, discount, status and payment status
- Order history, single order lookup and deletion

**Auth & authorization**
- Signup / login with **access + refresh JWTs** stored in `httpOnly`, `SameSite=strict` cookies
- Refresh token rotation (`POST /auth/refresh-token`), password forget/reset flow
- Role-based access control: `admin` | `user`, enforced by `protectedRoute` and `adminProtectedRoute` middleware

**AI shopping assistant (RAG)**
- A cron job runs **every minute**, syncs products from MongoDB into Redis hashes (`allProducts:<id>`) and generates a 1024-dim embedding per product via OpenRouter (`liquid/lfm-2.5-embedding-350m:free`), only re-embedding products whose `updatedAt` changed
- A RediSearch `HNSW` vector index (`idx:products`, cosine) is created automatically at boot
- `POST /api/v1/bot/sendMessage` embeds the question, runs a KNN search for the top 5 products, and asks a chat model (`nvidia/nemotron-3.5-lightning:free`) to answer using only those products — returning both the answer and the matched products

**Security & ops**
- `helmet` headers, global rate limiting (100 req / 15 min / IP), 50 kB JSON body limit
- Centralized error handler + 404 catch-all, `unhandledRejection` graceful shutdown
- Request logging with `morgan`
- Docker Compose stack with healthchecks for Redis and MongoDB, persistent volumes

---

## Project structure

```
├── data/
│   └── products.json            # sample product data
├── src/
│   ├── app.ts                   # express app, middleware, route mounting
│   ├── server.ts                # bootstrap: redis, vector index, mongo, listeners
│   ├── controller/              # route handlers (auth, product, cart, bot, …)
│   ├── route/                   # express routers
│   ├── model/                   # mongoose schemas (user, product, order, …)
│   ├── redis/
│   │   ├── productVectorIndex.ts   # creates idx:products (HNSW, 1024-dim)
│   │   └── productVectorSearch.ts  # KNN search + LLM answer
│   ├── cron/productRedis.cron.ts    # every-minute Mongo → Redis product sync
│   ├── types/express.d.ts
│   └── utils/
├── Dockerfile
├── docker-compose.yml
└── tsconfig.json
```

---

## Getting started

### Prerequisites
- Node.js ≥ 20 and yarn (or npm)
- Docker + Docker Compose (for Redis/Mongo, or the whole stack)

### Environment variables

Create a `.env` in the project root:

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | ✅ | Port the server listens on (compose uses `3000`) |
| `MONGODB_URI` | ✅ | e.g. `mongodb://localhost:27017/ecommerce` |
| `REDIS_URL` | ✅ | e.g. `redis://localhost:6379` |
| `SECRET_KEY` | ✅ | Secret for signing access tokens |
| `REFRESH_TOKEN` | ✅ | Secret for signing refresh tokens |
| `OPENROUTER_API_KEY` | ✅ | Powers embeddings + chat for the AI assistant |

> ⚠️ `docker-compose.yml` currently passes `MONGODB_URI`, `REDIS_URL`, `PORT`, `SECRET_KEY` and `REFRESH_TOKEN` to the app container. To use the AI assistant inside Docker, add `- OPENROUTER_API_KEY=${OPENROUTER_API_KEY}` to the `node-app` service's `environment`.

### Option A — run everything with Docker

```bash
docker compose up --build
```

This starts Redis, MongoDB and the Node app (built from the `Dockerfile`, `tsc` compiled) on **http://localhost:3000**.

### Option B — local development

```bash
# 1. install dependencies
yarn install

# 2. start only the data services
docker compose up -d redis mongo

# 3. configure environment
#    create .env as described above

# 4. run in watch mode (tsx + nodemon)
yarn dev
```

### Scripts

| Script | Command | What it does |
| --- | --- | --- |
| `yarn dev` | `nodemon --exec tsx src/server.ts` | Run with live reload, no build step |
| `yarn build` | `tsc` | Compile TypeScript to `dist/` |
| `yarn start` | `node dist/server.js` | Run the compiled build |

### Compose services

| Service | Image | Notes |
| --- | --- | --- |
| `redis` | `redis:latest` | AOF persistence, `redis-cli ping` healthcheck |
| `mongo` | `mongo:7` | Volume `mongo-data`, `mongosh` healthcheck |
| `node-app` | built from `Dockerfile` | Port `3000:3000`, waits for healthy deps |

---

## API reference

**Base URL:** `http://localhost:3000/api/v1`

Responses follow a `{ success, data, ... }` shape; errors are routed through the global error handler.

🔒 = requires valid auth cookie (`token`). 🛡 = requires `admin` role.

### Auth — `/auth`
| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/auth/signup` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh-token` | Public (uses `refreshToken` cookie) |
| POST | `/auth/forget-password` | Public |
| POST | `/auth/reset-password/:resetPasswordToken` | Public |

### Users — `/user`
| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/user/me` | 🔒 |
| PATCH | `/user/me/update-user-info` | 🔒 |
| PATCH | `/user/me/update-role` | 🔒 |
| GET | `/user/all` | 🛡 |

### Addresses — `/address`
| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/address/add` | 🔒 |
| GET | `/address/user-addresses` | 🔒 |
| GET | `/address/:addressId` | 🔒 |
| PATCH | `/address/:addressId` | 🔒 |
| DELETE | `/address/:addressId` | 🔒 |

### Categories — `/category`
| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/category/add` | 🛡 |
| GET | `/category/slug/:slug` | 🔒 |
| GET | `/category/id/:categoryId` | 🛡 |
| GET | `/category/:categoryId/products` | 🔒 |
| DELETE | `/category/:categoryId/delete` | 🛡 |

### Products — `/product`
| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/product/add` | 🛡 |
| GET | `/product/all` | 🔒 |
| GET | `/product/product-tags` | 🔒 |
| GET | `/product/:productId` | 🔒 |
| PATCH | `/product/:productId/update` | 🛡 |
| DELETE | `/product/:productId` | 🛡 |

### Cart — `/cart`
| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/cart/add` | 🔒 |
| GET | `/cart/get` | 🔒 |
| PATCH | `/cart/remove-item` | 🔒 |
| DELETE | `/cart/delete` | 🔒 |

### Wishlist — `/wishlist`
| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/wishlist/add` | 🔒 |
| GET | `/wishlist/get` | 🔒 |
| PATCH | `/wishlist/remove-item` | 🔒 |
| DELETE | `/wishlist/delete` | 🔒 |

### Checkout — `/checkout`
| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/checkout/order/add` | 🔒 |
| PATCH | `/checkout/shipping-address` | 🔒 |

### Orders — `/order`
| Method | Endpoint | Access |
| --- | --- | --- |
| GET | `/order/get` | 🔒 |
| GET | `/order/:orderId` | 🔒 |
| DELETE | `/order/:orderId/delete` | 🔒 |

### AI assistant — `/bot`
| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/bot/sendMessage` | 🔒 |

```bash
curl -X POST http://localhost:3000/api/v1/bot/sendMessage \
  -H 'Content-Type: application/json' \
  -b 'token=<your-access-token>' \
  -d '{"message":"show me wireless headphones under 100"}'
```

Returns `{ success: true, data: { answer, products } }` where `products` are the top-5 vector-search hits used to build the answer.

---

## Data model

| Model | Key fields |
| --- | --- |
| `User` | name, email, password (hashed), role `admin \| user`, `refreshToken` |
| `Category` | name, slug, description, image |
| `Product` | name, slug, description, price, images[], category, stock, sku, rating_avg, rating_count, tags[], brand |
| `Address` | label, phone, user, city, state, postal_code, country, line1 |
| `Cart` | user, items[] |
| `Wishlist` | user, products[] |
| `Order` | order_number, user, items[], total_price, shipping_price, discount_price, status, payment_method, payment_status, tracking_number |

---

## How the vector search works

1. **Sync** — `src/cron/productRedis.cron.ts` runs on `* * * * *`, loads all products (populated category), builds an `embeddingText` block (name, brand, category, description, tags) and stores `{ data, embedding, embeddingText }` in `allProducts:<id>` — skipping products that haven't changed since the cached copy.
2. **Index** — `src/server.ts` calls `createProductVectorIndex()` on boot, creating `idx:products` (VECTOR, HNSW, FLOAT32, dim 1024, COSINE) over the `allProducts:` hash prefix, plus a TEXT field on `embeddingText`.
3. **Query** — `src/redis/productVectorSearch.ts` embeds the user's message, runs `*=>[KNN $K @embedding $BLOB AS score]` for the top 5 matches, and passes the resulting product context to the chat model with a strict "only use these products" system prompt.

---

## License

MIT © ArkadiNazarian