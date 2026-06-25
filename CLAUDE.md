<!-- source: capint/projections/session-start.md | capint ide sync -->

# Claude Code — CapInt

Read root **AGENT.md** for project rules.

# Session start (all IDEs)

> Human daily use: **`GUNLUK.md`** — chat only, no terminal ceremony.

Every **new conversation**, before editing files:

1. Read root `GUNLUK.md` (daily use) + `AGENT.md` + `design.md` (+ `HANDOFF.md` if present). Skim `DONE.md` if scope might repeat past work.
2. Read `skills/prismx-skill-gateway/SKILL.md` before medium+ code edits.
3. Keep startup output short (2–5 lines).

# Task received

When the user assigns work:

1. User does not need to know skill names; you select capability.
2. Before code, show short **Execution Intent**:
   - `Intent: ...`
   - `Capability: ...`
   - `Resolution: provider/resource`
   - `Memory: none|optional|required`
   - `Plan: auto|confirm|override`
3. **Explanation Card (medium+):** before apply, show up to 8 lines — **`reason_plain` first** (business language), then technical `reason_summary`; task type, keywords, files to read (`explanation` block or `capint route --verbose`).
4. **Confirm (adaptive):** light → apply after Intent (`Plan: auto`); medium/heavy → one short Turkish question — accept devam/plan/analiz (tokens optional):
   - devam / yap / evet → apply
   - plan / planla / önce plan → short plan first
   - analiz / incele / kod yazma → analyze only
   - Skip question if user already said “önce plan” or “sadece analiz” in the task.
5. **Workspace boundary:** refuse edits outside this repo unless user includes `cross-repo override`.
6. If ambiguous: `Capability: X (default)` + `Override: /workflow`

# Paths

- Session: `AGENT.md`
- Active handoff: `HANDOFF.md` (if present)
- Completed log: `DONE.md` (append-only)
- Gateway: `skills/prismx-skill-gateway/SKILL.md`
- Matrix: `skill-routing-matrix.json`
- CLI preview: `capint route "<task>"`

# Session end

When the user closes a session (`kapan`, `oturumu bitir`, `HANDOFF güncelle`, `DONE kaydet`):

1. **Append** one row to `DONE.md` — date, short summary, verification (e.g. `npm test`, `capint doctor`).
2. **Rewrite** `HANDOFF.md` — where we left off, next 3 steps, blockers (active context only).
3. If code changed: note whether `npm test` / release-check was green.
4. Keep startup output short; do not duplicate full chat history in either file.


