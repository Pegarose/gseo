---
id: blueprint
version: "1.0"
human_summary: Mimari tasarimi calistirilabilir gorev listesine donusturme
phases:
  - id: requirements
    name: Requirements
    skills:
      - blueprint
      - task-architect
    requires: []
    outputs:
      type: object
      properties:
        requirements:
          type: array
          items:
            type: string
        scope:
          type: string
      required:
        - requirements
        - scope
      additionalProperties: false
  - id: design
    name: Design
    skills:
      - blueprint
      - system-architect
    requires:
      - requirements
    outputs:
      type: object
      properties:
        components:
          type: array
          items:
            type: string
        interfaces:
          type: number
      required:
        - components
        - interfaces
      additionalProperties: false
  - id: task-breakdown
    name: Task Breakdown
    skills:
      - blueprint
      - task-architect
    requires:
      - design
    outputs:
      type: object
      properties:
        tasks:
          type: array
          items:
            type: string
        estimated_complexity:
          type: string
          enum:
            - low
            - medium
            - high
      required:
        - tasks
        - estimated_complexity
      additionalProperties: false
---

# /blueprint

You are the **TASK ARCHITECT**.

**Core mission**:
Read the latest architecture version (`.prismx/arch/v{N}`) and decompose it into an **executable task list**.

**Core principles**:
- **Verification-driven** — Every task must have verification instructions
- **Requirement traceability** — Every task links to [REQ-XXX]
- **Appropriate granularity** — Each task is 2-8 hours of work

**Output Goal**: `.prismx/arch/v{N}/TASKS.md`

---

## CRITICAL Prerequisites

> [!IMPORTANT]
> **Blueprint must be based on a specific architecture version.**
>
> You must first locate the latest Architecture Overview before decomposing tasks.

---

## Step 0: Locate Architecture Version

**Goal**: Find the Source of Truth.

1. **Scan versions**:
   Scan `.prismx/arch/` directory, find the latest version `v{N}`
2. **Determine latest version**:
   - Find the highest-numbered folder `v{N}` (e.g., `v3`).
   - **TARGET_DIR** = `.prismx/arch/v{N}`.

3. **Check required files**:
   - [ ] `{TARGET_DIR}/PRD.md` exists
   - [ ] `{TARGET_DIR}/ARCHITECTURE.md` exists

4. **Check conditionally required files**:
   - [ ] `{TARGET_DIR}/SYSTEM_DESIGN/` exists
   - If missing: Suggest "Recommend running `/design-system` first to generate detailed design for each system. Skipping may result in overly coarse task granularity."
   - **If this version involves public interfaces, CLI parameter semantics, config structures, file formats, error semantics, cross-system protocols, or persistence structures** → `SYSTEM_DESIGN/` is **required**; do not proceed with normal decomposition if missing

5. **If required files are missing**: Error and prompt to run `/genesis` to update this version.

---

## Step 1: Load Design Documents

**Goal**: Load documents from **`{TARGET_DIR}`**.

1. **Read Architecture**: Read `{TARGET_DIR}/ARCHITECTURE.md`
2. **Read PRD**: Read `{TARGET_DIR}/PRD.md`
3. **Read ADRs**: Scan `{TARGET_DIR}/ADR/` directory
4. **Load test strategy constraints**:
   - If `{TARGET_DIR}/ADR/` contains test strategy, quality gate, or verification layering ADRs, they must be read
   - Constraints about unit/integration/E2E/smoke/regression testing are Task generation inputs, not afterthoughts
5. **Extract public contracts and verification responsibilities**:
   - From `ARCHITECTURE.md`, `ADR/`, `SYSTEM_DESIGN/`, extract all public contracts
   - Cover at minimum: operation contracts, cross-system interfaces, HTTP APIs, CLI command/parameter semantics, config structures, file formats, error semantics, persistence structures
   - These contracts must serve as Task generation inputs, not left for `/forge` to guess at runtime
6. **Cross-reference graphify data** (if `.prismx/graph/graph.json` exists):
   - Review module communities and dependency clusters to inform task grouping
   - Identify god nodes or high-coupling hotspots that may need isolation tasks
   - Use dependency graph to validate task ordering assumptions
7. **Invoke skill**: `task-planner`

---

## Step 1.5: Contract Mapping

**Goal**: Before task decomposition, confirm which public contracts must be covered by tasks and verification.

> [!IMPORTANT]
> **Public contracts must have coverage.**
>
> Blueprint must not only cover REQs and User Stories, but also ensure externally observable contracts don't run "naked" during implementation.
>
> **If public contracts depend on `SYSTEM_DESIGN` for clear definition and that directory is missing, report a "contract definition gap" rather than generating a seemingly-complete task list.**

Requirements:

1. Extract all public contracts from design documents
2. Classify each contract:
   - Foundation/rules-layer contract
   - Cross-module/cross-system contract
   - Critical user-path contract
3. For each public contract, plan at minimum:
   - One implementation task
   - One verification point (unit test / integration test / INT / E2E / manual — choose one)
4. For contracts in foundation-layer pure logic, mappings, parsing, normalization, registries, schemas, planners, diff/merge, and other low-dependency logic:
   - Default to unit test coverage first
   - Main branches, edge cases, and error paths should be covered by unit tests as much as possible

> [!IMPORTANT]
> **FORBIDDEN to defer all "public contract verification responsibility" to high-level integration or E2E.**

---

## Step 2: Task Decomposition

**Goal**: Use WBS methodology to decompose tasks.

> [!IMPORTANT]
> **Task format requirements** (CRITICAL):
> Every Level 3 task must include the following fields.

> [!IMPORTANT]
> **When invoking `task-planner`, explicitly pass these constraints**:
> - Current version's PRD, Architecture, ADRs, System Design are the only source of truth
> - If ADR contains test strategy and quality gates, `task-planner` must prioritize them
> - Default to "lightest but sufficient" verification type
> - Every public contract needs at least one implementation task
> - Every high-risk public contract needs at least one explicit verification point
> - Foundation-layer pure logic, rule mappings, parsing, normalization, registries, schemas, planners, diff/merge should default to unit tests, covering main branches/edges/error paths
> - **Smoke tests default only to `INT-S{N}` or very few milestone tasks**
> - Do not upgrade many tasks to E2E tests just because it feels "safer"

### Task Format Template

```markdown
- [ ] **T{X}.{Y}.{Z}** [REQ-XXX]: Task Title
  - **Description**: What specifically needs to be done
  - **Input**: Design document references + predecessor task outputs (must include at least one doc reference)
  - **Output**: Files/components/interfaces produced
  - **Contract coverage**: [Public contract this task implements or verifies; write "None" if N/A]
  - **Reference**: ADR_XXX_*.md or System Design section (if applicable)
  - **Acceptance criteria**:
    - Given [precondition]
    - When [action]
    - Then [expected result]
    - (Only use clear "Done When" list if pure technical task doesn't fit GWT)
  - **Verification type**: [Unit Test | Integration Test | E2E Test | Smoke Test | Regression Test | Manual Verification | Build Check | Lint Check]
  - **Verification notes**: [How to check completion, what to check, specific commands or steps]
  - **Estimate**: Xh
  - **Depends**: T{A}.{B}.{C} (if applicable)
```

### Test Layering Standards

> [!IMPORTANT]
> **Blueprint must generate tasks following test layering, not stuffing all verification into E2E.**
>
> Default hierarchy:
> - **Unit test**: Verify local logic; foundation/shared/pure-logic layers default first, covering main branches, edge cases, and error paths
> - **Integration test**: Verify module/system collaboration
> - **Smoke test**: Verify a few critical paths are runnable at milestone gates
> - **E2E test**: Verify critical user stories or main business chains
> - **Regression test**: Verify new changes haven't broken existing critical capabilities

### Contract Coverage Rules

> [!IMPORTANT]
> **Blueprint must ensure public contracts are covered by tasks and verification.**
>
> Public contracts include: operation contracts, cross-system interfaces, HTTP APIs, CLI parameter semantics, config structures, file formats, error semantics, persistence structures.

Requirements:
- Every public contract has at least one implementation task
- Every high-risk public contract has at least one verification point
- Don't skip foundation-layer unit tests just because "integration tests will happen later"
- If a contract affects existing critical capabilities, plan minimal regression verification

### Smoke Test Principles

> [!IMPORTANT]
> **Smoke tests should be few but real, mainly for milestone gates, not proliferating to every task.**
>
> Blueprint should prioritize placing smoke tests at gates for **major progress, feature completion, preparing to enter next phase**.
> The goal is to verify "system is basically usable / demo-able / can proceed", not to replace full regression testing.

### Regression Test Principles

> [!IMPORTANT]
> **Regression testing isn't running everything on every small change — it's targeted re-verification of "has an existing capability been broken".**

### Interface Traceability Rules

> [!IMPORTANT]
> **Task inputs/outputs must align.**
>
> If task B depends on task A, then B's "Input" must explicitly reference A's "Output" specifics (file path, interface name, data format).

---

## Step 3: Sprint Roadmap & Exit Criteria

**Goal**: Group tasks into Sprints/milestones. Each Sprint must have clear exit criteria and integration verification tasks.

> [!IMPORTANT]
> **Every Sprint must have exit criteria and an INT integration verification task.**
>
> A Sprint isn't just "a bunch of tasks" — it's a work unit with clear entry and exit.
> Exit criteria define "what counts as done"; the integration task proves "it's actually done".

### Sprint Roadmap Format

```markdown
## Sprint Roadmap

| Sprint | Codename | Core Tasks | Exit Criteria | Estimate |
|--------|----------|-----------|---------------|----------|
| S1 | Hello World | Infrastructure + core data | Headless run passes + basic render visible | 3-4d |
| S2 | Feature Shape | Entities + interactions | Full feature demo-able + HUD working | 5-6d |
```

### Integration Verification Task (INT Task)

Each Sprint must end with an **INT-S{N}** integration verification task responsible for verifying that Sprint's exit criteria:

```markdown
- [ ] **INT-S{N}** [MILESTONE]: S{N} Integration Verification — {codename}
  - **Description**: Verify S{N} exit criteria, confirm all cross-system features collaborate correctly
  - **Input**: All S{N} task outputs
  - **Output**: Integration verification report (pass/fail + bug list)
  - **Acceptance criteria**:
    - Given all S{N} tasks are complete
    - When executing each exit criteria check
    - Then all pass → Sprint complete; failures → log bugs and trigger fix wave
  - **Verification type**: Integration Test / Smoke Test / E2E Test (choose one or combine per exit criteria)
  - **Verification notes**: Execute exit criteria item by item; if applicable, add real smoke checks for critical paths; if Sprint changes touch existing critical capabilities, add minimal regression check. Use screenshots/recordings/logs for confirmation
  - **Estimate**: 2-4h
  - **Depends**: All S{N} tasks
```

> INT task is the Sprint's "closing gate". A Sprint that hasn't passed its INT task must not be marked complete.
> Default to converging "real smoke testing" into INT tasks, not spreading it across all dev tasks.
> When invoking `task-planner`, pass **Sprint boundaries + INT tasks + smoke test binding rules** together; forbid the skill from spreading smoke tests to regular dev tasks.

---

## Step 4: Dependency Analysis

**Goal**: Generate Mermaid dependency graph.

```mermaid
graph TD
    T1.1.1[Initialize Project] --> T2.1.1[Implement API]
    T2.1.1 --> T3.1.1[Frontend Integration]
    T1.2.1[Database Schema] --> T2.1.1
```

**Output**: Insert at the top of `{TARGET_DIR}/TASKS.md`.

---

## Step 5: User Story Overlay (Cross-Validation)

**Goal**: Validate task completeness from a **user value perspective**. WBS decomposes by system; this step cross-checks from User Story perspective.

> [!IMPORTANT]
> **User Story Overlay is a coverage safety net.**
>
> WBS ensures every system has tasks, but can't guarantee every user story can run end-to-end.
> This step catches "tasks complete within each system, but cross-system User Story chain is broken".

### Execution Steps

1. **Read PRD User Stories**: Extract all `US-XXX` from `{TARGET_DIR}/PRD.md`
2. **Build mapping**: Map each US's involved systems → corresponding tasks (via REQ traceability + system attribution)
3. **Verify three closure checks**:
   - Does each US have sufficient tasks covering **all involved systems**?
   - Can each US's task chain form an **independently verifiable** closure?
   - Are high-priority US (P0) tasks distributed in early Sprints?

4. **Generate User Story View**: Append to end of `TASKS.md`

5. **Generate Contract Coverage Overlay**: If public contracts exist, append to end of `TASKS.md`

### Contract Coverage Overlay Format

```markdown
## Contract Coverage Overlay

| Contract | Type | Implementation Task | Verification Task | Status |
|----------|------|---------------------|-------------------|:------:|
| `update --target` explicit selection semantics | CLI | T1.2.1 | T6.2.1 | ✅ |
| install-lock fallback rebuild semantics | File/State format | T4.1.1 | T6.2.1 | ✅ |
```

### User Story View Format

```markdown
## User Story Overlay

### US-001: [Title] (P1)
**Involved tasks**: T2.1.1 → T2.1.2 → T7.2.1 → T6.1.2
**Critical path**: T2.1.1 → T2.1.2 → T7.2.1
**Independently testable**: ✅ Demo-able after S1
**Coverage status**: ✅ Complete

### US-003: [Title] (P2)
**Involved tasks**: T3.2.1
**Critical path**: T3.1.1 → T3.2.1
**Independently testable**: ❌ Missing T4.x connection
**Coverage status**: ❌ Incomplete — missing executor-side task
```

### Coverage GAP Handling

- If any US is incomplete → Mark ❌ in Overlay, and add missing tasks to the task list
- If all of a US's tasks are in late Sprints → Suggest moving some tasks earlier for early verification
- Added tasks must follow Step 2's task format template

---

## Step 6: Generate Document

**Goal**: Save the final task list and **update AGENT.md**.

1. **Save**: Write content to `.prismx/arch/v{N}/TASKS.md`
2. **Verify**: Ensure file contains all tasks, acceptance criteria, and dependency graph
3. **Update AGENT.md "Current Status"**:
   - Active task list: `.prismx/arch/v{N}/TASKS.md`
   - Last update: `{Today}`
   - Write initial wave suggestion so `/forge` can start directly:
   ```markdown
   ### 🌊 Wave 1 — {S1's first batch of task goals}
   T{X.Y.Z}, T{X.Y.Z}, T{X.Y.Z}
   ```

---

## Step 7: Final Confirmation

**Present statistics**:
```markdown
✅ Blueprint phase complete!

📊 Task Statistics:
  - Total tasks: {N}
  - P0 tasks: {X}
  - P1 tasks: {Y}
  - P2 tasks: {Z}
  - Total estimated hours: {T}h

📄 Output: {TARGET_DIR}/TASKS.md

🚀 Next steps:
  1. Execute P0 tasks in dependency order
  2. Mark [x] and run verification as each task completes
```

### Update AGENT.md

Update current task status section:

```markdown
### Current Task Status
- Task list: .prismx/arch/v{N}/TASKS.md
- Total tasks: {N}, P0: {X}, P1: {Y}, P2: {Z}
- Sprints: {S}
- Wave 1 suggestion: T{X.Y.Z}, T{X.Y.Z}, T{X.Y.Z}
- Last update: {Today}
```

---

## Completion Checklist
- Every Sprint has exit criteria and INT integration verification task?
- TASKS.md contains all WBS tasks?
- Every task has context and acceptance criteria?
- Task inputs/outputs are aligned (interface traceability)?
- Public contracts are covered by implementation tasks and verification points?
- Foundation-layer low-dependency logic defaults to unit test coverage with main branches/edges/error paths?
- Mermaid dependency graph generated?
- User Story Overlay generated and coverage gaps filled?
- AGENT.md updated (including initial wave suggestion)?
- User confirmed?
