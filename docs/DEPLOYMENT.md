# GSeoSuite Deployment Runbook

## Gereksinimler

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (distributed rate limiting & BullMQ için)
- Stripe hesabı (billing için isteğe bağlı)

## Ortam Değişkenleri

Kopyala: `cp .env.example .env.local`

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/seosuite_db"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generate-a-random-secret"
RATE_LIMIT_STRATEGY="redis"
REDIS_URL="redis://localhost:6379"
NEURONWRITER_API_KEY="..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Build & Deploy

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
npm start
```

## İşletim

- Worker'ı ayrı bir process olarak çalıştır: `node dist/worker.js` (yakında eklenecek).
- Stripe webhook endpoint'i: `POST /api/v1/billing/webhook`.
- Health check: `GET /api/v1/health`.

## Önemli Notlar

- Redis yoksa `RATE_LIMIT_STRATEGY=memory` kullanılabilir ancak production'da önerilmez.
- Playwright Chromium build sırasında otomatik indirilir; sunucuda ekstra disk alanı gerektirebilir.
