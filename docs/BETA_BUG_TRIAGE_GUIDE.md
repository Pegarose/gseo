# Closed Beta Bug Triage Guide

As feedback forms roll in during the Closed Beta, use this guide to categorize, prioritize, and action reported bugs and issues.

## 1. Bug Severity Levels
- **P0 (Critical):** White-screens WordPress, deletes data, exposes API keys, or blocks the fundamental `save_post` publishing flow. **Action: Immediate Rollback & Hotfix.**
- **P1 (High):** API returns 500s consistently, score UI is completely broken or unreadable, or severe false positives destroy user trust (e.g., scoring a perfect article a `10/100`). **Action: Fix before expanding Beta.**
- **P2 (Medium):** Minor false positives (e.g., complaining about image alt text when an image is purely decorative), annoying UX quirks, or rate-limit messages appearing too frequently. **Action: Batch into the next scheduled patch.**
- **P3 (Low):** UI copy typos, slight color mismatch in badges, or edge-case scoring nuances. **Action: Backlog for future sprints.**

## 2. SEO False Positive / False Negative Triage
Heuristic scoring engines will inevitably disagree with edge-case reality.
- **Is it a False Positive?** (The engine flags an error, but the SEO Specialist says it's fine).
  - *Triage:* Log the `pageType`, `wordCount`, and specific rule. If >3 similar reports occur, adjust the threshold in the scoring module (e.g., change word count minimums).
- **Is it a False Negative?** (The engine says it's perfect, but the SEO Specialist sees a glaring missing H1).
  - *Triage:* Verify the WordPress HTML output. Often, the theme generates the H1 dynamically, and the basic HTML parser misses it. If so, document it as a "Headless Rendering Limitation" to be fixed in Phase X.

## 3. Plugin Bug Triage
- **Issue:** Editor UI looks broken.
  - *Triage:* Check for CSS conflicts with other plugins or custom WordPress themes. Namespace CSS selectors more strictly.
- **Issue:** Autosave triggering scores and hitting rate limits.
  - *Triage:* Verify `DOING_AUTOSAVE` checks in `seosuite-connector.php`.

## 4. API Bug Triage
- **Issue:** Timeouts (`cURL error 28`).
  - *Triage:* Check Next.js server logs for long-running processes or database locks. Consider increasing the Vercel/Node function memory limit.
- **Issue:** 429 Rate Limits appearing too often.
  - *Triage:* If a single editor editing heavily hits the 120/hr limit, consider bumping the tenant limit or implementing a queueing system.

## 5. Security Issue Triage
- **Issue:** User without permissions sees the scoring box.
  - *Triage:* Validate `current_user_can('edit_posts')` checks on metabox registration and AJAX endpoints. P0 priority.
- **Issue:** API key leaked in browser network tab.
  - *Triage:* P0 priority. Ensure all API calls are strictly routed through the PHP backend (`wp_remote_post`).

## 6. Fix Now vs. Fix Later Decision Criteria
- **Fix Now:** Any P0/P1 issue, or any P2 issue that makes editors actively hate using the tool (e.g., high-frequency noisy alerts).
- **Fix Later (Phase X):** Anything requiring JavaScript execution (Headless Playwright), complex cross-site dashboards, billing, or minor P3 UI copy tweaks.
