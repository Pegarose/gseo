---
name: knowledge-base-update
description: >
  Persists important learnings (decisions, gotchas, bugs, conventions) into the PrismX
  wiki so future sessions avoid repeated research. Use after significant discoveries.
  PrismX adaptation (vibe-coder-kit, MIT).
---

# Knowledge Base Update

## When to trigger

- Architectural or tech decision with non-obvious rationale
- Non-obvious bug fixed (root cause matters)
- Third-party API/env quirk discovered
- Project convention established (naming, folders, patterns)
- "We tried X; it failed because Y"

## Entry types → PrismX paths

| Type | Path | Examples |
|------|------|----------|
| `decision` | `.prismx/wiki/decisions/` | Stack choice, auth model |
| `research` | `.prismx/wiki/decisions/` | Investigation outcome |
| `convention` | `.prismx/wiki/gotchas/` or `wiki/conventions/` | Naming, folder rules |
| `gotcha` | `.prismx/wiki/gotchas/` | Env trap, API limit |
| `bug` | `.prismx/wiki/gotchas/` | Root cause + fix |

See `wiki/conventions/knowledge-entries.md` for frontmatter schema.

## Process

### 1. Pick slug

`YYYY-MM-DD-short-topic.md` or `topic-slug.md` under the target folder. Update existing file if same topic — do not duplicate.

### 2. Write entry (template)

```markdown
---
type: decision|convention|bug|gotcha|research
topic: Short title
date: YYYY-MM-DD
tags: [tag1, tag2]
sources: [file paths or URLs]
confidence: 0.85
status: active
---

## Summary
Bottom line in 1–2 sentences.

## Context
Why this came up.

## Finding / Decision
Specific content; code snippets if useful.

## Rationale
Why this over alternatives.

## Consequences
What to watch going forward.

## References
- …
```

### 3. Update indexes

- Add one line to `.prismx/wiki/INDEX.md` activity or relevant module page
- Append to `wiki/gotchas/INDEX.md` or `wiki/decisions/INDEX.md` if those index files exist (create with header if first entry)

### 4. Confirm

Tell user: file path, type, one-line summary.

## Rules

- Include **why** and rejected alternatives — not just "we use X".
- One atomic topic per file.
- Date mandatory.
- When in doubt, write it — redundant entry is cheaper than re-research.
- Do not duplicate full ADRs — link to `arch/v{N}/ADR/` when formal ADR exists; wiki entry is the quick agent-facing summary.

## PrismX integration

- Session start: `session-context-primer` scans these folders.
- Formal architecture → also `documentation-and-adrs` / `/change` when appropriate.
- Log significant ops in `wiki/CHANGELOG.md` if user-facing behavior changed.
