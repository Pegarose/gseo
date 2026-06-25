---
name: dependency-audit
description: >
  Scans project dependencies for vulnerabilities, outdated packages, and unused deps.
  Produces prioritized action report. Run before releases and periodically.
  PrismX adaptation (vibe-coder-kit, MIT).
---

# Dependency Audit

## When to trigger

- Before production release
- Monthly maintenance
- After public CVE affecting your stack
- Before onboarding new contributors

## Process

### 1. Detect ecosystems

| File | Tool |
|------|------|
| `package.json` | npm / pnpm / yarn audit |
| `composer.json` | composer audit |
| `requirements.txt` / `pyproject.toml` | pip-audit / poetry |
| `go.mod` | govulncheck |
| `Cargo.toml` | cargo audit |

Run applicable scanners for this repo only.

### 2. Security scan

Example (Node):

```bash
npm audit
pnpm audit
yarn audit
```

Capture critical/high findings with package name, path, advisory ID.

### 3. Outdated packages

```bash
npm outdated
composer outdated
```

Note major vs minor bumps — majors need changelog review.

### 4. Unused dependencies (optional)

Heuristic: dep not imported anywhere — flag for human review, do not auto-remove without confirmation.

### 5. Write report

`.prismx/audits/dependency-audit-YYYY-MM-DD.md`:

```markdown
# Dependency Audit — YYYY-MM-DD

## Summary
<n critical, n high, n outdated>

## Critical / High
| Package | Severity | Advisory | Suggested action |

## Outdated (major)
| Package | Current | Latest | Notes |

## Recommended actions
1. … (priority ordered)

## Skipped / N/A
<ecosystems not present>
```

### 6. Remediation

- Apply patch/minor security fixes when low risk
- Major upgrades → separate task with tests
- Document accepted risk with expiry date if deferring

## Rules

- Never upgrade all deps blindly in one commit.
- Run test suite after each security fix batch.
- Record accepted risks in wiki (`knowledge-base-update` → `decision`).
- Pair with `security-and-hardening` for app-level review.

## PrismX integration

- Release workflow: run before `shipping-and-launch`.
- CVE incident → also `incident-response`.
- Update `wiki/CHANGELOG.md` if dependency changes ship to production.
