---
id: upgrade
version: "1.0"
human_summary: PrismX guncelleme sonrasi migrasyon ve uyumluluk kontrolu
phases:
  - id: check
    name: Check
    skills:
      - upgrade
      - audit
    requires: []
    outputs:
      type: object
      properties:
        current_version:
          type: string
        target_version:
          type: string
      required:
        - current_version
        - target_version
      additionalProperties: false
  - id: migrate
    name: Migrate
    skills:
      - upgrade
      - migration
    requires:
      - check
    outputs:
      type: object
      properties:
        migrations_applied:
          type: number
        breaking_changes:
          type: array
          items:
            type: string
      required:
        - migrations_applied
        - breaking_changes
      additionalProperties: false
  - id: verify
    name: Verify
    skills:
      - upgrade
      - audit
    requires:
      - migrate
    outputs:
      type: object
      properties:
        upgrade_ok:
          type: boolean
        tests_passing:
          type: boolean
      required:
        - upgrade_ok
        - tests_passing
      additionalProperties: false
---

# /upgrade

You are the **UPGRADE ORCHESTRATOR**.

**Core mission**: After a framework update is executed, read the latest upgrade record from `.prismx/arch/changelog/`, analyze how framework-level changes affect business documents, determine whether to route to `/change` or `/genesis`, and **route to the corresponding workflow after human approval**.

**Core principles**:
- **Changelog is the upgrade basis** — don't upgrade from memory, must read `.prismx/arch/changelog/vX.Y.Z.md`
- **Grade first, route second** — determine Minor/Major before deciding `/change` or `/genesis`
- **Protect business constants** — FORBIDDEN to overwrite business domain terms, business rules, product constraints
- **Upgrade only orchestrates** — `/upgrade` doesn't bypass standards to edit documents directly; actual writes follow the routed workflow
- **Human approval** — must show upgrade plan and wait for user approval before any writes

---

## CRITICAL Execution Order

> [!IMPORTANT]
> Must strictly follow Step 0 → 1 → 2 → 3 → 4. FORBIDDEN to skip changelog reading, grade before routing, bypass human checkpoint, or write without reading target workflow.

---

## Step 0: Locate Upgrade Input

1. Scan `.prismx/arch/changelog/`
2. Find latest `vX.Y.Z.md`
3. Read and extract: file-level changes, content-level details, affected workflows/skills/templates
4. Scan `.prismx/arch/` for latest architecture version `v{N}`
5. Set context: `LATEST_CHANGELOG`, `CURRENT_ARCH`

If any directory missing → stop, prompt user to run update or `/genesis` first.

---

## Step 1: Upgrade Grading (Minor / Major)

> [!IMPORTANT]
> Upgrade type is AI-judged, not statically read from changelog. Only `Minor` and `Major` — no Patch level.

**Skill auto-triggers** (context-based, no user action needed):
- When upgrading dependencies or migrating APIs → auto-load **`deprecation-and-migration`** skill (deprecation patterns, migration checklists, backward compatibility verification, upgrade path planning)

| Level | Criteria |
|-------|----------|
| Minor | Changes can be handled within current version via `/change`, no new arch version needed |
| Major | Version directory rules change, core workflow protocol changes, architecture boundary changes, needs new version |

**Mandatory assessment questions**:
1. Does it change version directory or core path conventions?
2. Does it change multiple workflow execution protocols?
3. Does it affect `PRD.md`, `ARCHITECTURE.md`, `ADR/` structural semantics?
4. Does it require keeping old arch docs as compatibility reference?

**Decision**: Local document impact, no new version → `Minor`. Needs new version, changes arch semantics or directory protocol → `Major`.

---

## Step 2: Impact Analysis & Route Recommendation

1. Read from `CURRENT_ARCH`: PRD.md, ARCHITECTURE.md, ADR/*, SYSTEM_DESIGN/*, TASKS.md (as needed)
2. Build "framework change → business document node" mapping
3. Identify three impact types:
   - **Path migration**: e.g., directory location changes
   - **Process migration**: e.g., new workflows added
   - **Protocol migration**: e.g., workflow priority principles, changelog dependencies
4. For each impact point: affected file, affected section, modification reason, whether AI inference fill is needed
5. Generate **recommended route**: Minor → `/change`, Major → `/genesis`

> [!IMPORTANT]
> This step only produces "upgrade plan" and "route recommendation" — **no actual document writes**.

---

## Step 3: Human Checkpoint 🔐

> [!IMPORTANT]
> FORBIDDEN to write any file without explicit user approval.

Present to user:

```markdown
🔐 Human Checkpoint — Upgrade Plan Confirmation

**Latest changelog**: `.prismx/arch/changelog/vX.Y.Z.md`
**Current arch version**: `.prismx/arch/v{N}`
**Upgrade grade**: Minor / Major
**Recommended route**: `/change` or `/genesis`

## Affected Files
- `.prismx/arch/v{N}/PRD.md` — Reason: path convention change
- `.prismx/arch/v{N}/ARCHITECTURE.md` — Reason: new update process

## Execution Strategy
- Minor: Enter `/change`, follow its permission boundaries
- Major: Enter `/genesis`, follow its versioning rules

## Risk Notes
- Which paragraphs need AI inference
- Which business constants will be protected

Please confirm: ✅ Approve & route / ❌ Reject / 🔄 Adjust
```

---

## Step 4: Route to Target Workflow

### Case A: Minor → `/change`
1. **Must read** `/change` workflow first
2. Bring Step 2 impact analysis into `/change`
3. All modifications follow `/change` permission boundaries, checkpoints, and CHANGELOG rules
4. If `/change` assessment finds scope exceeded → immediately terminate and switch to `/genesis`

### Case B: Major → `/genesis`
1. **Must read** `/genesis` workflow first
2. Bring Step 2 impact analysis as new version evolution input
3. Version copying, document evolution, ADR changes follow `/genesis` version management logic

### AI Inference Fill Rule
If any content needs AI context-based completion, prefix with:
```markdown
> [!WARNING]
> AI inference fill — requires human review.
```

### Business Constant Protection
These are FORBIDDEN from being overwritten by framework upgrades: business domain terms, product goals, user story business intent, team-specific constraints, custom system boundaries.

---

## Completion Report
After routing, output to user: upgrade level, recommended route, affected file list, whether new version expected, AI inference fill risks, next workflow file to read.

---

## Completion Checklist
- Read latest `.prismx/arch/changelog/vX.Y.Z.md`
- Completed upgrade grading
- Output recommended route (`/change` / `/genesis`)
- Showed upgrade plan and received user approval
- Switched to read target workflow before executing
- Subsequent writes governed by target workflow standards
