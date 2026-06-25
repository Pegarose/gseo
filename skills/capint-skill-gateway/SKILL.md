---
name: capint-skill-gateway
description: >
  CapInt Skill Gateway — Invisible skill router. PRIORITY: Consult this skill BEFORE any other for ANY
  task-oriented request. Routes to the right .capint/skills/ skill automatically.
  Trigger for: ANY file creation, ANY coding/building task, ANY design/creative request,
  ANY debugging, ANY testing, ANY refactoring, ANY SEO/security/deployment task,
  ANY documentation request, ANY "how do I" or "help me with" question.
  ONLY skip for pure conversational chat. Responds in the user's language.
  version: 1.0.0
---

# CapInt Skill Gateway
<!-- last_synced_from: .capint/skills/skill-gateway/SKILL.md | 2026-06-04T01:00:00.000Z -->

You are the **invisible skill router**. Every task request passes through you first.

> **Constitutional layer:** Apply `.capint/rules/karpathy-core.md` (P1–P4) before routing — P1 if ambiguous, P3 on every edit.

## How It Works
1. User makes a request
2. Assess the need (internally, never out loud)
3. Check `registry.json` or `.capint/config.json` for the target skill status
4. If the skill is present (`core`, `recommended`, `optional`, `project_added`) and its `SKILL.md` exists, read it
5. If the skill is `not_installed` or missing, use the documented fallback or suggest installing/adding it
6. Execute the task with the best available skill set

**Never say** "I'm routing you to the X skill." Just do the work seamlessly.

## Dependency Status Rules

| Status | Gateway Behavior |
|--------|------------------|
| `core` | Must be available in a CapInt workspace. If missing, report setup corruption. |
| `recommended` | Use when available; if missing, use general workflow fallback and recommend setup. |
| `optional` | Use only when the project has it. Do not block if absent. |
| `not_installed` | Do not pretend it exists. Use fallback or suggest `capint skill pin <name>`. |
| `project_added` | Treat as first-class for this project after reading its `SKILL.md`. |

## Context Check (Before Routing)

**CapInt project (root):**
1. Read `HANDOFF.md` if present → active task context
2. Skim `DONE.md` → don't rebuild completed work
3. Session rules: `AGENT.md` + gateway (this file)

Then: new session → prefer `session-context-primer` before heavy work; check complexity weight → 🟢 skip brainstorming, 🔴 always brainstorm first

## Quick Routing Table
| Keywords | Preferred Skill(s) | If Missing |
|----------|--------------------|------------|
| new session, start, context load, where were we | `session-context-primer` | Read HANDOFF + INDEX manually |
| vague, unclear, fix it, improve, optimize (ambiguous) | `prompt-enhancer` → then domain skill | Ask clarifying questions |
| skill plan, hangi skill, which skill, route task | `task-skill-router` | Read gateway table manually |
| skill catalog, tüm skill, all skills, skill listesi | `capint-skills-catalog` | `capint skill list` |
| learned, gotcha, decision, remember, document finding | `knowledge-base-update` | Append wiki/decisions or gotchas manually |
| docs stale, sync readme, update changelog after code | `documentation-sync` | Update CHANGELOG + README manually |
| production down, outage, incident, P1, error spike | `incident-response` | Contain + log in `.capint/incidents/` |
| npm audit, CVE, dependency scan, outdated packages | `dependency-audit` | Run ecosystem audit manually |
| new feature, build, add | `brainstorming` → `task-planner` | Use `/genesis`/`/blueprint` prompts and recommend adding planning skills |
| bug, error, broken | `systematic-debugging`, `test-driven-development` | Use hypothesis/debug log manually |
| refactor, clean up, code smell, simplify, sadeleştir | `refactor`, `code-simplifier`, `code-reviewer` | `improve-codebase-architecture` |
| prd, requirements, user story, gereksinim | `prd`, `spec-writer`, `brainstorming` | Use `/genesis` prompts |
| threat model, tehdit model, appsec | `security-threat-model`, `security-and-hardening` | Security checklist |
| acceptance, kabul testi, delivery test | `delivery-acceptance`, `playwright`, `webapp-testing` | Manual test plan |
| mcp server, model context protocol | `mcp-builder` | Read MCP docs |
| pdf, excel, xlsx, word, docx, powerpoint, pptx | `pdf`, `xlsx`, `docx`, `pptx` | Manual file handling |
| graphql, schema design | `graphql-schema`, `graphql-operations` | `api-and-interface-design` |
| i18n, localization, çeviri, laravel lang | `localization-hub` | Manual locale files |
| deploy vercel, netlify, cloudflare workers | `vercel-deploy`, `netlify-deploy`, `cloudflare` | `shipping-and-launch` |
| react performance, next.js best practices | `vercel-react-best-practices`, `vercel-composition-patterns` | `performance`, `core-web-vitals` |
| figma, design to code | `figma-implement-design`, `figma` | `frontend-design-pro` |
| langchain, RAG, vector | `langchain-rag` | Manual RAG setup |
| commit message, conventional commit | `git-commit` | `git-workflow-and-versioning` |
| open PR, pull request template | `pr-creator`, `gh-cli` | Manual PR |
| documentation, diataxis, tech docs | `documentation-writer`, `documentation-sync` | Update README manually |
| test, TDD, coverage | `test-driven-development` | Write minimal verification plan |
| review, PR, quality | `code-reviewer` | Use review stance checklist |
| design review, architecture review | `design-reviewer` | Use `/challenge` built-in design checklist |
| task review, task quality | `task-reviewer` | Use `/challenge` built-in task checklist |
| security, auth, OWASP | `security-and-hardening`, `auth-patterns`, `code-reviewer`, `verification-before-completion` | Treat as heavy and require explicit evidence |
| UI, CSS, design, layout | `frontend-design-pro`, `emil-design-eng`, `impeccable` | Use accessible UI checklist |
| accessibility, WCAG, a11y | `impeccable` | Use `frontend-design-pro` accessibility section |
| SEO, meta, sitemap | `seo-audit`, `schema-markup` | Use general SEO checklist |
| performance, speed, loading | `performance` | Optimize with Lighthouse performance guidelines |
| LCP, INP, CLS, web vitals | `core-web-vitals` | Use `performance` skill as broader fallback |
| security, HTTPS, headers, CSP | `security-and-hardening` + `best-practices`, `code-reviewer` | Use security checklist |
| audit site, lighthouse, quality | `web-quality-audit` | Run individual skill audits (seo + performance + a11y + best-practices) |
| e2e, browser test, playwright | `e2e-testing-guide`, `webapp-testing` | Use manual test plan |
| runtime, process, port, server | `runtime-inspector` | Use manual log reading + script analysis |
| compare tech, evaluate, ADR | `tech-evaluator` | Use structured comparison matrix |
| docs, API docs | `spec-writer` | Use CapInt document templates |
| plan, roadmap | `task-planner` | Use WBS fallback |
| graph, dependency | `nexus-mapper`, optional `nexus-query` | Use file tree + dependency search |
| create skill, new workflow | `craft-authoring` or `/craft` | Use `/craft` workflow built-in scaffold |
| find/add skill | `find-skills` or `/craft` | Add registry entry as `project_added` after creation |
| API design, interface, REST, GraphQL | `api-and-interface-design` | Use general API design principles |
| CI/CD, pipeline, deploy, automate | `ci-cd-and-automation` | Use deployment checklist |
| context, session, agent setup | `context-engineering` | Use standard session protocol |
| deprecate, migrate, upgrade legacy | `deprecation-and-migration` | Use `/upgrade` workflow |
| ADR, decision record, document | `documentation-and-adrs` | Use CapInt arch/ templates |
| doubt, adversarial, second opinion | `doubt-driven-development` | Use `/challenge` workflow |
| git, commit, branch, version | `git-workflow-and-versioning` | Use standard git practices |
| interview, requirements, discover | `interview-me` | Use `/genesis` Step 1 |
| launch, ship, production ready | `shipping-and-launch` | Use deployment checklist |
| official docs, source truth | `source-driven-development` | Use general documentation reading |
| concept, model, domain map | `concept-modeler` | Use brainstorming + manual domain mapping |
| copy, headline, tone, writing | `copywriting` | Use general writing best practices |
| architect, system boundary, decompose | `system-architect` | Use `/genesis` built-in architecture step |
| detailed design, interface, data model | `system-designer`, `database-and-data-modeling` | Use `/blueprint` built-in design step |
| database, schema, migration, SQL, ORM | `database-and-data-modeling` | Use `system-designer` data model section |
| error, exception, retry, circuit breaker | `error-handling`, `systematic-debugging` | Use hypothesis/debug log manually |
| env, config, secrets, feature flag, .env | `environment-and-config` | Use deployment checklist |
| best practices, standards, conventions | `best-practices` | Use general coding standards |

> **Non-routed skills** (workflow-internal, no user keyword triggers):
> `dispatching-parallel-agents`, `executing-plans`, `sequential-thinking`, `verification-before-completion`.
> These are activated automatically by workflows or other skills, not by user keywords.

## Task routing (capability-first)

Read `skill-routing-matrix.json` — canonical policy for weights, capabilities, and confirm step.

Runtime chain (CLI + agent parity):

`parseIntent -> routeCapability -> resolveMemoryStrategy -> buildExecutionPolicy -> formatOutput`

| Step | Behavior |
|------|----------|
| Every task | Short **Execution Intent** per `session-start.md` |
| Light 🟢 | No confirm — implement after Intent (`Plan: auto`) |
| Medium/heavy 🟡🔴 | One-line Turkish confirm; accept devam/plan/analiz — never require `apply_now` token |
| Apply | Classify silently → gateway → implement |
| Plan | Run `task-skill-router` → Skill Plan table → approval → implement |
| Analyze | Research/read-only; no code unless user changes choice |

Execute via activated skills without announcing "routing to X" during implementation.

> **Deprecated:** `skill_plan_mode` in old `context.json` / `config.json` — ignore; use matrix `clarification_policy` + `execution_policy_defaults`.
> **Policy source:** provider precedence and fallback are controlled by matrix `resolver_order`; domain skill boosts obey `rules_domain_map.weight_min`.

## When No Skill Matches
1. Check `registry.json` for recommended installs
2. Handle with general capabilities if possible
3. Suggest: `capint skill pin <name>` or create via `/craft`

## After Routing
- Follow the activated skill's SKILL.md completely
- Respect CapInt session protocol (HANDOFF/DONE updates)
- On 🔴 Heavy tasks: trigger triple-sync (DONE + Graph + Wiki)

## Extension Checklist — Adding `project_added` Skills to Gateway

When a new skill is added via `capint skill pin`, decide if it needs gateway routing:

### When to Add Routing Keywords

- [ ] Skill has **user-facing triggers** (keywords users would type naturally)
- [ ] Skill covers a **domain not handled** by existing routing entries
- [ ] Skill is **frequently needed** in this project type

→ **Action**: Add a row to the Quick Routing Table above:

```markdown
| <keywords> | `<skill-name>` | <fallback if removed> |
```

### When Routing is Optional

- Skill is **only called from workflows** (e.g., `craft-authoring` from `/craft`)
- Skill is a **sub-skill** activated by another skill (e.g., `nexus-query` from `nexus-mapper`)
- Skill is **project-specific** and unlikely to match generic keywords

→ **Action**: No routing row needed.

### Maintenance

- When a `project_added` skill is removed, check if its routing row should be deleted
- Run `capint skill audit` to detect routing entries pointing to missing skills
- See: [Skill add contract](../../wiki/conventions/skill-add-contract.md)
