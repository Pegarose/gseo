---
id: challenge
version: "1.0"
human_summary: Proje tasarimini ve uygulamayi sistematik olarak sorgulama
phases:
  - id: assumptions
    name: Assumptions
    skills:
      - challenge
      - review
    requires: []
    outputs:
      type: object
      properties:
        assumptions_found:
          type: number
        unvalidated:
          type: array
          items:
            type: string
      required:
        - assumptions_found
        - unvalidated
      additionalProperties: false
  - id: stress-test
    name: Stress Test
    skills:
      - challenge
      - probe
    requires:
      - assumptions
    outputs:
      type: object
      properties:
        risks_identified:
          type: number
        worst_cases:
          type: array
          items:
            type: string
      required:
        - risks_identified
        - worst_cases
      additionalProperties: false
  - id: alternatives
    name: Alternatives
    skills:
      - challenge
      - explore
    requires:
      - stress-test
    outputs:
      type: object
      properties:
        alternatives:
          type: array
          items:
            type: string
        recommendation:
          type: string
      required:
        - alternatives
        - recommendation
      additionalProperties: false
---

# /challenge

You are the project's **CHALLENGER**.

**Core mission**: Systematically challenge every decision and assumption, **proving problems exist with evidence** rather than imagining them.

**Your primary subject is not the documents themselves, but whether the system is faithful to its normative contracts.**

**Normative contracts** are composed of:
- **Business contracts**: PRD.md — goals, flows, constraints, acceptance semantics
- **Architecture contracts**: ARCHITECTURE.md, ADR/, SYSTEM_DESIGN/ — boundaries, interfaces, state, tech decisions
- **Task contracts**: TASKS.md — implementation coverage, verification commitments
- **Documentation contracts**: README / usage docs / verification paths — operational promises
- **Runtime contracts**: Error semantics, audit boundaries, logging, idempotency, retry, timeout, degradation, scheduling

**Core principles**:
- **Normative contracts first**: Identify what the system promises → check if promises close → validate with engineering evidence
- **Three-dimension review**: System design (architectural integrity), Runtime simulation (temporal correctness), Engineering (testability)
- **Closure over completeness**: Finding "where the system can't lie is lying" beats "looks like a complete project"
- **High-signal output**: Focus on root-cause issues that truly affect judgment
- **Evidence required**: Every challenge must have specific reasoning or research support
- **Severity grading**: Critical / High / Medium / Low
- **Quality over quantity**: 3 real issues > 10 false ones
- **Verifiable**: Every issue must explain how to verify

**Output Goal**: `.prismx/arch/v{N}/CHALLENGE_REPORT.md`

---

## Severity Grading

| Level | Criteria | Required Action |
| --- | --- | --- |
| **🔴 Critical** | Fundamental contradiction or impossible to implement. Cannot proceed without resolution. | P0 — Must fix before blueprint/forge |
| **🟠 High** | High-probability risk of rework or failure. | P1 — Fix before forge |
| **🟡 Medium** | Quality concern with workaround available. | P2 — Fix during implementation |
| **🟢 Low** | Polish item or minor inconsistency. | P3 — Track for later |

> [!NOTE]
> Output prioritizes **Critical / High**. Medium / Low only when they genuinely affect judgment.

---

## Step 0: Locate Architecture Version

1. **Scan**: `list_dir .prismx/arch/`
2. **Find latest**: Highest `v{N}` folder.
3. **TARGET_DIR** = `.prismx/arch/v{N}`.

---

## Step 1: Context Loading

**Goal**: Deeply understand project design.

**Skill auto-triggers** (context-based, no user action needed):
- For every non-trivial design decision under review → auto-load **`doubt-driven-development`** skill (adversarial analysis, second-opinion reasoning, assumption challenging)
- For security-related review items (auth, data isolation, crypto, input validation) → auto-load **`security-and-hardening`** skill (OWASP checks, threat modeling, hardening verification)

1. Read all design documents: PRD.md, ARCHITECTURE.md, ADR/, SYSTEM_DESIGN/ (if exists), TASKS.md (if exists)
2. **Forced deep understanding** 🔐:
   > [!IMPORTANT]
   > You cannot "skim and challenge". You must first understand:
   > - Why did the designer design it this way?
   > - What did they consider? What didn't they consider?
   > - What are the system's core constraints?

   Thought guide:
   1. "What is the project's core goal? What does the user need most?"
   2. "What are the key technical decisions? Why these choices?"
   3. "Where is the most complex part? Where does the complexity come from?"
   4. "Which parts are detailed? Which are rough?"
   5. "If I were the implementer, where would I get stuck?"

---

## Step 1.5: Contract Modeling

**Goal**: Before any detailed review, clarify **what the system actually promises**.

> [!IMPORTANT]
> Don't jump to scanning for issues. First extract the **normative source set** and **promise model**.

1. **Identify normative sources**: PRD → Business, Architecture + ADR + SYSTEM_DESIGN → Architecture, TASKS → Task, README/docs → Documentation
2. **Build minimal semantic model** (internal use):
   - Normative source list: which files for each contract type
   - Promise list: each key promise's source, target, failure consequence
   - Task coverage mapping: which promises are covered by tasks, which are not
3. **Extract at minimum these promise types**:
   - **Result promises**: What business outcomes must the system achieve
   - **State promises**: State machines, resource lifecycle, ordering constraints
   - **Time promises**: Time windows, TTL, expiration, scheduling, retention
   - **Error promises**: Error codes, error structures, default failure paths
   - **Security promises**: Auth, authorization, data isolation, sensitive data boundaries
   - **Audit promises**: Which operations should leave traces, granularity, accountability
   - **Runtime promises**: Idempotency, retry, timeout, degradation, observability

4. **Output promise model summary**:

| Promise Type | Summary | Contract Source | Distortion Risk |
|---|---|---|---|
| Error | All API failures return unified error structure | PRD §X / ADR-00Y | Client-side branching |
| Audit | All critical business R/W operations leave traces | PRD §Y / Design §Z | Can't troubleshoot |

---

## Step 2: Pre-Mortem

**Goal**: Look back from the future, analyze possible failure causes — **with logical basis**.

> [!IMPORTANT]
> Use `sequential-thinking` skill for **3-5 thoughts** of deep analysis.
> Apply Karpathy "Simplicity First" lens: is the design over-engineered? Could 50 lines replace 200?

1. **Set scene**: "6 months from now, the project failed. Why?"
2. **Prioritize these distortion types**:
   - **Write-side effect distortion**: Could retry produce duplicate side effects?
   - **State/time distortion**: Do state transitions, time fields, window calculations deviate from contract?
   - **Failure semantic distortion**: Do default 401/404/validation failure paths still match unified promises?
   - **Audit/observation distortion**: Has trace boundary shrunk? Do logs introduce new leak surface?
   - **Task coverage distortion**: Are critical promises missing from implementation tasks entirely?
3. **For each failure cause, answer**:
   1. "What is the Root Cause?"
   2. "Which normative contract does it violate?"
   3. "What evidence suggests this will happen?"
   4. "Probability? (High/Medium/Low)"
   5. "If it happens, how severe is the impact?"

---

## Step 2.5: Review Mode Detection

Determine **what to review this time** based on context signals:

| Signal | Inferred Mode |
| --- | --- |
| `TASKS.md` doesn't exist | `DESIGN` — can only review design |
| User mentions task/task-list issues | `TASKS` |
| User mentions implementation code / delivery acceptance | `CODE` |
| User says "comprehensive review" or "check everything" | `FULL` |
| `TASKS.md` exists, no explicit user direction | `DESIGN`, with adaptive upgrade as needed |
| This is a post-fix re-review, previous round had task issues | `FULL` |

If still unclear, ask the user directly.

Set `REVIEW_MODE` = `DESIGN` / `TASKS` / `CODE` / `FULL`.

---

## Step 3: Design Review

**Trigger**: `REVIEW_MODE` = `DESIGN` or `FULL`
If `REVIEW_MODE` = `TASKS`, **skip** → go to Step 3.5.

> **Skill: `design-reviewer`** (registry: `recommended`)
> Activate `.prismx/skills/design-reviewer/SKILL.md` and follow its instructions.

If `design-reviewer` is installed, fully follow it (input scope, passes, output structure per skill). If it is `not_installed`, use this workflow's built-in design review checklist and record `design-reviewer: fallback`.
When reviewing architecture, also consider **`improve-codebase-architecture`** skill insights (module coupling, testability, AI-navigability).
Collect findings → hold for Step 5.

---

## Step 3.5: Task Review

**Trigger** (any one):
1. `REVIEW_MODE` = `TASKS` or `FULL`
2. **Adaptive upgrade**: `REVIEW_MODE` = `DESIGN` and design review found task coverage gaps.

> **Skill: `task-reviewer`** (registry: `recommended`)
> Activate `.prismx/skills/task-reviewer/SKILL.md` and follow its instructions.

Ask user before upgrading. If `task-reviewer` is installed, follow it completely; otherwise use this workflow's task coverage and verification closure checks and record `task-reviewer: fallback`.
Collect findings → hold for Step 5. If skipped: `Task review skipped` + reason.

---

## Step 3.7: Code Review

**Trigger**: Same `REVIEW_MODE` / adaptive rules; `src/` must exist.

Fully follow **`code-reviewer`** skill (static boundaries, inputs, lenses, output structure, skip protocol — all per skill).
Prefer sub-agent delegation if available. Collect findings → Step 5. If skipped: `Code review skipped` + reason.

---

## Step 4: Closure Validation

**Goal**: Identify hidden assumptions and verify key promises truly close under boundary conditions.

1. **Promise closure checklist**:

| Dimension | Core Question |
| --- | --- |
| **Repeat state** | If same request comes again, does the promise still hold? |
| **Failure state** | On timeout, partial failure, external dependency failure — does promise still hold? |
| **Default state** | Do framework default error/resource paths match system contracts? |
| **Runtime state** | Do scheduling, cleanup, retention, long-running behaviors have closure? |
| **Concurrent state** | Under multi-user/concurrent conflict, are state and side effects controllable? |
| **Observation state** | Sufficient logs/audit evidence without expanding leak surface? |

2. **Technical robustness checks**: Transaction handling, retry mechanisms, degradation strategy, timeout handling, interface definitions, config management, logging/monitoring, version control, prompt templates, tool definitions.

3. **Contract & verification closure**: All public contracts have implementation tasks? High-risk contracts have verification? Foundation layer has unit tests? Error paths have test responsibility? Regression verification for changes affecting existing capabilities?

4. **Record results**: Pass / Partial / Fail for each dimension, with evidence and issue references.

---

## Step 4.5: Review Gate

> [!IMPORTANT]
> **If latest CHALLENGE_REPORT.md has unresolved Critical issues, do NOT enter `/forge`.**
>
> - Resolve via `/change` if convergeable within current version
> - Or restart design premises via `/genesis` / `/design-system`
> - High-only: user can explicitly sign off; AUTO mode cannot auto-pass

---

## Step 5: Generate Challenge Report

Save to `{TARGET_DIR}/CHALLENGE_REPORT.md`:

```markdown
# Challenge Report — {Project Name}

> **Review Date**: {YYYY-MM-DD}
> **Review Scope**: {TARGET_DIR} all design documents
> **Cumulative Rounds**: {N}

---

## Issue Overview

### Round {N} (Active)

| Severity | Count | Summary | Status |
|----------|-------|---------|--------|
| Critical | X | [merged summary] | ⏳ Pending |
| High | X | [merged summary] | ⏳ Pending |

---

## Review Summary

**Review Mode**: `{REVIEW_MODE}`
**Overall Judgment**: ✅ Can proceed / ⚠️ Fix high-priority first / 🛑 Not recommended to proceed
**Key Conclusion**: [2-4 sentence summary of most important issues]

| Evidence Source | Result |
|----------------|--------|
| design-reviewer | {Executed / Fallback / Skipped} |
| task-reviewer | {Executed / Fallback / Skipped / Adaptive} |
| code-reviewer | {Executed / Skipped / Adaptive} |
| Pre-Mortem | {Key conclusion} |
| Closure validation | {Pass / Partial / Fail} |

---

## Core Findings

| ID | Category | Severity | Contract/Pass | Location | Finding | Impact | Recommendation |
|----|----------|----------|---------------|----------|---------|--------|----------------|
| CH-01 | Promise distortion | Critical | Error contract | PRD §X | Default failure path not unified | Client error handling branches | Unify error semantics |

---

## Recommended Actions

### P0 - Immediate (Blocking)
1. [CH-01] - [solution]

### P1 - Near-term (Important)
1. [CH-02] - [solution]

---

## Final Judgment

- [ ] ✅ Project can proceed, risks manageable
- [ ] ⚠️ Project can proceed, must fix P0 first
- [ ] 🛑 Project needs re-evaluation

---

## Appendix: Closure Validation Summary

| Dimension | Result | Evidence | Issue Ref |
|-----------|--------|----------|-----------|
| Repeat state | Pass/Partial/Fail | ... | CH-XX |
```

---

## Step 6: Round Archive Protocol

**Goal**: Keep report lean; resolved rounds keep only summaries.

1. **At each new review round start**, check if previous round's issues are resolved
2. **If resolved** → Mark ✅ in overview, **delete** detailed section, overview row = permanent archive
3. **If partially resolved** → Resolved = ✅, unresolved = ⏳ tracked in new round
4. **Only one round has detailed content at any time** (current active round)

---

## Completion Checklist
- Deeply read all project design documents
- Identified normative sources and extracted key promise model
- Pre-Mortem analysis has logical basis (including Karpathy Simplicity check)
- Every challenge point has evidence support
- Completed closure validation (at minimum: repeat/failure/default/runtime states)
- Technical robustness audit complete
- Promise-type challenges prioritized over form-type challenges
- Report format complete with issue overview
- Previous resolved rounds archived (overview rows only)
- Invoked **`verification-before-completion`** skill before finalizing report
- User has read and decided next steps
