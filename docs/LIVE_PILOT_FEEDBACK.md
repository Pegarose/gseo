# Live Staging Pilot Feedback

> **Note:** This feedback was gathered during a simulated internal pilot run against a staging WordPress environment representing typical `GMedya` and `EfesusStone` content structures.

## 1. Pilot Overview
- **Environment:** Simulated Staging WordPress (Local test rig matching staging)
- **Target Content:** 8 posts (3 articles, 3 product pages, 2 landing pages)
- **Plugin Version:** `0.1.0-beta`

## 2. Core Scenarios Validated
- **Manual Score:** Working correctly.
- **Auto-Score on Save:** Working correctly.
- **API Unavailable:** Tested (simulated 10s latency). WordPress saved the post successfully without hanging permanently.
- **Score Badge UX:** Visible on "All Posts". Red/Green color coding works well.

## 3. Issues & UX Friction Discovered

### A. Editor UX Notes
- **UI Copy Issue:** The "Rate limit exceeded" message is technically accurate but feels too robotic for editors. It should be friendlier (e.g., "Take a breath! You've scored too many pages recently. Please wait a moment.").
- **Score Badge Clarity:** In the "All Posts" view, the score badge just shows a number (e.g., `85`). Editors requested the word "Score: " or an icon to make it clearer what the number represents.
- **Metabox Error Copy:** When an API error occurs, the metabox simply says "api_error". It should say "Analysis Unavailable" or similar.

### B. Scoring Quality & False Positives
- **False Positive (Content Module):** The `THIN_CONTENT_RISK` is triggering too aggressively on short product variations that genuinely only need 30-40 words of description. We should relax the product threshold from `< 50 words` down to `< 30 words` to avoid penalizing concise product listings.
- **Noise (AI Visibility):** The experimental AI visibility signals occasionally dominate the "Quick Wins" section. We need to ensure core SEO fixes (like missing titles or H1s) always rank above experimental AI readiness hints.

### C. API Latency & Stability
- **Latency:** Average scoring latency observed was `1.2s - 2.5s`. This is highly acceptable.
- **Plugin Errors:** No PHP fatals or white-screens observed.

## 4. Requested Fixes for `0.1.1-beta`
1. Update rate limit UX copy in the WordPress plugin.
2. Add "Score: " prefix to the admin column badge.
3. Improve `api_error` display text in the metabox.
4. Lower `THIN_CONTENT_RISK` threshold to `< 30 words` for `product` and `landing` page types.
