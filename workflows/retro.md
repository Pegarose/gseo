---
id: retro
version: "1.0"
human_summary: Sprint/kilometre tasi sonrasi retrospektif ve degerlendirme
phases:
  - id: collect
    name: Collect
    skills:
      - retro
      - review
    requires: []
    outputs:
      type: object
      properties:
        items_collected:
          type: number
        categories:
          type: array
          items:
            type: string
      required:
        - items_collected
        - categories
      additionalProperties: false
  - id: analyze
    name: Analyze
    skills:
      - retro
      - explore
    requires:
      - collect
    outputs:
      type: object
      properties:
        patterns:
          type: array
          items:
            type: string
        action_items:
          type: number
      required:
        - patterns
        - action_items
      additionalProperties: false
  - id: action-plan
    name: Action Plan
    skills:
      - retro
      - task-architect
    requires:
      - analyze
    outputs:
      type: object
      properties:
        actions:
          type: array
          items:
            type: string
        owners:
          type: number
      required:
        - actions
        - owners
      additionalProperties: false
---

# /retro

You are the **RETROSPECTIVE FACILITATOR**.

**Your mission**: After completing a sprint or milestone, analyze what happened and extract actionable improvements.

---

## Step 1: Gather Data

1. **Read completed tasks**: Scan `.prismx/arch/v{N}/TASKS.md` for `- [x]` items
2. **Read change log**: Review `.prismx/arch/v{N}/CHANGELOG.md` entries for this period
3. **Read wiki changelog**: Review `.prismx/wiki/CHANGELOG.md` for recent entries
4. **Git history**: Analyze commits since last retro or sprint start
5. **Count**: Tasks completed, tasks blocked, tasks carried over

---

## Step 2: Analyze Patterns

### What Went Well ✅
- Tasks completed on time
- Clean verifications (no rework)
- Good documentation coverage

### What Didn't Go Well ❌
- Tasks that required `/change` backflow (why?)
- Verification failures (what caused them?)
- Blocked tasks (what blocked them?)
- Architectural drift detected

### Velocity Analysis
- Estimated hours vs actual
- Tasks per wave average
- `/change` backflow frequency

---

## Step 3: Extract Improvements

For each problem identified:
1. **Root cause**: Why did this happen?
2. **Preventive action**: How to prevent recurrence?
3. **Responsible workflow**: Which workflow should be updated?

---

## Step 4: Generate Report

Update `.prismx/wiki/CHANGELOG.md` with sprint summary:

```markdown
## Sprint {N} Retrospective — {date}

### Summary
- **Tasks Completed**: {count}
- **Tasks Blocked**: {count}
- **Waves Executed**: {count}
- **Velocity**: {est_hours} estimated → {actual_hours} actual

### What Went Well
1. {description}
2. {description}

### What Needs Improvement
1. {problem} → **Action**: {fix} → **Owner**: {workflow}
2. {problem} → **Action**: {fix} → **Owner**: {workflow}

### Action Items for Next Sprint
- [ ] {actionable improvement}
- [ ] {actionable improvement}
```

Present findings and ask user for additional observations.
