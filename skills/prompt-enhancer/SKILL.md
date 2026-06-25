---
name: prompt-enhancer
description: >
  Transforms vague or incomplete user requests into precise, actionable prompts with
  scope, success criteria, and constraints. Use before brainstorming or implementation
  when the request is ambiguous. PrismX adaptation (vibe-coder-kit, MIT).
---

# Prompt Enhancer

## Philosophy

Answering the wrong question well is worse than clarifying first. Run this **before** `brainstorming`, `task-planner`, or `/forge` when input quality is low.

## Trigger signals

- Single vague sentence: "fix login", "make it faster", "clean up code"
- Multiple valid interpretations
- No success criteria or scope boundary
- Large scope with no phasing: "rebuild auth"

## Process

### 1. Classify request type

| Type | Example | Typical gaps |
|------|---------|--------------|
| Bug fix | Login broken | Repro steps, environment, error text |
| Feature | Add profile page | Users, fields, auth, design ref |
| Refactor | Clean up service | Which module, definition of clean |
| Performance | Speed up page | Which route, metric, baseline |
| Infra | Automate deploy | Which env, current pipeline |

### 2. Check six dimensions

```
[ ] WHAT  — exactly what changes
[ ] WHY   — problem being solved
[ ] WHO   — user/system affected
[ ] WHEN  — deadline or priority
[ ] HOW   — stack/constraints
[ ] DONE  — measurable completion criteria
```

### 3. Strategy

**Ask (≤3 questions)** when 1–2 critical unknowns block safe work.

**Assume and show** when speed matters — list every assumption explicitly and request confirmation.

### 4. Enhanced prompt output

```markdown
## Enhanced Prompt

**Original:** <user request>

**Clarified task:** <single interpretation>

**In scope:**
- …

**Out of scope:**
- … (with reason)

**Success criteria:**
1. …

**Constraints:** <stack, time, deps>

**Open questions:** <if any>

**Suggested next:** `brainstorming` | `task-planner` | `session-context-primer` | `/forge`
```

### 5. User approval

Show enhanced prompt. **Do not implement** until user confirms or corrects assumptions.

## Rules

- Max 3 clarifying questions per round.
- Always list out-of-scope explicitly.
- Route to `brainstorming` for new features; `systematic-debugging` for bugs with repro; skip enhancer for crystal-clear micro-tasks (typo, single-file rename).

## PrismX integration

- Check `.prismx/DONE.md` before expanding scope.
- Heavy/security tasks → note ULTRATHINK in enhanced prompt.
- After approval → hand off via `prismx-skill-gateway`.
