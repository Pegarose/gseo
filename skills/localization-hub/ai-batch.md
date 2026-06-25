# AI Batch Localization

## Goals

- translate selected keys into one or more target locales
- support new-language bootstrap
- create machine translations that require review

## Default Flow

1. Filter missing or stale keys.
2. Select target locales.
3. Generate batch record.
4. Produce `machine` translations.
5. Mark `needs_review = true`.
6. Publish only after manual review.

## Safety

- preserve placeholders such as `:name`, `%TOTAL%`, `{count}`
- preserve markup when `format` is `html` or `markdown`
- translate slugs with slug-specific prompts
- never mutate Turkish source automatically