# Staging Pilot Setup Checklist

If you are running the Phase 6 Live/Staging Pilot, follow this step-by-step guide to properly configure the environment and conduct the test.

## Prerequisites
- A staging WordPress instance (e.g., `staging.yourdomain.com`).
- The `dist/seosuite-connector.zip` package (version `0.1.0-beta`).
- A valid SeoSuite API Key generated from your Tenant dashboard.

## 1. Installation & Activation
- [ ] Go to **Plugins > Add New > Upload Plugin** in your staging WordPress admin.
- [ ] Upload `seosuite-connector.zip` and click **Install Now**.
- [ ] Click **Activate Plugin**.
- [ ] Ensure no fatal errors or "white screens of death" occur upon activation.

## 2. Configuration
- [ ] Navigate to **Settings > SeoSuite**.
- [ ] Enter the API Key and Site ID.
- [ ] Click **Save Settings**.
- [ ] Click **Test Connection** and verify it returns a green success message (validating the `auth/me` endpoint).

## 3. Manual Scoring Test
- [ ] Open an existing post or page that is representative of your content.
- [ ] Locate the **SeoSuite Analysis** metabox in the sidebar.
- [ ] Click **Score Now**.
- [ ] Verify the score loads within 5-8 seconds.
- [ ] Verify the Score Band, Exact Score, Top Issues, and Recommendations render cleanly in the UI.

## 4. Auto-Score Test
- [ ] In the SeoSuite metabox, check the **Auto-Score on Save** option.
- [ ] Make a minor text edit to the post.
- [ ] Click the native WordPress **Update** button.
- [ ] Refresh the page and verify the SeoSuite score was updated in the background.

## 5. List View & UX Test
- [ ] Navigate to **Posts > All Posts**.
- [ ] Verify the new **SeoSuite Score** column is visible.
- [ ] Verify the score badge colors match expectations (Green for Good, Red for Poor).
- [ ] Do the same for **Pages > All Pages**.

## 6. Resilience Testing (Optional but Recommended)
- [ ] Temporarily change your API Key to an invalid string in the Settings.
- [ ] Attempt to save a post with Auto-Score enabled.
- [ ] Verify the post still saves successfully without WordPress throwing a fatal error.
- [ ] Restore the valid API Key.

## 7. Feedback Collection
- Review the `docs/LIVE_PILOT_FEEDBACK.md` document and populate it with the results, noting any false positives, confusing UI copy, or latency issues.
