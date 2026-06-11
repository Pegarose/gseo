# SeoSuite Scoring v1.2 Changelog

This changelog maps the calibration heuristic proposals from Phase 3 dogfooding to the actual rule implementations rolled out in Phase 4.

## 1. HTML5 Multiple H1 Adjustments
- **Proposal:** The `MULTIPLE_H1` penalty was causing false positives on HTML5 sites (like documentation) that use strict `<article>` or `<section>` tags.
- **Implemented Code:** `src/lib/scoring/modules/technical.ts`
- **Before Behavior:** Any page with more than one `<h1>` tag was penalized with a `-1` score deduction and a `low` severity issue.
- **After Behavior:** If `pageType === 'documentation'` OR the raw HTML contains `<article` / `<section`, the severity is downgraded to `info` and the score penalty is removed (`score -= 0`).
- **Reason:** To align with modern HTML5 semantic sectioning standards and prevent unfairly penalizing structured documentation sites.

## 2. Target Keyword Strictness on Documentation
- **Proposal:** Documentation pages rarely use exact keyword matching in their title tags, leading to unfair `TARGET_KEYWORD_NOT_IN_TITLE` penalties.
- **Implemented Code:** `src/lib/scoring/modules/semantic.ts`
- **Before Behavior:** Missing the exact keyword in the title triggered a `high` severity issue and a `-3` score deduction.
- **After Behavior:** If `pageType === 'documentation'`, the severity drops to `medium`, the penalty is reduced to `-1`, and the recommendation copy is softened.
- **Reason:** Documentation titles should remain concise (e.g., "Routing") rather than stuffed ("Next.js Routing Documentation Framework").

## 3. Thin Content Adjustments for Product & Landing Pages
- **Proposal:** Product pages and landing pages are highly visual and often feature less than 100 words of text, triggering massive "Thin Content" and "Missing Intro" penalties.
- **Implemented Code:** `src/lib/scoring/modules/content.ts`
- **Before Behavior:** Any page under 100 words triggered a `critical` `THIN_CONTENT_RISK` (-8 points). Missing the target keyword in the first 100 words triggered a `medium` `INTRO_MISSING_OR_WEAK` (-3 points).
- **After Behavior:** 
  - If `pageType === 'product'` or `landing`, the thin content threshold is lowered to `< 50 words`, severity drops to `medium`, and penalty is `-3`.
  - `INTRO_MISSING_OR_WEAK` drops to `info` severity with a `0` point penalty for these page types.
- **Reason:** E-commerce products and visual landing pages are structurally different from long-form articles. UX best practices (hero images, Add to Cart buttons) should not be penalized by SEO text heuristics.

## 4. CSR vs SSR Risk Classification
- **Proposal:** Distinguish between a page that is genuinely empty (`MAIN_CONTENT_EMPTY`) and a page that simply uses Client-Side Rendering (`JS_RENDER_RISK`).
- **Implemented Code:** `src/lib/scoring/modules/indexability.ts`
- **Before Behavior:** A short page with a JS mounting point (`id="root"`) triggered a generic `medium` `JS_RENDER_RISK` alongside a `STATIC_HTML_CONTENT_MISSING`.
- **After Behavior:** 
  - `JS_RENDER_RISK` was renamed to `CSR_RENDER_RISK` and downgraded to `info` severity (no independent score capping).
  - `STATIC_HTML_CONTENT_MISSING` was elevated to `high` severity.
  - `MAIN_CONTENT_EMPTY` remains `critical` and caps the score.
- **Reason:** To provide accurate architectural feedback to developers without crashing the score of a site simply because it uses React/Vue (though they are warned of indexability risks).

## 5. AI Visibility Core Score Isolation
- **Proposal:** Ensure experimental AI visibility signals do not drag down the core SEO score.
- **Implemented Code:** `src/lib/scoring/modules/ai-visibility.ts` & `engine.ts`
- **Before Behavior:** Handled correctly in v1.1, but verified in v1.2.
- **After Behavior:** AI Visibility remains a `maxScore: 5` module, emitting `experimental` or `info` severities which are excluded from the main `topIssues` array and do not trigger score caps.
- **Reason:** AI Visibility is a "readiness" metric, not a strict ranking guarantee. It should guide users, not penalize them.
