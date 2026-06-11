# SeoSuite Dogfooding Guide

The dogfooding script (`scripts/dogfood.ts`) is designed to run the scoring engine against a configurable list of live URLs to ensure stability, calibrate scoring weights, and detect false positives/negatives.

> [!WARNING]
> **Internal Use Only:** Dogfooding results are for internal calibration only and should not be used as customer-facing reports.

## Configuration

1. **URL List:** The script reads URLs from `dogfood-urls.json` in the project root. If this file is missing, it falls back to the `DOGFOOD_URLS` environment variable (comma-separated).
2. **Mock Integrations:** The script automatically generates a local Tenant, an API key, and a mock NeuronWriter integration to test the full pipeline.

## Running the Script

Ensure your local Next.js dev server is running on port 3000:

```bash
npm run dev
```

In a separate terminal, execute the script:

```bash
npx tsx scripts/dogfood.ts
```

## Outputs

- **`dogfood-report.json`**: The complete raw JSON output for all processed URLs, including exact module scores and evidence objects.
- **`dogfood-summary.md`**: A markdown table summarizing the run (Final Score, Top Issues, AI Readiness, Provider Enrichments).

## Calibration

Review the output in `docs/calibration-report.md`. When dogfooding flags a false positive (e.g., heavily penalizing a short landing page or a documentation site), update the heuristic thresholds in `src/lib/scoring/modules/` and re-run the dogfood batch to verify the fix.
