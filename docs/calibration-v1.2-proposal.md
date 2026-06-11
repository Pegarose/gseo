# Calibration v1.2 Proposal

Based on the expanded dogfooding dataset of 14 representative URLs across various page types and platforms, here is the calibration analysis and proposed heuristic adjustments for SeoSuite v1.2.

## 1. False Positives & False Negatives

**False Positives (Over-penalization):**
- **Documentation Sites (`nextjs.org/docs`, `react.dev`):** Got penalized for `SEMANTIC_GAP_DETECTED` and `TARGET_KEYWORD_NOT_IN_TITLE`. Documentation often uses brief, context-heavy titles (e.g., "Routing", "Components") rather than forcing full SEO keyword strings like "Next.js Documentation Routing".
- **Product Pages (`wordpress.org/plugins/...`):** Flagged for `INTRO_MISSING_OR_WEAK`. Product pages often lead with a hero image, price, and "Add to Cart" button rather than a classic 100-word introductory paragraph.
- **CSR Architecture (`apple.com`):** Scored critically low (38) with `MAIN_CONTENT_EMPTY` and `TITLE_MISSING`. Apple heavily relies on JavaScript for scroll-hijacking and 3D rendering. The raw HTML payload is essentially empty. This is a known limitation of non-headless scraping.

**False Negatives (Under-penalization):**
- **Bot Blocking (`nike.com/men/shoes`):** Returned `HTTP_4XX_DETECTED` (likely 403 Forbidden due to anti-bot protection). The engine continued scoring whatever generic error page HTML it received, resulting in a misleading score of 51 instead of halting with a fatal crawler error.

## 2. Proposed Threshold & Severity Adjustments (5 Rules)

1. **`TARGET_KEYWORD_NOT_IN_TITLE`**
   - *Current:* High Severity.
   - *Proposal:* Downgrade to **Medium Severity**. Keyword matching in titles is less critical in the era of semantic search, and enforcing exact match often results in spammy titles.
2. **`INTRO_MISSING_OR_WEAK`**
   - *Current:* Medium Severity, 100 words minimum.
   - *Proposal:* Lower threshold to **40 words**. Alternatively, change severity to **Low** for `product` and `landing` page types where concise hero copy is UX best practice.
3. **`HTTP_4XX_DETECTED` / Crawler Blocks**
   - *Current:* High Severity, continues scoring.
   - *Proposal:* Elevate to **Critical/Fatal Severity**. If a 403/404 is detected, the engine should short-circuit the remaining content checks and cap the final score to **0**, as search engines will drop the page from the index entirely.
4. **`MULTIPLE_H1`**
   - *Current:* Medium Severity.
   - *Proposal:* Downgrade to **Low / Info**. HTML5 semantic sectioning (`<article>`, `<section>`) permits multiple `<h1>` tags. We should only flag if they exist consecutively without section wrappers.
5. **`JSON_LD_INVALID`**
   - *Current:* High Severity.
   - *Proposal:* Keep High severity, but if the invalid JSON-LD is injected by a third-party script/tracker rather than the core CMS, demote to Medium. (Requires parsing `<script>` attributes).

## 3. PageType-Specific Logic Needs

Future engine iterations (v1.2+) must implement conditionals based on the `pageType` passed to the API:

- **`documentation`:** 
  - Skip `TARGET_KEYWORD_NOT_IN_TITLE`. 
  - Relax `DOM_SIZE_LARGE` thresholds, as documentation sidebars are inherently massive.
- **`product`:**
  - Skip `INTRO_MISSING_OR_WEAK`. 
  - Require `Product` or `Offer` Schema specifically, not just generic JSON-LD.
- **`category`:**
  - Increase the required internal linking thresholds (`NO_INTERNAL_LINKS`), as category pages must serve as routing hubs.

## 4. CSR vs SSR Risk Classification

**SSR (Server-Side Rendering / Static):** (e.g., `nextjs.org`, `vercel.com`, `wordpress.org`)
- *Risk Level:* Minimal. 
- *Behavior:* SEO engines receive the full DOM instantly. Accurate scoring.

**CSR (Client-Side Rendering):** (e.g., `apple.com`, traditional React SPAs)
- *Risk Level:* High.
- *Behavior:* Raw HTML only contains `<div id="root"></div>`.
- *Consequences in SeoSuite v1.1:* 
  - `MAIN_CONTENT_EMPTY` (Critical)
  - `TITLE_MISSING` (Critical)
  - `NO_INTERNAL_LINKS` (High)
- *Next Steps:* In Phase 4 (Headless Execution Spike), we must introduce an `options.useHeadless` flag. If the user passes `useHeadless: false` but we detect an empty body with a massive JS bundle, we should throw a specific `CSR_DETECTED_WARNING` informational signal rather than punishing the score blindly.
