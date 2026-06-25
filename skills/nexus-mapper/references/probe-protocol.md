# PROBE Protocol — Detailed Steps for Each Stage

> This file is the execution blueprint for SKILL.md. After the Skill is activated, the **first step** is to read this file in full, in a single pass.
> Before EMIT, you must also read `references/output-schema.md` (the Schema is too detailed to include here; it is kept separate to save context at activation time).
> For non-standard language support, see `references/language-customization.md` (on demand, not gated).

---

## P — PROFILE Stage

**Pre-validation**
1. Confirm that the `$repo_path` directory exists
2. Check whether `$repo_path/.git` exists
   - Exists: Perform git hotspot analysis
   - Does not exist: Record `git analysis skipped` and continue with AST and file tree probing

**Execution Steps**

```bash
# Step 1: Run the AST extractor (also generates the filtered file tree)
python $SKILL_DIR/scripts/extract_ast.py $repo_path [--max-nodes 500] \
  --file-tree-out .nexus-map/raw/file_tree.txt \
  > $repo_path/.nexus-map/raw/ast_nodes.json

# If the repository contains languages not covered by built-in support, supplement via command-line arguments
python $SKILL_DIR/scripts/extract_ast.py $repo_path [--max-nodes 500] \
  --add-extension .templ=templ \
  --add-query templ struct "(component_declaration name: (identifier) @class.name) @class.def" \
  --file-tree-out .nexus-map/raw/file_tree.txt \
  > $repo_path/.nexus-map/raw/ast_nodes.json

# Or use an explicit JSON configuration file (for complex configurations, see references/language-customization.md)
python $SKILL_DIR/scripts/extract_ast.py $repo_path [--max-nodes 500] \
  --language-config /custom/path/to/language-config.json \
  --file-tree-out .nexus-map/raw/file_tree.txt \
  > $repo_path/.nexus-map/raw/ast_nodes.json

# Step 2: Run git hotspot analysis (only when .git exists)
python $SKILL_DIR/scripts/git_detective.py $repo_path --days 90 \
  > $repo_path/.nexus-map/raw/git_stats.json
```

> `$SKILL_DIR` is the installation path of this Skill (`.prismx/skills/nexus-mapper` or standalone repo path).
> `$repo_path` is the absolute path to the target repository.
> `extract_ast.py --file-tree-out` excludes noise directories and files by default, such as `.git/`, `.nexus-map/`, `node_modules/`, `__pycache__/`, `.venv/`, `dist/`, `build/`, etc.

**Completion Checks (any failure → stop, do not proceed to REASON)**
- [ ] `raw/ast_nodes.json` has been written (an empty `nodes` list is acceptable as a valid degradation)
- [ ] `raw/file_tree.txt` is non-empty
- [ ] If git history exists: `raw/git_stats.json` is non-empty and contains a `hotspots` field
- [ ] If no git history: It has been explicitly recorded that this is a git-less degraded probe
- [ ] If `ast_nodes.json.stats.known_unsupported_file_counts` is non-empty: Language coverage degradation has been recorded
- [ ] If `ast_nodes.json.stats.module_only_file_counts` is non-empty: Which languages have only Module-level coverage has been recorded
- [ ] If `ast_nodes.json.stats.configured_but_unavailable_file_counts` is non-empty: This portion has been recorded as uncovered

---

## R — REASON Stage

**Edge Case Pre-checks** (go through the following checklist before reading project files; if any item is matched, adjust execution strategy)

| Scenario                                | Detection Method                   | Handling                                                                                      |
| --------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| New repository with no git history      | `.git` exists but only 1 commit    | Skip `git_detective.py`; note in output `git analysis skipped: insufficient history`          |
| Non-git repository                      | `.git` does not exist              | Skip `git_detective.py`; annotate final output with `hotspots skipped: no git metadata`       |
| Large monorepo (>1000 files)            | `stats.truncated=true`             | Advise user to use `--max-nodes 200`; `truncated=true` is expected behavior                   |
| Very long git history (>3000 commits)   | Analysis is slow / git data is too large | Use `--days 30` instead of the default 90 days                                           |
| Project without a README                | No README in root directory        | Skip directly to `pyproject.toml` / `package.json`; note evidence gap in hypothesis log      |
| Repository with roadmap/sprint status   | README/TASKS contain time-sensitive status | Allow summarization, but must attach `verified_at` and source document path; never write undated status as current fact |
| Truncation behavior (truncated=true)    | `stats.truncated_nodes > 0`        | Function nodes are dropped; `raw/functions.json` will not be generated; complete artifacts can be produced based on Module/Class nodes |

> [!DEVIATION]
> **Known implementation deviation**: Truncated Function nodes are **directly discarded** and `raw/functions.json` is **not generated**.
> If any documentation describes truncated nodes being written to a separate file, the actual behavior described here takes precedence.

**Multi-Language Coverage Tiers**

| Status                        | Identification Field                             | EMIT Requirement                                                                       |
| ----------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Full structural coverage      | `languages_with_structural_queries`              | Normal output                                                                          |
| Module-only coverage          | `module_only_file_counts`                        | Must not be described as "full AST coverage"; fine-grained conclusions should be stated conservatively |
| Configured but parser unavailable | `configured_but_unavailable_file_counts`     | Treated as uncovered, not module-only; dependency conclusions should only use `inferred` |
| Not integrated at all         | `known_unsupported_file_counts`                  | Annotate degradation in `INDEX.md`; add `inferred/manual inspection` to affected areas |

**Reading Strategy (priority from high to low)**
1. `README.md` / `README.rst` — Overall project description
2. `pyproject.toml` / `package.json` / `pom.xml` — Tech stack and dependencies
3. Main entry files (`main.py`, `index.ts`, `Application.java`)
4. `raw/file_tree.txt` — Directory structure awareness
5. `raw/git_stats.json` hotspots Top 5 — Most active files (only when git data is available)
6. Test directories — Establish static test surface; no need to run tests

**Execution Requirements**
- Conduct deep thinking; progressively derive key decision points sufficient to support conclusions, typically 3-5
- Identify the repository's main System-level nodes, typically 1-5; do not inflate the count by splitting pure technical details into separate systems
- **[Recommended]** Run hub-analysis to validate core system hypotheses with fan-in/fan-out data:
  ```bash
  python $SKILL_DIR/scripts/query_graph.py $repo_path/.nexus-map/raw/ast_nodes.json --hub-analysis
  ```

**Record Format** (working memory, not written to files)
```
[REASON LOG]
- System A: inferred responsibility=X, implementation_status=implemented, code_path=Y (confidence: high/medium/low)
- System B: inferred responsibility=X, implementation_status=planned, evidence_path=Y (confidence: high/medium/low)
- Evidence gap: Z directory attribution lacks direct evidence (will be challenged in OBJECT)
```

---

## O — OBJECT Stage

**Why challenge is needed**: System hypotheses built on first impressions have three typical biases — directory names do not equal responsibilities, git hotspots reveal the true core, and import directions reveal layer errors. The three dimensions (below) systematically cover these three biases.

**Challenge Protocol** — Raise at least one set of high-value challenges sufficient to contest current assumptions, typically 1-3, each with evidence leads

Challenge point format:
```
Q{N}: [Specific contradiction or suspicious point]
Evidence lead: [Where the contradiction was found — file path/line number/git data]
Verification plan: [How to verify during the BENCHMARK stage]
```

Unacceptable challenges (must not be submitted):
```
Q1: I'm not confident enough about the system structure
Q2: The responsibility of xxx directory lacks direct evidence for now
```
The issue is not the wording, but that there is no code citation and no actionable verification plan.

Acceptable example:
```
Q1: git_stats shows tasks/analysis_tasks.py changed 21 times (high risk),
    but REASON concluded the orchestration entry is evolution/detective_loop.py.
    Contradiction: If detective_loop is the entry point, why is analysis_tasks hotter?
    Evidence lead: raw/git_stats.json hotspots[0]
    Verification plan: view tasks/analysis_tasks.py class definitions + import tree
```

**Three-Dimension Challenge Framework** (corresponding to Structure / Evolution / Dependency)

| Dimension  | Data Source                                      | High-Value Challenge Pattern                                                                                     |
| ---------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Structure  | `raw/file_tree.txt`, ast edges(`contains`)       | Business-named files appear in the assumed "infrastructure layer" directory; multiple System files reside in the same `utils/` (blurry boundary) |
| Evolution  | `raw/git_stats.json` hotspots + coupling_pairs   | The top hotspot is not in the assumed "core system"; file pairs with coupling_score > 0.7 belong to different Systems (boundary drawn incorrectly) |
| Dependency | ast edges(`imports`)                             | An assumed lower-layer module imports an upper-layer module (circular dependency / layering error); import direction is opposite to the assumption |

**Challenge Severity Levels**

| Level    | Definition                                                               |         BENCHMARK Priority         |
| -------- | ------------------------------------------------------------------------ | :--------------------------------: |
| Critical | The assumed system boundary is completely wrong; `code_path` should point to an entirely different location | Verify immediately; do not enter EMIT before verification |
| High     | The core system's `code_path` may be incorrect or missing important subdirectories | First batch in BENCHMARK           |
| Medium   | Subdirectory responsibility assignment is ambiguous and may affect `responsibility` accuracy | Second batch in BENCHMARK          |

> If the evidence only supports Medium, keep it at Medium. At least one challenge must genuinely have the potential to change a system boundary, main entry point, or dependency direction.

**Three-Dimension Execution Checklist**
- [ ] Structure: Are there files/directories in file_tree.txt that cannot be matched to any assumed system?
- [ ] Structure: Are there cross-system `utils/`/`common/` directories with ambiguous boundaries?
- [ ] Evolution: When git data is available, do the top hotspots support the "core system" judgment?
- [ ] Evolution: Are there strongly coupled pairs (score > 0.5) in coupling_pairs that span assumed system boundaries?
- [ ] Dependency: Are there import edges that violate the assumed layering direction (lower layer imports upper layer)?
- [ ] Dependency: Is the import direction of any System opposite to the assumed "depender-dependee" relationship?

---

## B — BENCHMARK Stage

**Verify each challenge point**
1. Use `grep_search` / `view_file` to find specific evidence
2. **[Recommended]** Use `query_graph.py --impact` to inspect the target file's actual upstream and downstream dependencies:
   ```bash
   python $SKILL_DIR/scripts/query_graph.py $repo_path/.nexus-map/raw/ast_nodes.json \
     --impact <target_file> --git-stats $repo_path/.nexus-map/raw/git_stats.json
   ```
3. Judge the result:
   - Challenge confirmed → Correct the node's `code_path` or `responsibility`; mark as "Corrected" in the LOG
   - Challenge not confirmed → Confirm the original hypothesis; mark as "Verified"

**Global Node Validation (execute for every System node)**
- [ ] `implemented` nodes have a `code_path` that actually exists in the repo
- [ ] `planned/inferred` nodes do not fabricate a `code_path`; use `evidence_path + evidence_gap` instead
- [ ] Every `planned/inferred` node's `evidence_path` actually exists in the repo
- [ ] `responsibility` is clear and specific; if evidence is insufficient, explicitly record the evidence gap
- [ ] Node `id` is globally unique, kebab-case, all lowercase

> If a critical system is found to be completely misidentified → return to REASON to rebuild the model and re-execute OBJECT.

---

## E — EMIT Stage

> [!IMPORTANT]
> **Stage Gate**: Before writing any files, you must first read:
> `references/output-schema.md`
> Writing without having read this file → the produced JSON/Markdown structure will fail Schema validation and be considered invalid.

**Idempotency Check (mandatory before writing)**

| Check Result                                  | Action                                                            |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `.nexus-map/` does not exist                  | Proceed directly                                                  |
| `.nexus-map/` exists and `INDEX.md` is valid  | Ask the user: "Existing analysis results detected. Overwrite? [y/n]" |
| `.nexus-map/` exists but files are incomplete | "Incomplete analysis detected; will regenerate", proceed          |

**[Recommended] Obtain structural summary before writing**
```bash
python $SKILL_DIR/scripts/query_graph.py $repo_path/.nexus-map/raw/ast_nodes.json --summary
```

**Write Order (write to `.tmp/` first; move everything after all writes succeed)**
```
1. .nexus-map/.tmp/concepts/concept_model.json   ← Schema V1
2. .nexus-map/.tmp/INDEX.md                       ← L0 summary, < 2000 tokens
3. .nexus-map/.tmp/arch/systems.md                ← System boundaries
4. .nexus-map/.tmp/arch/dependencies.md           ← Mermaid dependency diagram
5. .nexus-map/.tmp/arch/test_coverage.md          ← Static test surface and evidence gaps
6. .nexus-map/.tmp/concepts/domains.md            ← Domain concept descriptions
7. .nexus-map/.tmp/hotspots/git_forensics.md      ← Git hotspot summary
```

All writes succeed → move `.tmp/` contents to `.nexus-map/` → delete `.tmp/`

**INDEX.md Writing Requirements**
- Token count < 2000; rewrite if exceeded
- Conclusions must be specific; do not use vague wording to gloss over gaps; when evidence is insufficient, explicitly write `evidence gap` or `unknown`
- **Must include the "Operations Guide" hard-routing block as defined in SKILL.md Rule 4**

**Minimum header for each Markdown file**
```markdown
> generated_by: nexus-mapper v2
> verified_at: 2026-03-07
> provenance: AST-backed except where explicitly marked inferred
```

**Edge Merging Protocol (execute before writing concept_model.json)**
1. Import edges from `raw/ast_nodes.json` (`imports`/`contains`, machine-layer precise)
2. Append semantic edges inferred during the BENCHMARK stage (`depends_on`/`calls`)
3. Deduplicate: keep only one edge for identical `(source, target, type)` triples

**Completion Validation**
- [ ] `INDEX.md` exists, conclusions are specific and honest about evidence gaps, < 2000 tokens, includes hard-routing block
- [ ] `concept_model.json` has verified `code_path` for all `implemented` nodes
- [ ] `arch/dependencies.md` contains >= 1 Mermaid diagram
- [ ] `arch/test_coverage.md` describes the static test surface and explicitly states the evidence gap of not having run tests
