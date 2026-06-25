# WordPress Plugin — Deferred (P4)

GSeoSuite intentionally ships **Next.js first**. The WordPress plugin is a separate milestone after `@seosuite/next` OSS v1 is stable on npm.

## Planned approach

- Same product logic as Next.js SDK
- Settings in `wp_options` via `WpSettingsAdapter` (not GSeoSuite Cloud DB)
- Admin UI parity using shared React components or PHP wrapper
- Pro features via `GSEO_API_KEY` + Cloud API (same as headless)

## Not in scope for current sprints

- PHP plugin bootstrap
- RankMath migration tool
- WooCommerce / ACF extensions

Track progress in [RANKMATH_ROADMAP.md](./RANKMATH_ROADMAP.md).
