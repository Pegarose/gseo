# Changelog

## [0.1.1-beta] - 2026-06-11
### Changed
- UX improvement: "Rate limit exceeded" error is now more user-friendly.
- UX improvement: Added "Score: " prefix to the admin list column badge for better clarity.
- UX improvement: Changed API error copy in metabox to "Analysis Unavailable" instead of exposing technical terms.

## [0.1.0-beta] - 2026-06-10
### Added
- Rate limiting handling. If the API returns a 429 Rate Limit Exceeded error, the plugin displays a friendly message to the editor without crashing.
- Connection testing now checks for `api_error` before proceeding.
- Added explicit versioning `0.1.0-beta` in preparation for internal pilot.

### Changed
- `wp_remote_post` timeout reduced from 15 seconds to 8 seconds to prevent blocking the WordPress editor for too long if the SeoSuite API is unreachable or slow.
- The `save_post` auto-score hook will silently fail and return early if an API error occurs, ensuring content is always successfully published/saved in the CMS.

### Security
- Verified strict nonce verification (`wp_create_nonce` and `check_ajax_referer`) on all AJAX endpoints.
- Verified capability checks (`current_user_can('edit_posts')`) on scoring actions.
- Plugin logic executed strictly on the backend via PHP; API keys are never exposed in frontend JS.
