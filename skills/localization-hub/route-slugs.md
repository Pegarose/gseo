# Route and Slug Localization

- Turkish is canonical source.
- Store slug translations in the translation hub under `domain=route`.
- Avoid hard-coded slug maps once DB-backed route translations are ready.
- Validate uniqueness per locale before publish.
- Keep redirect/canonical behavior explicit.

Suggested key examples:

- `public.pricing`
- `public.contact`
- `feature.press_room`
- `feature.media_database`