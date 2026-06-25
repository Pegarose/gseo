---
name: session-context-primer
description: >
  Optional session priming when HANDOFF is stale, user asks for full context, or a
  subagent starts cold. Loads HANDOFF, CURRENT_TASK, wiki, and rules; may output a
  short Context Loaded summary. Not required for normal chat-first sessions.
---

# Session Context Primer

## When to trigger

**Optional** — run when:

- HANDOFF `expires_at` is stale (>7 days) or user asks "where were we?"
- Picking up work after a long gap and chat needs a structured recap
- A subagent is spawned without prior context
- User explicitly asks for full project context

**Skip** when:

- Normal new chat with fresh HANDOFF — read HANDOFF + karpathy only (see `GUNLUK.md`)
- User gave a concrete task — go straight to Execution Intent + Confirm

## Step-by-step

### 1. Session memory (PrismX)

Read in order:

1. `.prismx/HANDOFF.md` — cross-session state (check `expires_at`, `locked_by`)
2. `.prismx/CURRENT_TASK.md` — today's focus (if missing, derive from HANDOFF or ask user)
3. `.prismx/DONE.md` — avoid re-proposing completed work
4. `.prismx/rules/karpathy-core.md` — P1–P4

### 2. Project map (only if task needs it)

1. Root `README.md` or `docs/README.md`
2. `.prismx/wiki/INDEX.md`
3. Relevant `.prismx/wiki/gotchas/` or `.prismx/wiki/decisions/` entries

### 3. Optional depth

- `.prismx/graph/GRAPH_REPORT.md` — architecture questions
- `.prismx/wiki/modules/{module}.md` — if task touches a known module
- Root `AGENTS.md` — project-specific overrides

### 4. Output (optional, keep short)

If useful, output a **brief** recap (not a mandatory table):

```markdown
**Context:** <project one-liner>
**Task focus:** <from HANDOFF/CURRENT_TASK>
**HANDOFF:** fresh | stale | locked
**Blockers:** <list or none>
```

Then proceed with **Execution Intent + Confirm** per `session-start.md`.

## Session end

Update `.prismx/CURRENT_TASK.md` with status and next steps. Merge critical items into `HANDOFF.md` per `AGENT.md` (HANDOFF ≤50 lines).

## Rules

- Do not block coding on this skill in normal sessions.
- If README contradicts wiki → flag conflict; do not silently pick one.
- Missing wiki knowledge → suggest `knowledge-base-update` at end of session.
