# Dashboard MVP Notes

This document captures the implementation details, architectural boundaries, and known limitations of the Phase 1 GSeoSuite Dashboard MVP.

## 1. Architectural Role: Tenant / Customer Panel
The dashboard located at `/dashboard` is strictly a **Tenant/Customer Panel**. It is intended for end-users, agency clients, and SEO editors.
- **Super Admin Separation:** Super Admin functionality is completely out of scope. Provider management (e.g. NeuronWriter routing), master API key management, cross-tenant statistics, global billing, and platform-wide usage metrics are not shown here.
- **BYOK (Bring Your Own Key):** BYOK is not supported in this tenant panel. All integrations are managed on the server side by the platform provider.
- **White-Labeling:** The customer-facing UI is fully white-labeled. Banned words like "NeuronWriter", "Master API key", "Provider router", "Super Admin", and "All tenants" must never appear. Instead, client-friendly terms like "Aylık AI Analiz Kredisi" and "AI Visibility Readiness" are used.

## 2. Authentication (Mock Mode)
The dashboard currently relies on a **Mock Auth** approach to accelerate UI/UX development.
- **Environment:** Requires `DASHBOARD_DEMO_MODE=true`.
- **Tenant Scope:** If `DASHBOARD_MOCK_TENANT_ID` is defined, all queries are securely scoped to this Tenant ID.
- **Fallback:** If not defined, the system automatically falls back to the seed `gmedya` tenant ID to prevent crashes during local development.
- **Production Warning:** This dashboard *must not* be exposed to the public internet in its current state. A full Auth0 or NextAuth integration is required before client onboarding.

## 3. Server Actions & Data Fetching
- All database interactions are centralized in `src/app/dashboard/actions.ts` and are strictly scoped to the active tenant ID to prevent cross-tenant data leaks.
- Prisma client is exclusively used server-side (`use server`), ensuring no database credentials or API keys leak to the browser.

## 4. Quota & Credit System (Mocked)
- **Aylık AI Analiz Kredisi (Monthly AI Analysis Credits):** Currently, the credits are mocked to show `{ used: 45, limit: 500 }`.
- **Warning thresholds:** The progress bar turns to an orange warning state above 80% usage and a red critical state above 100%. If the limit is 0 or undefined, the UI must fallback gracefully (e.g., width 0%, showing `/ ∞` or similar) without breaking.
- **Future Integration:** A TODO comment has been placed in the action file. In future phases, these metrics will connect to `QuotaUsage` tables and subscription tier packages.

## 5. AI Visibility Disclaimer
- AI Visibility readiness metrics are indicators based on content structure, entity clarity, and citation-friendly formatting. They **do not guarantee** actual visibility or citations in AI platforms (like ChatGPT or Perplexity).
- A disclaimer banner detailing this restriction is displayed prominently on the AI Visibility page.

## 6. UI/UX Decisions
- **Framework:** Custom Tailwind CSS components. No heavy component libraries like Shadcn were used to keep the bundle size small and maintain full control over the markup.
- **Icons:** `lucide-react` was integrated for clean, modern SVG iconography.
- **Aesthetics:** Focused on a "Modern B2B SaaS" look. Light mode default, with indigo/purple/blue primary colors. Information density and readability were prioritized.

## 7. Pending Features (Mocked in UI)
Several buttons and modules exist in the UI for demonstration purposes but do not execute real logic:
1. **Run Site Audit:** The "Run Site Audit" button on the site details page is tagged as "Coming Soon". True site-wide crawling requires a queue system, sitemap parsing, and rate-limiting infrastructure (Phase 4).
2. **AI Fixer:** The "Fix with AI" modal is a UI prototype. Generating the fix works via a `setTimeout` simulation, but the "Apply to CMS" button is disabled. CMS write-backs require API negotiation, permissions, and rollback capabilities.
3. **Generate New Key:** The API key management on the settings page is read-only.
