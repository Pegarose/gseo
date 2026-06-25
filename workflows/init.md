---
id: init
version: "1.0"
human_summary: Yeni projede PrismX bootstrap ve dizin yapisi olusturma
phases:
  - id: detect
    name: Detect
    skills:
      - init
      - audit
    requires: []
    outputs:
      type: object
      properties:
        project_type:
          type: string
        existing_config:
          type: boolean
      required:
        - project_type
        - existing_config
      additionalProperties: false
  - id: scaffold
    name: Scaffold
    skills:
      - init
      - scaffold
    requires:
      - detect
    outputs:
      type: object
      properties:
        dirs_created:
          type: array
          items:
            type: string
        templates_applied:
          type: number
      required:
        - dirs_created
        - templates_applied
      additionalProperties: false
  - id: configure
    name: Configure
    skills:
      - init
      - scaffold
    requires:
      - scaffold
    outputs:
      type: object
      properties:
        config_path:
          type: string
        registry_initialized:
          type: boolean
      required:
        - config_path
        - registry_initialized
      additionalProperties: false
---

# /init

You are the **INITIALIZER**.

**Your mission**: Set up the PrismX (PrismX Workspace System) in a new project directory, creating all necessary structure and configuration for AI-assisted development.

---

## Step 0: Detect Project State

1. **Check existing structure**:
   - Does `.prismx/` already exist? → If yes, report and ask if reinitialize
   - Does root `AGENTS.md` exist? → Note for product preset / `ide sync`

2. **Detect tech stack**:
   - Scan for `composer.json` → Laravel/PHP
   - Scan for `package.json` → Node.js/React/Vue
   - Scan for `Cargo.toml` → Rust
   - Scan for `go.mod` → Go
   - Scan for `requirements.txt` / `pyproject.toml` → Python
   - None found → Generic

---

## Step 1: Create Directory Structure

```bash
mkdir -p .prismx/wiki/modules .prismx/wiki/decisions .prismx/wiki/conventions
mkdir -p .prismx/wiki/lint-reports .prismx/wiki/summaries
mkdir -p .prismx/arch .prismx/workflows .prismx/skills .prismx/rules .prismx/graph
mkdir -p .prismx/sources .prismx/logs
```

---

## Step 2: Generate AGENT.md

Create `.prismx/AGENT.md` from the PrismX template, customizing:
- Project name (from directory name or user input)
- Tech stack (from Step 0 detection)
- Development environment URLs (ask user if web project)

Also create root `AGENT.md` that redirects to `.prismx/AGENT.md`.

---

## Step 3: Initialize Wiki

Create `.prismx/wiki/INDEX.md`:
```markdown
# {Project Name} — Wiki Index

## Architecture
- **Current Version**: Not yet initialized (run /genesis)

## Modules
*No modules documented yet. Add module pages as development progresses.*

## Last 5 Activities
| Date | Activity | Modules Affected |
|------|----------|-----------------|
| {today} | PrismX initialized | — |
```

Create `.prismx/wiki/CHANGELOG.md`:
```markdown
# Changelog

## {today}
- PrismX initialized for {project-name}
- Tech stack detected: {stack}
```

---

## Step 4: Install Core Framework

Copy all workflow templates to `.prismx/workflows/`:
- forge.md, genesis.md, blueprint.md, challenge.md, change.md
- explore.md, design-system.md, probe.md, quickstart.md
- craft.md, upgrade.md, init.md, audit.md, retro.md
- ingest.md, wiki-lint.md, query-to-page.md

Also create:
- `.prismx/HANDOFF.md` — empty template
- `.prismx/DONE.md` — empty template
- `.prismx/BOUNDARY.md` — workspace root marker
- `.prismx/context.json` — workspace identity
- `.prismx/sources/README.md` — immutable truth layer guide
- `.prismx/wiki/LOG.md` — knowledge operations log
- `.prismx/rules/karpathy-core.md` — from template
- `.prismx/rules/quality-gates.md` — from template
- `.prismx/REGISTRY.md` — skill registry with dependency statuses
- `.prismx/registry.json` — machine-readable registry summary

---

## Step 5: Configure Skills

PrismX installs a **minimal core** first, then loads project-specific skills based on detected stack and user needs.

### 5.1 Minimal Core Skills

Copy only these by default:

- `prismx-skill-gateway`
- `sequential-thinking`
- `verification-before-completion`

Mark them as `core` in `.prismx/REGISTRY.md`.

### 5.2 Recommended Skills by Project Type

Canonical preset definitions: `.prismx/wiki/conventions/skill-presets.md`.

Ask before copying recommended bundles (preset ID):

| Preset ID | Human label | Suggested Skills |
|-----------|-------------|------------------|
| `minimal` | Core only | _(none beyond core)_ |
| `generic-software` | Generic software | `systematic-debugging`, `code-reviewer`, `test-driven-development` |
| `new-product` | New product / major feature | `brainstorming`, `concept-modeler`, `spec-writer`, `system-architect`, `task-planner` |
| `large-codebase` | Existing large codebase | `nexus-mapper`, `improve-codebase-architecture` |
| `web-app` | Web / frontend | `frontend-design-pro`, `emil-design-eng`, `webapp-testing` |
| `api-service` | API / backend service | `systematic-debugging`, `code-reviewer`, `test-driven-development` (optional: `nexus-mapper`, `improve-codebase-architecture`, `system-architect`) |
| `docs-or-marketing` | Docs / marketing site | `seo-audit`, `schema-markup`, `copywriting` |

#### Preset seçim akışı

1. Kullanıcıya detected stack’i bildir; varsayılan preset öner (ör. `package.json` → `web-app` veya `generic-software`).
2. Sor: tek preset mi, yoksa birleşik mi (ör. `web-app` + `new-product`)? Çoklu seçimde skill listesini birleştirip tekilleştir.
3. Onaylanan her skill için `.prismx/skills/{name}/` kopyala; `registry.json` ve `REGISTRY.md` içinde `recommended` veya `optional` olarak güncelle.
4. Şablon veya workflow’larda adı geçen ama kopyalanmayan skill’leri `not_installed` olarak ekle; asla kurulu varsayma.
5. `minimal` seçildiyede yalnızca core kalır; öneri listesi boş olabilir.

Unused bundled examples stay out of the target project or remain `optional`. Missing referenced skills must be recorded as `not_installed`, never treated as active.

### 5.3 Project-Added Skills

When a user adds a project-specific skill later:

1. Place it under `.prismx/skills/{skill-name}/SKILL.md`
2. Add it to `.prismx/REGISTRY.md` with status `project_added`
3. Add it to `.prismx/registry.json` under `project_added`
4. Extend `prismx-skill-gateway` routing only if needed

### 5.4 Initial Drift and Environment Validation

Immediately after configuring the registry and copying skills:

1. **Verify Core Integrity**: Check that all skills marked as `core` in `.prismx/registry.json` actually exist as folders with a `SKILL.md` under `.prismx/skills/`.
2. **Perform Initial Drift Check**: Ensure there is no drift between `registry.json` and the physical files in `.prismx/skills/`. Any installed folder must be listed with a status of `core`, `recommended`, `optional`, or `project_added`.
3. **Environment Sanity Check**: Verify that Python 3.10+ and Node.js/npm are available if project-specific skills require them.
4. **Log Validation Success**: Record the validation results in `.prismx/logs/init_validation.log`.

---

## Step 6: Configure .gitignore

Add to `.gitignore`:
```
# PrismX — auto-generated content
.prismx/graph/*.json
.prismx/graph/*.svg
.prismx/graph/*.dot
.prismx/graph/generated/
.nexus-map/
graphify-out/
.superpowers/
*.tmp
```

---

## Step 7: Optional — Initial Knowledge Graph

Ask user: "Run initial knowledge graph build? (Recommended for existing codebases)"

If yes:
```bash
graphify . --wiki --svg
# Move outputs to .prismx/graph/
mv graphify-out/* .prismx/graph/
```

---

## Completion

```markdown
## ✅ PrismX Initialized

**Project**: {name}
**Tech Stack**: {detected}
**Structure**:
  .prismx/
  ├── AGENT.md          ← Session protocol
  ├── wiki/             ← Curated knowledge
  ├── arch/             ← Versioned architecture
  ├── sources/          ← Immutable truth layer
  ├── workflows/        ← Workflow templates
  ├── skills/           ← Minimal core + project-selected skills
  ├── REGISTRY.md       ← Skill status/dependency model
  ├── rules/            ← karpathy-core + quality-gates
  ├── logs/             ← Boundary audit log
  └── graph/            ← Knowledge graph (auto)

**Next steps**:
1. Read `.prismx/GUNLUK.md` — daily chat flow
2. Run `prismx ide sync` after init (product preset)
3. Run `/genesis` when you need a new architecture version
```
