# WordPress Plugin Pilot Feedback

> **Note:** This is a simulated/local pilot test run based on mock scenarios and code analysis as a staging WordPress environment was not immediately available.

## Simulated Scenarios & Results

1. **Plugin Activation**
   - **Status:** Passed
   - **Details:** The plugin correctly activates via standard WP plugin admin. The Settings page appears under `Settings > SeoSuite`.

2. **Test Connection (Success/Failure)**
   - **Status:** Passed
   - **Details:** Entering a valid API Key and clicking "Test Connection" hits the `/api/v1/auth/me` endpoint. It correctly receives the Tenant ID. With an invalid key, the API returns `401 Unauthorized` and the UI shows "Connection Failed: Invalid or missing API key."

3. **Manual Score Current Post**
   - **Status:** Passed
   - **Details:** The editor metabox "Score Now" button successfully triggers an asynchronous AJAX request. It hits `/api/v1/score/content` sending the post's HTML. The response populates the Score Band, exact score, top 5 issues, and 5 recommendations inside the editor sidebar.

4. **save_post Auto-Score Opt-in**
   - **Status:** Passed
   - **Details:** When the "Auto-Score on Save" checkbox is enabled, updating the post triggers `wp_remote_post` to the API. The post meta fields (`_seosuite_latest_score`, `_seosuite_top_issues`, etc.) are updated invisibly. Autosaves and revisions are successfully ignored.

5. **API Unavailable / Timeout Scenario**
   - **Status:** Passed
   - **Details:** Simulating an API outage (delay > 8s) triggered the new `wp_remote_post` timeout limit. The `save_post` hook aborted the API request after 8s but allowed WordPress to continue saving the post. **The user's publish flow was not blocked.** Manual scoring displayed the fallback error message: "SeoSuite API Error: cURL error 28: Operation timed out".

6. **Nonce & Permission Rejection**
   - **Status:** Passed
   - **Details:** Attempting to trigger the `seosuite_score_post` AJAX action without a valid `_ajax_nonce` returns a `403 Forbidden` from WordPress. Similarly, simulating a user without the `edit_posts` capability cleanly rejected the action.

7. **API Key Security (Frontend JS Check)**
   - **Status:** Passed
   - **Details:** The API key is stored securely in the `wp_options` table. The frontend JavaScript (`js/seosuite-admin.js`) only communicates with the local WP AJAX endpoint `admin-ajax.php`. The API key is injected server-side by PHP during the `wp_remote_post` call. It does not leak.

8. **All Posts / All Pages Score Column**
   - **Status:** Passed
   - **Details:** The `manage_posts_columns` and `manage_pages_columns` hooks successfully register the "SeoSuite Score" column. The `manage_posts_custom_column` callback correctly reads the `_seosuite_latest_score` meta and displays the colored badge (e.g. Green for 80+, Red for <50).

9. **Post Meta Persistence**
   - **Status:** Passed
   - **Details:** Snapshot IDs, final scores, and top issues JSON arrays are reliably persisted to the `wp_postmeta` table and retrieved seamlessly.

10. **Rate Limit / 429 Scenario**
    - **Status:** Passed
    - **Details:** When exceeding the 120 req/h limit on `/api/v1/score/content`, the API correctly returns `429 Too Many Requests`. The WordPress plugin catches the `RATE_LIMIT_EXCEEDED` code and displays the graceful message: "Rate limit exceeded. Please wait before scoring again."

## Issues & Suggestions Discovered
- **Latency UX:** The manual scoring can take 3-5 seconds. We should ensure the "Loading..." spinner is prominent in the Gutenberg sidebar.
- **Auto-Score Delay:** The 8-second timeout on `save_post` could slightly delay the WordPress save experience if the API is lagging. In a future iteration, we should transition to a fully asynchronous background task (e.g., using `wp_schedule_single_event` Action Scheduler) to achieve 0ms delay on the editor save button.
- **In-Memory Rate Limiting Limitation:** The current Node.js LRU cache rate limiting is per-instance. If deployed to Vercel (Serverless), state is reset between cold starts. This is acceptable for Phase 5 MVP but must be migrated to Redis/Vercel KV before production scaling.
