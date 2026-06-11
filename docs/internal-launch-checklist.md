# SeoSuite Internal Launch Checklist (Phase 3)

Before releasing the SeoSuite engine for broader internal pilot use (or dogfooding with actual client sites), the following checklist must be validated.

## 1. API Readiness
- [x] POST `/score/url` handles standard SSR/HTML payloads successfully.
- [x] POST `/score/content` safely parses arbitrary HTML fragments.
- [x] POST `/nw/enrich` returns deterministic mock data for testing.
- [x] SSRF Protection is active (DNS resolution, private IP blocking).
- [x] Rate limiting and payload size limits are enforced.

## 2. SDK Readiness
- [x] `gseo-client` handles API interactions securely.
- [x] Isomorphic TypeScript types (`ScoreUrlOptions`, `ScoreContentOptions`) are correctly exported and align exactly with the API.
- [x] SDK never exposes `GSEO_API_KEY` to client-side bundles (verified in `/dev/example` Server Actions).

## 3. WordPress Connector Readiness
- [x] Plugin installs cleanly via standard `.zip` upload.
- [x] `manage_options` enforces security on the Settings page.
- [x] Test Connection AJAX returns exact tenant validation.
- [x] Auto-score hook uses non-blocking HTTP requests (`wp_remote_post`), ensuring WP Post Publish is never halted by an API timeout.
- [x] Metabox displays the most recent cached score via Post Meta (`_seosuite_latest_score`).

## 4. Security Checklist
- [x] Database credentials and API keys are hashed (`sha256` + prefix).
- [x] Nonces are strictly validated on all WP AJAX calls.
- [x] Dashboard `/admin/dashboard` is protected by `ADMIN_DASHBOARD_TOKEN` in production environments.

## 5. Documentation Checklist
- [x] `API_EXAMPLES.md` is complete with cURL snippets.
- [x] `SDK_USAGE.md` illustrates secure Server Action usage.
- [x] `WORDPRESS_PLUGIN_SETUP.md` guides the installation flow.
- [x] `README.md` clearly states all disclaimers.

## 6. Known Limitations
1. **No Headless Rendering (Yet):** CSR applications (like SPAs built with React, Angular, Vue without SSR) will be scored poorly due to empty initial HTML payloads (`MAIN_CONTENT_EMPTY`). Do not test pure CSR apps without noting this limitation.
2. **Provider Mocking:** NeuronWriter enrichments are hard-coded mocks. Do not present the "Semantic Gap" keyword suggestions to a client as real live SERP data.
3. **AI Visibility Guarantees:** AI Visibility is purely heuristic readiness. It cannot predict actual ranking placement inside ChatGPT/Perplexity.

## 7. Go / No-Go Criteria

**GO Condition:**
- All checkboxes above are green.
- Next.js build (`npm run build`) completes with zero type errors.
- Internal team understands that AI Visibility and NeuronWriter features are in "readiness" and "mock" states respectively.

**NO-GO Condition:**
- If the target client heavily uses a pure CSR SPA. (Hold until Phase 4 Headless Rendering).
- If the client requires actual live competitor keyword gaps. (Hold until Phase 4 Provider Integration).
