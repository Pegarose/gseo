---
id: audit
version: "1.0"
human_summary: Proje saglik kontrolu ve mimari drift tespiti
phases:
  - id: scan
    name: Scan
    skills:
      - audit
      - graph-analysis
    requires: []
    outputs:
      type: object
      properties:
        files_scanned:
          type: number
        issues_found:
          type: number
      required:
        - files_scanned
        - issues_found
      additionalProperties: false
  - id: analysis
    name: Analysis
    skills:
      - audit
      - probe
    requires:
      - scan
    outputs:
      type: object
      properties:
        critical:
          type: number
        warnings:
          type: number
        info:
          type: number
      required:
        - critical
        - warnings
        - info
      additionalProperties: false
  - id: report
    name: Report
    skills:
      - audit
      - spec-writer
    requires:
      - analysis
    outputs:
      type: object
      properties:
        report_path:
          type: string
        health_score:
          type: number
      required:
        - report_path
        - health_score
      additionalProperties: false
---

# /audit

You are the **AUDITOR**.

**Your mission**: Perform a comprehensive health check on the project, identifying architectural drift, over-coupled modules, stale documentation, and technical debt.

---

## CRITICAL: Read-Only Protocol

> [!IMPORTANT]
> `/audit` is **observation only**. You report findings but **never modify code or documents**.
> Fixes are handled by appropriate workflows (/change, /genesis, /forge).

---

## Step 1: Scope Determination

Ask user or auto-detect:
```
/audit              → Full audit (all checks)
/audit --security   → Security-focused
/audit --perf       → Performance-focused
/audit --debt       → Technical debt focused
/audit --drift      → Architectural drift only
/audit --wiki       → Documentation freshness only
/audit --registry   → Skill registry + workflow dependency checks only
```

---

## Step 2: Skill Registry & Workflow Dependency Health

> Read-only checks. Compare `.prismx/registry.json`, `.prismx/REGISTRY.md`, disk paths, and documented fallbacks.

1. **JSON validity**: Confirm `.prismx/registry.json` parses and contains `schema_version`, `model`, `status_values`, `core`, `recommended`, `optional`, `not_installed`, `project_added`, and `dependency_rule`.
2. **Core skill presence**: For each entry in `core`, verify `.prismx/skills/{name}/SKILL.md` exists.
   - If any core skill file is missing → flag as **🔴 Critical** (setup corruption).
3. **List vs disk drift**: For each skill in `recommended` or `optional`, if `project_added` is not used for that name, verify folder exists when the project claims it is installed; flag mismatches where narrative says "loaded" but `SKILL.md` is missing.
4. **Registry dual-source drift**: Spot-check that skill names in `registry.json` align with major sections of `.prismx/REGISTRY.md`. Flag unexplained contradictions.
5. **Workflow dependency coverage**: Cross-check `.prismx/wiki/conventions/workflow-dependencies.md` against workflow files when investigating drift or after skill additions.
6. **Unsafe mandatory wording**: Search workflows for language that requires a `not_installed` skill without an adjacent fallback (if found → **⚠️ Warning** or **🔴 Critical** depending on blast radius).

Record results in the audit report under **Skill Registry Health**.

---

## Step 3: Knowledge Graph Analysis

> Requires `.prismx/graph/graph.json` to exist. If not, suggest running `graphify .` first.

1. **God Node Analysis**: Run `graphify query "which modules have the most connections?"` 
   - Identify modules with > 10 dependencies (potential over-coupling)
   - Flag any module that is both a god node AND a git hotspot

2. **Community Health**: Check community cohesion scores from `GRAPH_REPORT.md`
   - Low cohesion communities may indicate poor module boundaries

3. **Surprising Connections**: Review cross-community edges
   - These often reveal hidden dependencies or architectural violations

---

## Step 4: Architectural Drift Detection

Compare `.prismx/arch/v{N}/` design documents against actual code:

1. **System Boundaries**: Does code structure match `ARCHITECTURE.md` system decomposition?
2. **Interface Contracts**: Do actual APIs match `SYSTEM_DESIGN/` definitions?
3. **ADR Compliance**: Are ADR decisions actually implemented as specified?
4. **Dependency Drift**: Are there dependencies not documented in ADR?

---

## Step 5: Documentation Freshness

1. **Wiki modules**: Check `git log` for each `.prismx/wiki/modules/*.md` — flag if > 30 days since last update
2. **CHANGELOG**: Check if latest entry is > 7 days old
3. **INDEX.md**: Verify "Last 5 Activities" is current
4. **Graph Report**: Check if `GRAPH_REPORT.md` is > 14 days old

---

## Step 6: Git Forensics

1. **Hotspot Analysis**: Files changed most frequently in last 30 days
2. **Churn Rate**: Files with high churn + high complexity = risk
3. **Coupling Pairs**: Files that always change together (hidden dependencies)

---

## Step 7: Generate Report

Save to `.prismx/arch/v{N}/AUDIT_REPORT.md`:

```markdown
# 🔍 Audit Report — {date}

## Summary
- **Health Score**: {A/B/C/D/F}
- **Critical Issues**: {count}
- **Warnings**: {count}
- **Suggestions**: {count}

## 1. Skill Registry Health
| Check | Result | Severity | Notes |
|-------|--------|:--------:|-------|
| `registry.json` parse + required keys | ✅/❌ | | |
| Core `SKILL.md` files exist | ✅/❌ | | |
| recommended/optional vs disk | ✅/❌ | | |
| REGISTRY.md vs registry.json | ✅/❌ | | |
| Workflow mandatory / fallback language | ✅/❌ | | |

## 2. Architecture Health
| Finding | Severity | Action |
|---------|:--------:|--------|
| {module} is a god node (15 deps) | ⚠️ Warning | Consider decomposition via /genesis |
| {API} doesn't match SYSTEM_DESIGN | 🔴 Critical | Fix via /change |

## 3. Documentation Freshness
| Document | Last Updated | Status |
|----------|:------------:|:------:|
| wiki/modules/campaign.md | 2026-04-15 | ⚠️ Stale |
| GRAPH_REPORT.md | 2026-05-01 | ✅ Current |

## 4. Git Forensics
| File | Changes (30d) | Complexity | Risk |
|------|:-------------:|:----------:|:----:|
| {file} | 12 | High | 🔴 |

## 5. Recommended Actions
| Priority | Action | Workflow |
|:--------:|--------|----------|
| P0 | Fix API drift in {module} | /change |
| P1 | Decompose {god-node} | /genesis |
| P2 | Update stale wiki pages | Manual |
```

Present key findings to user and suggest next actions.
