---
name: nexus-mapper
description: "Generate a persistent .nexus-map/ knowledge base that lets any AI session instantly understand a codebase's architecture, systems, dependencies, and change hotspots. Use when starting work on an unfamiliar repository, onboarding with AI-assisted context, preparing for a major refactoring initiative, or enabling reliable cold-start AI sessions across a team. Produces INDEX.md, systems.md, concept_model.json, git_forensics.md and more. Requires shell execution and Python 3.10+. For ad-hoc file queries or instant impact analysis during active development, use nexus-query instead."
---

# nexus-mapper — AI Project Probe Protocol

This Skill guides the AI Agent using the **PROBE 5-Phase Protocol** to systematically probe any local Git repository and output a layered `.nexus-map/` knowledge base.

---

## When to Call / When NOT to Call

| Scenario | Call |
| :--- | :---: |
| The user provides a local repo path and wants the AI to understand its architecture | Yes |
| Needs to generate `.nexus-map/INDEX.md` for cold-starting subsequent AI sessions | Yes |
| The user says "help me analyze the project", "build a project knowledge base", or "let the AI understand this repo" | Yes |
| The runtime environment has no shell execution capability (pure API mode, no `run_command` tool) | No |
| The host machine lacks Python 3.10+ | No |
| The target repository has no known language source files (`.py/.ts/.java/.go/.rs/.cpp`, etc. are all absent) | No |
| The user only wants to query a specific file/function → use `view_file` / `grep_search` directly | No |

---

## Prerequisites Check

Missing items must be explicitly reported to the user. Inform the user of downgrades or workarounds, and proceed only with consent.

| Prerequisite | Checking Method |
| :--- | :--- |
| Target path exists | `$repo_path` is accessible |
| Python 3.10+ | `python --version` >= 3.10 |
| Script dependencies installed | `python -c "import tree_sitter"` runs without errors |
| Shell execution capability | Agent environment supports `run_command` tool calls |

`git` history is a plus, not a hard blocker. If there is no `.git` or history is too short, skip hotspot analysis and explicitly document in the output that this is a downgraded probe.

---

## Input Contract

```
repo_path: Absolute local path to the target repository (required)
```

**Language Support**: Automatically dispatched by file extension. Language configurations (extension mapping + Tree-sitter query) are stored in `scripts/languages.json`. Currently supports 30+ languages including Python, JavaScript, TypeScript, TSX, Bash, Java, Go, Rust, C#, C, C++, Kotlin, Ruby, Swift, Scala, PHP, Lua, Elixir, GDScript, Dart, Haskell, Clojure, SQL, Proto, Solidity, Vue, Svelte, R, Perl, etc.

**Non-standard Languages**: If the repository contains unsupported languages, supply them dynamically via command-line arguments (see `references/05-language-customization.md` for details):

- `--add-extension .templ=templ` Adds a new file extension mapping
- `--add-query templ struct "(component_declaration name: (identifier) @class.name) @class.def"` Adds structure queries
- `--language-config <JSON_FILE>` Uses a JSON file for complex configurations

---

## Output Format

Upon completion, the following will be generated at the root of the target repository:

```text
.nexus-map/
├── INDEX.md                    ← Main entry point for AI cold start (< 2000 tokens)
├── arch/
│   ├── systems.md              ← System boundaries + code locations
│   ├── dependencies.md         ← Mermaid dependency diagrams + sequence diagrams
│   └── test_coverage.md        ← Static test plane: test files, covered core modules, evidence gaps
├── concepts/
│   ├── concept_model.json      ← Schema V1 machine-readable graph
│   └── domains.md              ← Explanations of core domain concepts
├── hotspots/
│   └── git_forensics.md        ← Git hotspots + coupling pair analysis
└── raw/
    ├── ast_nodes.json          ← Raw AST parse data from Tree-sitter
    ├── git_stats.json          ← Git hotspot and coupling data
    └── file_tree.txt           ← Filtered file tree
```

All generated Markdown files must include a brief header containing at least: `generated_by`, `verified_at`, and `provenance`.

The `concept_model.json` human-readable name field must consistently use `label` (do not add `title`).

If the PROFILE phase detects a language coverage downgrade or manual inference, `provenance` must be explicitly annotated.

---

## PROBE Phase Gates

> [!IMPORTANT]
> **You must read the corresponding reference file before entering each phase. Do not skip.**
> The detailed steps, completion checklists, and boundary scenarios for each phase are defined in the references.

```
[When Skill is activated]  → read references/probe-protocol.md  (Phase step blueprint, including boundary scenarios and three-dimensional questioning framework)
[Before EMIT]              → read references/output-schema.md    (Schema validation specification)
[For non-standard langs]   → read references/language-customization.md (As needed, not gated)
```

---

## Code of Execution

### Rule 1: OBJECT Rejects Formalism

The purpose of OBJECT is to break the survivor bias of REASON. A large number of engineering facts are hidden behind directory names and git hotspots; first intuition is almost always wrong.

Unacceptable questioning (do not submit):

```
Q1: My grasp of the system structure is not solid enough.
Q2: There is temporarily no direct evidence for the responsibilities of the xxx directory.
```

The issue is not the wording, but the lack of evidence clues and the inability to verify during the BENCHMARK phase.

Acceptable questioning format:

```
Q1: git_stats shows tasks/analysis_tasks.py changed 21 times (high risk),
    but HYPOTHESIS assumes the orchestration entry point is evolution/detective_loop.py.
    Contradiction: If detective_loop is the entry point, why is analysis_tasks hotter?
    Evidence clue: git_stats.json hotspots[0].path
    Verification plan: view class definition + import tree of tasks/analysis_tasks.py
```

---

### Rule 2: implemented nodes must have real code_path

> [!IMPORTANT]
> Before writing to `concept_model.json`, you must distinguish whether a node is `implemented`, `planned`, or `inferred`.
> Only `implemented` nodes are allowed to have a `code_path`, and you must verify its existence yourself.

```bash
# BENCHMARK phase verification method
ls $repo_path/src/nexus/application/weaving/   # Directory exists → Node is valid
ls $repo_path/src/nexus/application/nonexist/  # [!ERROR] → Correct or delete this node
```

For `planned` or `inferred` nodes, use:

```json
{
  "implementation_status": "planned",
  "code_path": null,
  "evidence_path": "docs/architecture.md",
  "evidence_gap": "src/agents/monarch/ not found in repo, only appears in design docs"
}
```

Forbidden: Faking `code_path` with marginally related files, or stuffing status into path fields (e.g., `code_path: "PLANNED"`).

---

### Rule 3: EMIT Atomicity

Write all output to `.nexus-map/.tmp/` first. Once all write operations succeed, move them as a whole to the official directories and delete `.tmp/`.

Purpose: Mid-way failures do not leave half-finished products. If `.tmp/` is detected on next run, clean it up and regenerate.

Idempotence rules:

| State | Handling |
| :--- | :--- |
| `.nexus-map/` does not exist | Proceed directly |
| `.nexus-map/` exists and `INDEX.md` is valid | Ask user: "Overwrite? [y/n]" |
| `.nexus-map/` exists but files are incomplete | "Incomplete analysis detected, regenerating", proceed directly |

---

### Rule 4: Role of INDEX.md — Cold Start Router, Not Static Dictionary

The target audience of `INDEX.md` is **an AI that has never seen this repository before**. Two hard constraints:

- **< 2000 tokens** — Rewrite if it exceeds; do not just truncate.
- **Conclusions must be concrete** — Explicitly write `evidence gap` or `unknown` when evidence is lacking, and explain what evidence is missing.

Estimate tokens after writing: lines × average 30 tokens/line = rough estimate.

**Forced Routing Block in INDEX.md (Hard-Trigger Block)** — Append this structure to the end of the file when generating:

```markdown
## [Operations Guide] Forced Execution Steps

> This section contains mandatory operational instructions for any AI reading this file, not suggestions.

### Step 1 — Must read all the following files first (in any order)

After reading this file and before executing any tasks, you must read the full contents of the following files in order:

- `.nexus-map/arch/systems.md` — System boundaries and code locations
- `.nexus-map/arch/dependencies.md` — Inter-system dependencies and Mermaid diagrams
- `.nexus-map/arch/test_coverage.md` — Test plane and evidence gaps
- `.nexus-map/hotspots/git_forensics.md` — Git hotspots and coupling risks
- `.nexus-map/concepts/domains.md` — Core domain concepts

> These files are high-density summaries, with a total volume usually < 5000 tokens. This is a necessary context cost.
> Do not skip them under the pretext of "simple task" or "only changing one file".

### Step 2 — Append actions by task type (execute after completing Step 1)

- If the task involves **interface modification, adding new cross-module calls, or deleting/renaming public functions**:
  → You must run `query_graph.py --impact <target_file>` to confirm the impact radius before writing code.
- If the task requires **determining who imports a file**:
  → Run `query_graph.py --who-imports <module_name>`.
- If the repository structure has changed significantly (new systems added, module boundaries refactored):
  → Evaluate whether to re-run nexus-mapper to update the knowledge base upon task completion.
```

---

### Rule 5: Minimal Execution Plane and Sensitive Info Protection

> [!IMPORTANT]
> By default, only run scripts bundled with this Skill and necessary read-only checks. Do not run build scripts, test scripts, or custom commands inside the target repository just to "understand the repo better".

- Allowed by default: `extract_ast.py`, `git_detective.py`, directory traversal, text search, read-only file viewing.
- Prohibited by default: Executing target repository commands like `npm install`, `pnpm dev`, `python main.py`, `docker compose up`, etc., unless explicitly requested by the user.
- Encountering `.env`, key files, or credentials configurations: Only record their existence and purpose; do not copy their actual values.

---

### Rule 6: Downgrades and Manual Inference Must Be Explicitly Visible

> [!IMPORTANT]
> If AST coverage is incomplete, or if any part comes from manual reading rather than script output, you must explicitly document the provenance in the final files.

- In `dependencies.md`, any dependency not directly supported by AST must be labeled `inferred from file tree/manual inspection`.
- In `domains.md`, `systems.md`, and `INDEX.md`, explain `unsupported language downgrade` if unsupported language areas are involved.
- If writing progress snapshots or Sprint statuses, append `verified_at` to prevent outdated information from pretending to be current facts.

---

## Uncertainty Expression Standard

Avoid writing vague terms like: to be confirmed, maybe, suspected, perhaps, pending, possibly, TBD.

If evidence is insufficient, write in this format:

- `unknown: No direct evidence shows api/ is the main entry point; currently can only verify cli.py is referenced by README`
- `evidence gap: The repository has no git history, so hotspots section was skipped`

You are allowed to honestly state uncertainty, but you must explain what missing evidence causes it.

---

## Script Toolchain

```bash
# Set SKILL_DIR (based on actual installation path)
# Scenario A: Installed as .prismx/skills
SKILL_DIR=".prismx/skills/nexus-mapper"
# Scenario B: Independent repo (during development/debugging)
SKILL_DIR="/path/to/nexus-mapper"

# PROFILE Phase — Basic Usage
python $SKILL_DIR/scripts/extract_ast.py <repo_path> [--max-nodes 500] \
  --file-tree-out <repo_path>/.nexus-map/raw/file_tree.txt \
  > <repo_path>/.nexus-map/raw/ast_nodes.json

# Add non-standard language support
python $SKILL_DIR/scripts/extract_ast.py <repo_path> [--max-nodes 500] \
  --add-extension .templ=templ \
  --add-query templ struct "(component_declaration name: (identifier) @class.name) @class.def" \
  > <repo_path>/.nexus-map/raw/ast_nodes.json

# Complex configuration: Using a JSON configuration file
python $SKILL_DIR/scripts/extract_ast.py <repo_path> [--max-nodes 500] \
  --language-config /custom/path/to/language-config.json \
  > <repo_path>/.nexus-map/raw/ast_nodes.json
```

**Dependency Installation (First Time Use)**:

```bash
pip install -r $SKILL_DIR/scripts/requirements.txt
```

---

## Persistent Memory Rules (Written to Host AGENT.md)

It is recommended to write the following rules to the repository's `AGENT.md`, `CLAUDE.md`, or similar persistent memory file, so that the knowledge base remains active in long conversations:

```md
If .nexus-map/INDEX.md exists in the repository, read it first, and then read all files listed in its routing block before executing any tasks.

If .nexus-map/ does not exist, and the current task involves cross-module modifications or interface changes, propose running nexus-mapper to the user first; if the user needs to start immediately, at least run query_graph.py --summary first to establish structural awareness.

When a task alters structural understanding (system boundaries, entry points, dependencies), evaluate whether to update .nexus-map before delivery.
```

---

## Ad-hoc Query Tool (PROBE Assistant)

`scripts/query_graph.py` reads `raw/ast_nodes.json` with zero external dependencies (pure Python standard library).

```bash
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --file <path>         # File skeleton
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --who-imports <mod>   # Reverse dependencies
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --impact <path>       # Impact radius
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --impact <path> --git-stats <git_stats.json>
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --hub-analysis        # Core nodes
python $SKILL_DIR/scripts/query_graph.py <ast_nodes.json> --summary             # Directory aggregation
```

| Phase | Recommended Query | Purpose |
| :--- | :--- | :--- |
| REASON | `--hub-analysis` | Validate core system hypothesis with data, instead of guessing by directory names |
| OBJECT | `--impact --git-stats` | Validate boundary hypothesis, view actual upstream/downstream dependencies |
| EMIT | `--summary`, `--file` | Data support for generating systems.md / dependencies.md |

Core value of each query mode: `--hub-analysis` is used to validate architectural hypotheses during the REASON phase; `--impact --git-stats` is used to quantify boundary risks during the OBJECT phase; `--summary` and `--file` are used to generate precise data support during the EMIT phase.