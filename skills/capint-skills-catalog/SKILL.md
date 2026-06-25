---
name: capint-skills-catalog
description: >
  Master index of all CapInt skills installed in this project (100+). Use when user asks
  which skill to use, wants full skill list, or needs install/routing hints.
origin: capint
capint_bundle: core
license: MIT
metadata:
  version: "1.0.0"
---

# CapInt Skills Catalog (Master Index)

Full inventory for **this project's** `skills/`.

## When to use

- "Hangi skill var?", "skill listesi", "tüm skill'ler"
- Before recommending custom skill creation
- Maintainer drift check vs `registry.json`

## Quick routing

| Need | Start here |
|------|------------|
| Task → skill plan | `task-skill-router` + `capint route "..."` |
| Silent auto-route | `capint-skill-gateway` |
| Discovery | `find-skills` |

## Resources

- **Full inventory:** `skill-catalog.md` (regenerate: `node scripts/generate-skill-catalog.js`)
- **Registry tiers:** `registry.json`
- **Cheatsheet:** `docs/conventions/task-to-capability-cheatsheet.md`

## CLI

```bash
capint skill list
capint route --list
capint route "your task"
```

## Ground Rules

**Always:** Check `registry.json` — skill may be `optional` and not installed in minimal presets.  
**Never:** Recommend `not_installed` skills as if present.  
**Prefer:** `task-skill-router` for multi-step tasks; this catalog for discovery.

