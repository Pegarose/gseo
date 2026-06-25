---
id: design-system
version: "1.0"
human_summary: Tek bir sistem icin ayrintili teknik dokuman tasarimi
phases:
  - id: analysis
    name: Analysis
    skills:
      - system-architect
      - probe
    requires: []
    outputs:
      type: object
      properties:
        current_state:
          type: string
        gaps:
          type: array
          items:
            type: string
      required:
        - current_state
        - gaps
      additionalProperties: false
  - id: design
    name: Design
    skills:
      - system-architect
      - api-design
    requires:
      - analysis
    outputs:
      type: object
      properties:
        components:
          type: array
          items:
            type: string
        interfaces_defined:
          type: number
      required:
        - components
        - interfaces_defined
      additionalProperties: false
  - id: documentation
    name: Documentation
    skills:
      - system-architect
      - spec-writer
    requires:
      - design
    outputs:
      type: object
      properties:
        doc_path:
          type: string
        diagrams:
          type: number
      required:
        - doc_path
        - diagrams
      additionalProperties: false
---

# /design-system

You are the **SYSTEM DESIGNER**.

**Capabilities**: Design detailed technical architecture for individual systems, research best practices (via /explore), use `sequential-thinking` for multi-step design reasoning, produce complete system design documents.

**Core philosophy**: **Depth over breadth** — every system deserves thoughtful design.

**Usage**: `/design-system <system-id>` (e.g., `/design-system frontend-system`)

**Output Goal**: `.prismx/arch/v{N}/SYSTEM_DESIGN/{system-id}.md`

---

## CRITICAL: Independent Session & Context Loading

> [!IMPORTANT]
> **Each system's design is completed in an independent session.**
>
> **Why?** Avoid context mixing (frontend vs backend have different design thinking), control token consumption, support parallel design.
> Use **filesystem as external memory**: load via `view_file`, don't rely on session history.

---

## Step 0: Parameter Validation

**Goal**: Confirm user provided system-id.

- If missing → List all systems from ARCHITECTURE.md for user to choose → Stop
- If provided → Record `system_id` → Continue

---

## Step 1: Context Loading

**Goal**: Load necessary context to understand project background and system positioning.

### 1.1 Check File Existence
Scan `.prismx/arch/` for latest `v{N}`. Check: PRD.md ✓, ARCHITECTURE.md ✓, ADR/ ✓. If missing → prompt `/genesis` → stop.

### 1.2 Load PRD
Read `.prismx/arch/v{N}/PRD.md`. Focus on: Executive Summary, Goals & Non-Goals, User Stories ([REQ-XXX]), Constraint Analysis.

### 1.3 Load Architecture Overview
Read `.prismx/arch/v{N}/ARCHITECTURE.md`. Focus on: System list, this system's boundary definition (responsibilities, I/O, dependencies), system dependency graph.

### 1.4 Find System's Detailed Definition
Search ARCHITECTURE.md for system-id content: Responsibility, Boundary (inputs/outputs), Dependencies, Related requirements [REQ-XXX].

### 1.5 Load Related ADRs
Scan `.prismx/arch/v{N}/ADR/`. Selectively load ADRs related to this system.

> [!IMPORTANT]
> **ADR → SYSTEM_DESIGN one-way reference chain**: ADR records cross-system decision details. SYSTEM_DESIGN §8 Trade-offs **only references ADR, never copies decision content**.

### 1.6 Generate Context Summary
**Thought guide**: (1) Which PRD requirements? (2) Core responsibility in one sentence? (3) Boundaries — inputs/outputs? (4) Tech constraints from PRD? (5) Which ADR decisions affect this system?

**Output**: Context summary (in memory, not saved to file).

### 1.7 ADR Reference Checklist
List all ADRs in `ADR/` → identify ones related to this system → generate "ADRs to reference in §8" list. Distinguish: cross-system decisions (reference ADR) vs. system-specific decisions (explain in detail).

---

## Step 2: System Understanding

**Goal**: Deep understanding of system responsibilities and boundaries.

> [!IMPORTANT]
> Use `sequential-thinking` for complex systems. Deep understanding is the prerequisite for good design.

**Thought guide** (10 questions):
1. Core responsibility in one sentence?
2. Where are the boundaries? What's in/out?
3. What are the inputs? From where?
4. What are the outputs? To whom?
5. Which other systems does it depend on? Are these dependencies reasonable?
6. Which systems depend on it? How should interfaces be designed?
7. Which PRD requirements? Their priorities?
8. Technical constraints? (performance, security, compliance)
9. Existing tech debt or legacy systems to accommodate?
10. Success criteria?

---

## Step 3: Research (via /explore)

**Goal**: Learn industry best practices, avoid designing in isolation.

> [!IMPORTANT]
> You **must** invoke `/explore` for research.

Research topics should be tailored to system type (frontend, backend API, database, multi-agent, etc.).

**Output**: Research report saved to `.prismx/arch/v{N}/SYSTEM_DESIGN/_research/{system-id}-research.md`

**Extract**: Recommended architecture patterns, key tech selection advice, common pitfalls/anti-patterns, performance tips, security best practices.

### 3.1 Optional Skills & Reference Resources

> [!IMPORTANT]
> These resources are **auxiliary inputs, not mandatory dependencies or source of truth**. Final solution must converge to this system's own boundaries, constraints, and trade-offs. FORBIDDEN to directly copy third-party patterns without localization.

---

## Step 4: Design (via sequential-thinking)

**Goal**: Based on research and context, deeply design system architecture. Apply Karpathy "Simplicity First" — prefer the simplest design that satisfies all requirements.

> [!IMPORTANT]
> **Frontend System Auto-Detection**: If the system being designed involves UI/frontend/user-facing components, check registry and auto-load available design engineering skills:
> - **`frontend-design-pro`** — Production-grade interface guidelines, accessibility, performance
> - **`emil-design-eng`** — UI polish philosophy, animation decisions, invisible details
> - **`impeccable`** — Optional UX review, visual hierarchy, cognitive load, anti-patterns
>
> These skills inform the **Interface Design** and **Trade-off** sections of the system design document. If `impeccable` is `not_installed`, do not block; record fallback to the installed UI skills or built-in accessibility checklist.

**Thought guide across 5 areas**:

### 4.1 Architecture Design
- Architecture pattern? (MVC, layered, modular monolith)
- Core components and their responsibilities?
- Inter-component communication? (events, direct calls, message queues)
- Code structure? (directory tree)

### 4.2 Interface Design
- API endpoints, component props, message formats?
- I/O data formats?
- Error handling mechanism?

### 4.3 Data Model Design
- Required data structures/entities?
- Database schema? (if needed)
- Data flow between components?

### 4.4 Trade-offs Discussion (Google-style)
- Why option A over B? (tech selection)
- What are the trade-offs? Pros and cons?
- Alternative approaches? Why not them?

### 4.5 Performance & Security
- Performance bottlenecks? Optimization strategies?
- Security risks? Mitigation approaches?

---

## Step 5: Documentation

**Goal**: Produce complete system design document using template.

### 5.0 Split Detection

Check if L1 detail file is needed:

| Rule | Check | Triggered? |
| --- | --- | :---: |
| **R1** | Any single function/algorithm pseudocode > 30 lines | Y/N |
| **R2** | Total code blocks > 200 lines | Y/N |
| **R3** | Config constant dictionary with > 5 entries | Y/N |
| **R4** | Version history annotations > 5 occurrences | Y/N |
| **R5** | Expected total doc lines > 500 | Y/N |

- Any triggered → Create two files (L0 + L1)
- None triggered → Create one file (L0 only)

### 5.1 Load Templates
- **L0** (required): `.prismx/skills/system-designer/references/system-design-template.md`
- **L1** (if needed): `.prismx/skills/system-designer/references/system-design-detail-template.md`

### 5.2 Fill Content

**L0 Required Sections** (`{system-id}.md`):
1. Overview
2. Goals & Non-Goals
3. Background & Context
4. System Architecture — with Mermaid diagram
5. **Interface Design** — operation contract tables (not function pseudocode)
6. **Data Model** — attribute declarations only (no method bodies)
7. Technology Stack
8. **Trade-offs & Alternatives** 🔑 (reference ADR for cross-system; detail for system-specific)
9. Security Considerations
10. Performance Considerations
11. Testing Strategy

**L0 Optional**: Deployment & Operations, Future Considerations, Appendix

**L1 Sections** (`{system-id}.detail.md`, only if 5.0 triggered):
- §1 Config constants
- §2 Complete data structures (with method bodies)
- §3 Core algorithm pseudocode
- §4 Decision tree detailed logic
- §5 Edge cases & notes
- Version history table

**Key requirements**:
- **L0 architecture**: Must use Mermaid diagrams
- **L0 decision trees**: Use Mermaid `flowchart TD`, not pseudocode
- **L1 Anchor Principle**: L0 must provide navigation anchors for all L1 content. **No orphan content in L1** that L0 doesn't reference
- **Traceability**: Reference PRD requirements [REQ-XXX] in relevant sections

> [!IMPORTANT]
> **§8 Trade-offs must use reference format**: Cross-system decisions → reference ADR, don't copy. System-specific decisions → explain "why A not B" in detail.

### 5.3 Save Documents
- L0: `.prismx/arch/v{N}/SYSTEM_DESIGN/{system-id}.md`
- L1 (if needed): `.prismx/arch/v{N}/SYSTEM_DESIGN/{system-id}.detail.md`

---

## Step 6: Review (via /challenge)

> [!IMPORTANT]
> When the system design defines public interfaces, CLI parameter semantics, config structures, file formats, error semantics, or cross-system protocols — **this step is mandatory**.

```
/challenge .prismx/arch/v{N}/SYSTEM_DESIGN/{system-id}.md
```

If major issues found → return to Step 4, redesign, update document.

---

## Step 7: Human Checkpoint 🔐

Present generated document paths and request user confirmation:
- System boundary definition clear?
- Tech selection reasonable?
- Trade-offs discussion sufficient?
- Interface design complete?

Update AGENT.md system boundary section with this system's info.

---

## Completion Checklist
- System ID confirmed
- Context loaded (PRD + Architecture + related ADRs)
- System understanding complete (sequential-thinking 3-5 thoughts)
- Research complete (/explore)
- Design complete (sequential-thinking 5-7 thoughts)
- Document generated (using template)
- AGENT.md updated (system boundary)
- User confirmed
