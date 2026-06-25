---
name: documentation-sync
description: >
  After significant code changes, finds stale documentation and updates README, API docs,
  .env.example, CHANGELOG, and wiki pages. PrismX adaptation (vibe-coder-kit, MIT).
---

# Documentation Sync

## When to trigger

After:

- Public API/route/CLI flag changes
- New or removed env variables
- Dependency add/remove affecting setup
- Major refactor changing module boundaries
- Feature merge before release

## Process

### 1. Identify changes

Review recent diff:

```bash
git diff main --name-only
git diff HEAD~1 --name-only
```

Categorize:

| Change | Docs to check |
|--------|----------------|
| API/routes | OpenAPI, README, wiki modules |
| Config/env | `.env.example`, wiki conventions |
| Dependencies | README setup, CHANGELOG |
| Architecture | `arch/v{N}/`, wiki modules, GRAPH_REPORT notes |
| User-facing behavior | `wiki/CHANGELOG.md`, module pages |

### 2. Audit stale content

For each affected doc, verify code still matches prose. Mark **stale** if not.

### 3. Update (priority order)

1. `.env.example` — new vars with comments
2. Root `README.md` — setup/run/test commands
3. `.prismx/wiki/CHANGELOG.md` — user-visible changes
4. `.prismx/wiki/modules/*.md` — touched modules
5. `.prismx/wiki/INDEX.md` — activity row
6. API/spec files if project uses them
7. Root `AGENTS.md` — if stack or domain rules changed

### 4. Report

```markdown
## Documentation Sync Report

**Trigger:** <commit/PR/feature>
**Updated:** <files>
**Still stale (needs human):** <files + reason>
**Skipped:** <generated-only or out of scope>
```

## Rules

- Do not invent features not in code.
- Prefer small accurate edits over large rewrites.
- If unsure whether behavior is public API → ask user.
- Pair with `knowledge-base-update` when doc change reflects a new gotcha or decision.

## PrismX integration

- Session end: `AGENT.md` already requires CHANGELOG + module wiki — this skill is the **diff-driven audit** before that step.
- Use `verification-before-completion` before marking docs task done.
