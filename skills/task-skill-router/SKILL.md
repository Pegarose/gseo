---
name: task-skill-router
description: >
  Classifies tasks by weight and maps to installed skills via skill-routing-matrix.json.
  Default UX is Execution Intent + Confirm (session-start.md). Full Skill Plan table only
  when user chooses plan_first, asks for a plan, or maintainer runs prismx route --verbose.
---

# Task Skill Router

## When to trigger

- User chose **`plan_first`** in Confirm step
- User says: `skill plan`, `hangi skill`, `which skill`, `önce plan`, `plan_first`
- Maintainer runs `prismx route --verbose` (CLI parity)
- **Multi-item** backlog work needing visible breakdown before approval

**Skip** (silent `prismx-skill-gateway` + Execution Intent only) when:

- User chose **`apply_now`** or **`analyze_only`**
- Single **light** subtask with clear scope
- User says "just do it" / "hemen uygula"

## Classification algorithm (mandatory order)

1. **Split** compound requests into subtasks
2. For each subtask, evaluate **heavy → medium → light** using [`.prismx/AGENT.md` Complexity Router](AGENT.md) and [`.prismx/skill-routing-matrix.json`](../skill-routing-matrix.json)
3. **Heavy** if any: new module, ~10+ files, architecture decision, schema design, 3rd-party integration
4. **Medium** if any: 3+ files, new endpoint/route, migration, security domain, ambiguous scope
5. **Light** only if ALL: 1–3 files, no security/architecture, clear scope
6. **Default when unsure:** medium (never under-classify)
7. **Overall weight** = `max(subtasks)`; **2+ subtasks** → overall min medium

### Evidence signals (quick scan before classifying)

| Signal | How | Effect |
|--------|-----|--------|
| `estimated_files` | TODO count, grep, user list | ≥10 heavy, ≥3 medium |
| `security_keywords` | matrix `classification.security_keywords` | min medium |
| `task_type` | keyword match in matrix | default weight + skills |
| `rules_domain` | task touches `rules/testing.md` etc. | see matrix `rules_domain_map` |
| `ambiguity` | 2+ valid interpretations | min medium → consider `prompt-enhancer` first |
| `resolver_order` | matrix precedence list | provider tie-break / fallback order |
| `rules_domain_map.weight_min` | per-domain minimum weight | prevent weak domain false positives |

Always fill **Reason** column with concrete evidence when producing a table.

## Skill matching

1. Load [`.prismx/registry.json`](../registry.json) — only suggest **installed** skills
2. Match subtask keywords → `skill-routing-matrix.json` → `task_types`
3. If task touches a domain in `./rules/` → add skills from `rules_domain_map`
4. Missing skill → fallback from gateway + `prismx skill add <name>`

## Default output (most tasks) — Execution Intent

Per `session-start.md` and `GUNLUK.md`:

```
Intent: ...
Capability: ...
Resolution: ...
Memory: ...
Plan: ...
Confirm: ...
Options: apply_now | plan_first | analyze_only
```

Do **not** emit a Skill Plan table unless user chose `plan_first` or explicitly asked.

## Skill Plan table (plan_first / verbose only)

```markdown
## Skill Plan

**Request:** <user text>
**Overall weight:** 🟡 Medium | 🔴 Heavy

| # | Subtask | Weight | Reason | Primary skill(s) | Workflow | Status |
|---|---------|--------|--------|------------------|----------|--------|
| 1 | … | 🟡 | … | … | /forge | installed |

**Suggested order:** …
**Rules to read:** rules/testing.md (if applicable)
```

Wait for user approval before implementing 🟡/🔴 subtasks (unless emergency hotfix).

## After approval

1. Read each primary skill's `SKILL.md`
2. Read relevant `./rules/*.md` + `.prismx/rules/engineering-*.md`
3. Execute via `prismx-skill-gateway` silently for implementation
4. Update `.prismx/CURRENT_TASK.md` and HANDOFF at session end

## CLI parity

- `prismx route "<task>"` — Execution Intent + Confirm (default)
- `prismx route --verbose "<task>"` — Skill Plan table (debug)

## Integration with modular rules

If root `AGENTS.md` has a **Rules index** table, include matching `rules/*.md` under **Rules to read** when producing a Skill Plan table.

Global `.prismx/rules/engineering-*` always apply for coding tasks; never weakened by project `rules/`.
