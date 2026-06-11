# Release Candidate Checklist

Before deploying the `seosuite-connector.zip` to a production or live staging WordPress environment for the internal pilot, verify the following checklist.

## 1. Plugin Packaging & Versioning
- [x] Plugin header version is set to `0.1.0-beta`.
- [x] `CHANGELOG.md` is updated with the latest fixes.
- [x] `dist/seosuite-connector.zip` is freshly compiled via `npm run build-wp-plugin`.
- [x] No sensitive files (e.g., `.env`, `.git`) are included in the `.zip` archive.

## 2. API Production Hardening
- [x] Rate Limiting is active on all endpoints (`url`, `content`, `quota`, `sites`, `auth`, `nw`).
- [x] API properly returns `429 Too Many Requests` with `X-RateLimit-*` headers when exceeded.
- [x] `requestId` is systematically injected into every context and log payload.
- [x] Standardized `logApiError` and `logApiInfo` are in use, masking sensitive traceback data.

## 3. WordPress Safe Failure & Security
- [x] `wp_remote_post` timeout is strictly bounded (8 seconds) to prevent infinite UI loading.
- [x] `save_post` hooks are fully decoupled from fatal errors; API failures will never prevent a WordPress Post from being saved.
- [x] Nonces (`wp_create_nonce` / `check_ajax_referer`) are implemented for all AJAX routes.
- [x] Capability checks (`current_user_can('edit_posts')`) are enforced.
- [x] The `api_key` is securely persisted in `wp_options` and is strictly consumed server-side in PHP.

## 4. Documentation
- [x] `WORDPRESS_PLUGIN_SETUP.md` is up to date.
- [x] `WORDPRESS_PLUGIN_USER_GUIDE.md` is up to date and notes rate limiting.
- [x] `PILOT_ROLLBACK_PLAN.md` is prepared.

## Sign-off
**Status:** All checks passed. Phase 5 Release Candidate (`0.1.0-beta`) is ready for internal deployment.
