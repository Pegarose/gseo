# SeoSuite - API-First SEO & AI Visibility Platform (Phase 0)

SeoSuite is a multi-tenant, CMS-agnostic SEO and AI visibility intelligence platform developed by GMedya. An advanced SEO scoring engine and developer platform that provides intelligent content auditing, API integrations, and actionable SEO insights.

> [!WARNING]
> **Important Notices:**
> - **Dashboard Authentication:** The current SaaS Dashboard runs in demo mode using `DASHBOARD_MOCK_TENANT_ID` (or a seed fallback). Dashboard demo mode is *not* production authentication. Real auth must be implemented before external customer access. Production environments should never expose dashboard routes without authentication.
> - **AI Visibility:** AI visibility metrics represent a readiness score based on structure, citations, and semantics. Visibility on ChatGPT, Perplexity, Google AIO, or Bing Copilot is *not guaranteed*.
> - **Provider Fallbacks:** The NeuronWriter integration may use mocked/fallback data for testing; this is not real production enrichment.
> - **Headless Rendering:** Evaluating Client-Side Rendered (CSR) apps via headless browsers (Puppeteer/Playwright) is currently out of scope for Phase 2.
> - **Dogfooding:** Any dogfooding results are for internal heuristic calibration and should not be used as customer-facing reports.

---

## Technical Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **HTML Parsing**: Cheerio

---

## Directory Structure
```text
/
├── prisma/
│   ├── schema.prisma         # PostgreSQL DB models & constraints
│   └── seed.ts               # Database seed script for tenant + API Key bootstrap
├── src/
│   ├── app/                  # Next.js App Router API & Routes
│   │   └── api/v1/           # REST endpoints (/health, /auth/me, /sites, etc.)
│   ├── lib/
│   │   ├── auth/             # API Key hashing and verification middleware
│   │   ├── db/               # Prisma client wrapper
│   │   ├── security/         # SSRF protection utilities
│   │   └── scoring/          # Scoring Engine Core & 7 Modules
└── docker-compose.yml        # Orchestration script for local PostgreSQL container
```

---

## Setup & Local Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [Docker & Docker Compose](https://www.docker.com/)

### Step 1: Clone and Install Dependencies
Install all required Node dependencies:
```bash
npm install
```

### Step 2: Launch local PostgreSQL via Docker
Run the PostgreSQL Docker container in the background:
```bash
docker-compose up -d
```
This container runs PostgreSQL 15 on port `5432` with database `seosuite_db`, user `seosuite_user`, and password `seosuite_password`.

### Step 3: Set Environment Variables
Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```
Ensure your `.env` contains:
```env
DATABASE_URL="postgresql://seosuite_user:seosuite_password@localhost:5432/seosuite_db?schema=public"
NODE_ENV="development"
APP_URL="http://localhost:3000"
GSEO_API_BASE_URL="http://localhost:3000/api/v1"
API_KEY_SECRET="seosuite_local_api_key_secret_key_minimum_32_characters"
ENCRYPTION_SECRET="00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff"
NEURONWRITER_API_KEY="local_test_neuronwriter_fallback_key"
```

### Step 4: Run Database Migrations
Deploy the Prisma schema models to your running local PostgreSQL instance:
```bash
npx prisma db push
```

### Step 5: Seed the Database & Generate Developer API Key
Run the database seeder to register the `GMedya` tenant, default administrator account, and generate your developer API key:
```bash
npx prisma db seed
```
*Note: Make sure to copy the printed `gseo_live_...` key from the terminal output, as it cannot be shown again.*

### Step 6: Start Next.js Development Server
Start the dev server:
```bash
npm run dev
```
The API is now available locally at: `http://localhost:3000/api/v1`

---

## API Documentation Quick Reference

All responses utilize standard JSON envelopes:

### Success Payload:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_uuid",
    "durationMs": 42
  }
}
```

### Error Payload:
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "details": {}
  },
  "meta": {
    "requestId": "req_uuid"
  }
}
```

### Testing the Endpoints
To test the health route:
```bash
curl http://localhost:3000/api/v1/health
```

To test the authenticated profile route:
```bash
curl -H "Authorization: Bearer YOUR_GENERATED_API_KEY" http://localhost:3000/api/v1/auth/me
```
