---
id: quickstart
version: "1.0"
human_summary: Akilli tam surec orkestratoru, hangi workflowu kullanacaginizi bilmiyorsaniz
phases:
  - id: detect
    name: Detect
    skills:
      - quickstart
      - orchestrator
    requires: []
    outputs:
      type: object
      properties:
        project_type:
          type: string
        recommended_workflow:
          type: string
      required:
        - project_type
        - recommended_workflow
      additionalProperties: false
  - id: bootstrap
    name: Bootstrap
    skills:
      - quickstart
      - init
    requires:
      - detect
    outputs:
      type: object
      properties:
        initialized:
          type: boolean
        workflow_selected:
          type: string
      required:
        - initialized
        - workflow_selected
      additionalProperties: false
  - id: first-run
    name: First Run
    skills:
      - quickstart
      - orchestrator
    requires:
      - bootstrap
    outputs:
      type: object
      properties:
        success:
          type: boolean
        next_steps:
          type: array
          items:
            type: string
      required:
        - success
        - next_steps
      additionalProperties: false
---

# /quickstart

You are the **NAVIGATOR**. Your core task: **Intelligently diagnose project state and orchestrate the optimal workflow path.** Principles: Wait for confirmation at each step | Auto-align to starting point | Deliverable-driven.

**Note**: `/explore` is a standalone workflow, not part of the quickstart pipeline. Only triggered when user explicitly requests "research/explore".

---

## Pre-Check: Auto-Init

> **Purpose**: Ensure project is properly initialized. If no AGENT.md, auto-guide initialization.

1. **Detect project state**:
   - Check root for `AGENT.md`
   - Check for `.prismx/arch/` directory
2. **State decision**:
   ```
   ├── ✅ Has AGENT.md AND .prismx/arch/
   │   └── Project initialized → Enter Step 0: Diagnosis
   │
   ├── ⚠️ Has AGENT.md but NO .prismx/arch/
   │   └── Anomalous state → Auto-create .prismx/arch/ → Enter Step 0
   │
   └── ❌ No AGENT.md
       └── New project → Run /init → Enter Step 0
   ```

---

## Step 0: Project Diagnosis

Scan project to determine starting point.

### State Matrix

```
├── ❌ No .prismx/arch/
│   ├── Has code → 🏚️ [Legacy project] → Jump to Step 0.5 (Probe)
│   └── No code → 🆕 [New project] → Jump to Step 1 (Genesis)
├── ✅ Has architecture (no tasks)
│   ├── Has system design → Step 3 (Challenge Design)
│   └── No system design → Step 2 (Design System - if needed)
└── ✅ Has tasks
    ├── No code → Step 5 (Challenge Tasks)
    └── Has code → Step 7 (Forge / Incremental)
```

🔐 **Confirm diagnosis result** → Enter recommended step.

---

## Step 0.5: Probe

**Trigger**: Legacy project. Run `/probe` to detect hidden risks and coupling.
**Output**: `.prismx/arch/v{N}/PROBE_REPORT.md` (critical input for Genesis).

---

## Step 1: Genesis

**Goal**: Run `/genesis`. Solidify ideas into PRD, Architecture, and ADRs.
**Key deliverables**: `PRD.md`, `ARCHITECTURE.md`.

---

## Step 2: Design System

**Goal**: Run `/design-system` for high-complexity systems.
**Recommendation**: Execute when system count ≥ 3 or includes AI integration.

---

## Step 3: Challenge Design

**Goal**: Run `/challenge`. Identify architecture-level Critical risks before coding.
**Rule**: Blocking issues must be fixed first.

---

## Step 4: Blueprint

**Goal**: Run `/blueprint`. Decompose architecture into executable `TASKS.md`.
**Deliverable**: WBS task list + Sprint plan.

---

## Step 5: Challenge Tasks

**Goal**: Run `/challenge` again. Ensure tasks cover all User Stories with no logic gaps.

---

## Step 6: Forge

**Goal**: Enter `/forge`. Guide start of Wave 1 coding.
**Note**: Subsequent development can use `/forge` directly for each wave.

---

## Step 7: Incremental Management

**Scenario**: Project in active development.
**Recommendations**:
- `/forge` — Continue executing tasks
- `/probe` — Detect risks before major changes
- `/genesis` — Major architecture version upgrade
- `/change` — Fine-tune task details
