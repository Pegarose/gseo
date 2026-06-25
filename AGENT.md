# AGENT.md — GSeoSuite

CapInt capability-first orchestration contract for this project.

> **Günlük kullanım:** [GUNLUK.md](GUNLUK.md) — chat yeterli, terminal zorunlu değil.

<!-- capint:managed:start -->
## Task contract

For every task:
1. Build Execution Intent
2. Adaptive confirm: light → apply after Intent; medium/heavy → short Turkish question (devam/plan/analiz — no token required)
3. Route via capability + provider resolution

## Activation model

- **`installed`** = `skills/<name>/SKILL.md` exists on disk **and** skill is not disabled (`capint skill list`).
- **Installed ≠ Cursor skill picker** — CapInt does not register 115 skills in IDE UI; the agent reads files per task.
- Before medium+ code edits: read `skills/prismx-skill-gateway/SKILL.md`, then the routed skill from `explanation.files_to_read`.
- Preview routing: `capint route "<task>"` — check **Explanation** block.

## Runtime chain

`parseIntent -> routeCapability -> resolveMemoryStrategy -> buildExecutionPolicy -> formatOutput`

## Scope

- Chat-first UX; no skill name memorization.
- Memory strategy is silent (`none|optional|required`).
- Verification required on medium/heavy before claiming done.
<!-- capint:managed:end -->

## Project notes

Add project-specific agent guidance below this line (never overwritten by scaffold).
