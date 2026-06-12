# GSeoSuite End-to-End Demo Flow Guide

This document describes the step-by-step validation flow for testing the full lifecycle of GSeoSuite—from platform administration down to customer dashboards and client content scoring integrations (WordPress and Next.js / EfesusStone).

---

## Flow 1: Super Admin Quota Control & Dashboard Sync

This flow demonstrates how platform administrators manage tenant packages and how changes instantly propagate to client dashboards.

### Step 1.1: Accessing Super Admin Console
1. Ensure the postgres database docker container is running: `docker compose up -d`.
2. Start the development server: `npm run dev` (running on port `3001` or custom port `3000`).
3. Navigate to: `http://localhost:3000/super-admin` in your browser.
4. If prompted with the security gate, enter the token: `gseo_admin_secret_token` (default fallback for development/demo mode).

### Step 1.2: Modifying Tenant AI Credit Limit
1. In the Super Admin navigation, click on **"Kiracılar"**.
2. Locate the default seed tenant: **"GMedya Dogfooding"** (slug: `gmedya`). Click **"Düzenle"**.
3. Under the **"Kotalar ve Destek Günlüğü"** card:
   - Change the Subscription Plan from **Agency** to **Professional**.
   - Modify the **Aylık AI Kredi Limiti** to `250` (or `0` for unlimited).
   - Enter a note in the **Destek Günlüğü** (e.g., *"Müşteri paketi Pro sürümüne düşürüldü, limit 250 olarak güncellendi."*).
4. Click **"Limitleri Kaydet"**.

### Step 1.3: Confirming Live Sync on Tenant Dashboard
1. Open a new tab and navigate to the customer dashboard: `http://localhost:3000/dashboard`.
2. Look at the **"Aylık AI Analiz Kredisi"** KPI card.
3. Confirm that:
   - The credit bar shows the updated limit (e.g., `45 / 250`).
   - If you set it to `0` or undefined, it gracefully renders `45 / Sınırsız` or `45 / Kota tanımlanmadı`.
   - The progress bar percentage is correctly computed and turns orange/warning when >80% is reached.

---

## Flow 2: WordPress Connector Plugin Integration

This flow validates the WordPress metabox and scoring connection with the GSeoSuite API.

### Step 2.1: Plugin Installation
1. Locate the pre-built plugin zip at `dist/seosuite-connector.zip`.
2. Install it in a local WordPress development instance.
3. Go to **SeoSuite Settings** inside the WordPress admin page.
4. Input the configuration details:
   - **API Base URL:** `http://localhost:3000/api/v1`
   - **API Key:** Use the API key generated for the tenant (default seed tenant API key prefix: `gseo_live_269c`).
   - **Site ID:** Retrieve the Site ID from the database or dashboard sites page.

### Step 2.2: Test Connection
1. Click **"Test Connection"** on the plugin settings page.
2. Confirm the successful connection message: `"✅ Connection Successful! Target tenant: <tenant-id>"`.

### Step 2.3: Metabox Scoring Flow
1. Open any post or page in the WordPress Editor.
2. The **"SeoSuite Analysis"** metabox is visible in the sidebar.
3. Click **"Score Now"**.
4. The plugin triggers an AJAX post to `/api/v1/score/content` transmitting the post HTML, URL, and meta title.
5. The GSeoSuite scoring engine parses the content, runs semantic coverage checks, and registers the score snapshot.
6. The metabox automatically reloads and displays:
   - The final score (e.g., `82/100`) colored according to the score band.
   - The top critical issues found.
   - Actionable "Quick Wins".

---

## Flow 3: Next.js / EfesusStone Content Scoring Integration

This flow validates the client adapter used by Next.js applications to score drafts before publishing.

### Step 3.1: Environment Check
1. The Next.js project contains the file `lib/seosuite/client.ts`.
2. Ensure `.env` includes:
   ```env
   SEOSUITE_API_URL="http://localhost:3000/api/v1/score/content"
   SEOSUITE_API_KEY="gseo_test_..."
   SEOSUITE_SITE_ID="site-uuid-..."
   SEOSUITE_MOCK=false
   ```

### Step 3.2: Execution and Error Handling
1. When saving or editing a blog post on the EfesusStone CMS, the handler triggers `analyzeContent(...)`.
2. The adapter constructs a fully valid HTML wrapper mimicking the Next.js shell layout (canonical, og tags, JSON-LD article schema, H1 tags, body paragraphs).
3. If the GSeoSuite API is active, the adapter receives the `ScoreSnapshot` and parses the findings, automatically translating English API codes (e.g. `CANONICAL_MISSING`) into user-friendly Turkish descriptions.
4. **Fail-safe confirmation:** If `SEOSUITE_MOCK=true` or if the API is down, the adapter catches the exception, logs it, and returns a mocked or failed status gracefully. **The main WordPress/Next.js save process never crashes.**

---

## Flow 4: API Rate Limiting (429) & Quota Checks

1. The API endpoints check rate limits per hour based on the client IP or tenant ID (`src/lib/utils/rate-limit.ts`).
2. When the request count exceeds the limit (e.g. `60 req/hour` for `/score/url`), GSeoSuite responds with `HTTP 429 Too Many Requests`.
3. The response headers correctly return:
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining` (reaches `0`)
   - `X-RateLimit-Reset`
4. The client integrations (WordPress/Next.js) capture the `429` status code and render a polite message instead of failing silently: *"Take a breath! You've scored too many pages recently. Please wait a moment."*
