---
name: incident-response
description: >
  Structured production incident handling — classify severity, gather evidence, contain,
  fix, post-mortem. Use when production is down, error rates spike, or security is suspected.
  PrismX adaptation (vibe-coder-kit, MIT).
---

# Incident Response

## When to trigger

- Production outage or severe degradation
- Error rate spike above baseline
- Critical production bug report
- Suspected security breach or data leak
- Post-deploy regression

## Severity

| Level | Definition | Response |
|-------|------------|----------|
| P1 | Outage, data loss, security breach | Immediate |
| P2 | Major feature broken, many users | < 30 min |
| P3 | Partial degradation, workaround exists | < 2 h |
| P4 | Minor/cosmetic | Next sprint |

## Process

### 1. Open incident record

Create `.prismx/incidents/INC-YYYY-MM-DD-slug.md`:

```markdown
# Incident: <title>
**Started:** <UTC>
**Severity:** P<n>
**Status:** Investigating
**Commander:** <name or agent session>
```

### 2. Triage — evidence first

Checklist:

- User-visible symptom?
- Start time (logs/metrics, not guess)?
- Recent deploy/config/dependency change?
- Exact errors + stack traces?
- All users or subset?

Document under `## Evidence`. Follow `engineering-hygiene.md` for destructive commands.

### 3. Contain

- Bad deploy → rollback/revert first
- Feature flag off if available
- Rotate secrets if exposure suspected

Log every action with timestamp in incident file.

### 4. Root cause

Use 5 Whys — target **process gap**, not only immediate technical failure.

### 5. Fix

- Smallest change that resolves issue
- Add test that would have caught it
- Verify in staging when possible

### 6. Post-mortem (P1/P2 within 24h)

Complete incident file:

- Timeline (UTC)
- Root cause
- What went well / poorly
- Action items (owner, due date)

### 7. Knowledge persistence

Use `knowledge-base-update` → `gotcha` or `bug` entry in `.prismx/wiki/gotchas/`.

## Rules

- Contain before deep diagnosis.
- No blame — process gaps.
- Every P1/P2 → at least one action item.
- Do not declare resolved until verified (metrics + spot check).
- Update `.prismx/HANDOFF.md` if incident spans sessions.

## PrismX integration

- ULTRATHINK mode for auth/data/security incidents.
- `systematic-debugging` for technical investigation after containment.
- `dependency-audit` if CVE-related.
