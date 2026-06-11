# Closed Beta Pilot Plan

This document outlines the scope, strategy, and logistics for the SeoSuite WordPress Connector Closed Beta. The goal is to rigorously test the `0.1.x-beta` plugin in real-world environments before scaling to a broader audience.

## 1. Pilot Scope
- **Target Environments:** 1-3 active staging or low-traffic production WordPress instances.
- **Content Pool:** Minimum of 20-30 varied content types (Homepage, Articles, Product pages, Landing pages).
- **Primary Goal:** Validate the UX of the plugin, the accuracy of the heuristic scoring engine, and the stability of the API.

## 2. Site Selection Criteria
- **Architecture:** Standard WordPress installations (Classic Editor or Gutenberg).
- **Traffic:** Non-mission-critical production sites or exact 1:1 staging replicas of high-traffic sites (e.g., GMedya or EfesusStone staging).
- **Exclusions:** Fully headless/CSR sites (until Phase X Headless rendering is available).

## 3. User Roles
- **Pilot Managers:** Oversee the installation, configure API keys, and monitor server/debug logs.
- **Content Editors / Writers:** Perform the day-to-day work, draft content, and interact with the SeoSuite metabox. They will provide the primary UX feedback.
- **SEO Specialists:** Review the generated scores and recommendations to validate the engine's accuracy against human SEO expertise.

## 4. Workflows to Test
1. **Plugin Activation & Setup:** Entering API keys and validating the connection.
2. **Manual Scoring:** Using the "Score Now" button in the editor sidebar.
3. **Auto-Scoring:** Validating background scoring upon clicking "Update/Publish" with the "Auto-Score on Save" option enabled.
4. **List View Monitoring:** Reviewing the colored score badges in the "All Posts" / "All Pages" lists.
5. **Failure Modes:** Observing how the plugin behaves during temporary API timeouts or rate limits.

## 5. Success Criteria
- **Stability:** Zero fatal PHP errors or site downtime attributed to the plugin.
- **Editor Adoption:** Editors find the side-panel UI intuitive and the "Quick Wins" actionable.
- **Engine Accuracy:** SEO Specialists agree with >80% of the recommendations provided by the engine.
- **Performance:** Scoring API latency remains consistently under 3 seconds.

## 6. Timeline
- **Week 1:** Setup, connection validation, and scoring of the first 10 historical posts.
- **Week 2:** Real-time drafting of new content using the auto-score feature.
- **Week 3:** Feedback aggregation and final Go/No-Go evaluation.

## 7. Risks & Mitigation
- **Risk:** High latency blocking WordPress saves.
  - *Mitigation:* The plugin has an enforced 8-second timeout.
- **Risk:** Engine produces noisy/false-positive recommendations.
  - *Mitigation:* `BETA_BUG_TRIAGE_GUIDE.md` directs teams to categorize and ignore false positives until the next engine patch.
- **Risk:** Rate limits exceeded by editors scoring too fast.
  - *Mitigation:* The plugin catches 429 errors and displays a friendly "Take a breath" message.

## 8. Feedback Collection Method
All participants (Editors and SEO Specialists) must submit their findings using the standardized `docs/BETA_FEEDBACK_FORM.md`. Completed forms will be aggregated by the Pilot Manager and triaged according to the `docs/BETA_BUG_TRIAGE_GUIDE.md`.
