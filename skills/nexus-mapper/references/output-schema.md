# Output Schema Specification

> **EMIT Stage Hard Gate**: This file is triggered for mandatory reading by the EMIT stage gate in `probe-protocol.md`.
> It must be fully read before writing any `.nexus-map/` files.
> All schemas in this document have been validated against actual runtime output and are consistent with the current script version.

---

## raw/ast_nodes.json (produced by extract_ast.py)

### Top-Level Structure
```json
{
  "languages": ["cpp", "python"],
  "stats": {
    "total_files": 101,
    "total_lines": 23184,
    "parse_errors": 0,
    "truncated": true,
    "truncated_nodes": 298,
    "supported_file_counts": {"python": 101},
    "languages_with_structural_queries": ["python", "javascript", "typescript"],
    "languages_with_custom_queries": ["gdscript"],
    "module_only_file_counts": {"vue": 12},
    "known_unsupported_file_counts": {"customdsl": 24},
    "configured_but_unavailable_file_counts": {"templ": 6},
    "custom_language_config_paths": ["/custom/path/to/language-config.json"]
  },
  "warnings": [
    "custom language configuration loaded: /custom/path/to/language-config.json",
    "some languages were parsed with module-only coverage because no structural query template is bundled: vue (12 files)",
    "known unsupported languages present; downstream outputs must mark inferred sections explicitly: customdsl (24 files)",
    "some configured languages were detected in source files but no parser could be loaded: templ (6 files)"
  ],
  "nodes": [...],
  "edges": [...]
}
```

### Module Node
```json
{
  "id": "src.nexus.application.weaving.treesitter_parser",
  "type": "Module",
  "label": "treesitter_parser",
  "path": "src/nexus/application/weaving/treesitter_parser.py",
  "lines": 320,
  "lang": "python"
}
```

### Class Node
```json
{
  "id": "src.nexus.application.weaving.treesitter_parser.TreeSitterParser",
  "type": "Class",
  "label": "TreeSitterParser",
  "path": "src/nexus/application/weaving/treesitter_parser.py",
  "parent": "src.nexus.application.weaving.treesitter_parser",
  "start_line": 15,
  "end_line": 287
}
```

### Edge
```json
{
  "source": "src.nexus.infrastructure",
  "target": "src.nexus.infrastructure.db_client",
  "type": "contains"
}
```

**Edge types**: `contains` (module→class, class→method) / `imports` (parsed from import statements)

### warnings Field

`warnings` is an optional array used to expose degradation information that won't cause a PROFILE failure but may affect downstream reliability, such as:
- Grammar is loadable, but currently only has Module-level coverage
- Known but unsupported languages are present
- AST was truncated
- Some parsers are unavailable

### Coverage Tier Fields

| Field                                    | Meaning                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `supported_file_counts`                  | Number of files that successfully entered the AST pipeline (including full structural and module-only coverage) |
| `languages_with_structural_queries`      | Languages covered by current bundled query templates                                        |
| `languages_with_custom_queries`          | Languages with queries added or overridden via `--add-query` or `--language-config`         |
| `module_only_file_counts`                | Languages where the grammar is loadable but no structural query exists, producing only Module nodes |
| `known_unsupported_file_counts`          | Languages that are known to exist but have not entered the AST pipeline at all              |
| `configured_but_unavailable_file_counts` | Languages that the agent explicitly requested support for, but no parser is available in the current environment |
| `custom_language_config_paths`           | Paths of explicit language configuration files actually loaded in this run; empty in pure CLI mode |

---

## raw/git_stats.json (produced by git_detective.py)

```json
{
  "analysis_period_days": 90,
  "stats": {
    "total_commits": 42,
    "total_authors": 1
  },
  "hotspots": [
    {"path": "src/nexus/tasks/analysis_tasks.py", "changes": 21, "risk": "high"}
  ],
  "coupling_pairs": [
    {"file_a": "...", "file_b": "...", "co_changes": 5, "coupling_score": 0.71}
  ]
}
```

**Risk thresholds**: `changes < 5` → `low` / `5–15` → `medium` / `> 15` → `high`

---

## Generated Markdown File Headers

`INDEX.md`, `arch/*.md`, `concepts/domains.md`, and `hotspots/git_forensics.md` must include at minimum:

```markdown
> generated_by: nexus-mapper v2
> verified_at: 2026-03-07
> provenance: AST-backed except where explicitly marked inferred
```

If language degradation or manual inference exists, `provenance` must be expanded:

```markdown
> provenance: AST-backed for Python; some custom DSL files were detected but not parsed by bundled AST tooling, so the affected dependency notes below are inferred from file tree and manual inspection.
```

---

## concepts/concept_model.json — Schema V1

Schema V1 uses only `label` as the human-readable name field; do not introduce an additional `title` field. If `title` appears, it is considered non-standard and should be removed.

```json
{
  "$schema": "nexus-mapper/concept-model/v1",
  "generated_at": "2026-03-05T15:00:00Z",
  "repo_path": "/absolute/path/to/repo",
  "generator": "nexus-mapper v2",
  "nodes": [
    {
      "id": "nexus.ast-extractor",
      "type": "System",
      "label": "AST Extractor",
      "responsibility": "Uses Tree-sitter to parse Python repositories, extracting module/class/function nodes and import relationships, outputting machine-readable JSON",
      "implementation_status": "implemented",
      "code_path": "src/nexus/application/weaving/",
      "evidence_path": null,
      "evidence_gap": null,
      "tech_stack": ["tree-sitter", "python"],
      "related_reqs": ["REQ-101"],
      "complexity": "medium",
      "hotspot": true
    }
  ],
  "edges": [
    {
      "source": "nexus.ast-extractor",
      "target": "nexus.task-dispatcher",
      "type": "depends_on",
      "description": "Optional description"
    }
  ],
  "metadata": {
    "total_files": 101,
    "total_lines": 23184,
    "languages": ["python"],
    "git_commits_analyzed": 42,
    "analysis_days": 90
  }
}
```

### Node Field Validation Rules

| Field                   | Required | Conditions that trigger `[!ERROR]`                                                          |
| ----------------------- | :------: | ------------------------------------------------------------------------------------------- |
| `id`                    |   Yes    | Global duplicate; contains uppercase letters or spaces (must be kebab-case lowercase)       |
| `type`                  |   Yes    | Not in the enum `System / Domain / Module / Class / Function`                               |
| `label`                 |   Yes    | Empty string                                                                                |
| `title`                 |    No    | Schema V1 does not define this field; if present, it is considered extraneous                |
| `responsibility`        |   Yes    | Too vague to verify; word count < 10 or > 120                                               |
| `implementation_status` |   Yes    | Not in the enum `implemented / planned / inferred`                                          |
| `code_path`             | Conditional | `implementation_status=implemented` but empty; or path does not actually exist in the repo  |
| `evidence_path`         | Conditional | `implementation_status=planned/inferred` but empty; or path does not actually exist in the repo |
| `evidence_gap`          | Conditional | `implementation_status=planned/inferred` but empty                                         |

### Node Status Representation

**Implemented Node**
```json
{
  "implementation_status": "implemented",
  "code_path": "src/server/",
  "evidence_path": null,
  "evidence_gap": null
}
```

**Planned Node**
```json
{
  "implementation_status": "planned",
  "code_path": null,
  "evidence_path": "docs/architecture.md",
  "evidence_gap": "Design documents mention Monarch/Executor, but src/agents/monarch/ was not found in the repository"
}
```

**Inferred Node**
```json
{
  "implementation_status": "inferred",
  "code_path": null,
  "evidence_path": "docs/architecture.md",
  "evidence_gap": "The repository contains currently unsupported DSL files; this boundary is derived from the file tree and manual inspection"
}
```

---

## query_graph.py Output Format Reference (stdout, not written to file)

### --file

```
=== <file_path> ===
Module: <module_id> (<lines> lines, <lang>)

Classes:
  <ClassName> (L<start>-L<end>)
    ├─ <method_name> (L<start>-L<end>)
    └─ <method_name> (L<start>-L<end>)

Top-level Functions:
  <func_name> (L<start>-L<end>)

Imports:
  → <internal_module> (<path>)
  → <external_package> (external)
```

### --who-imports

```
=== Who imports <module>? ===
Imported by N module(s):
  ← <module_id> (<path>)
```

### --impact

```
=== Impact radius: <file_path> ===

Depends on (this file imports):
  → <module_id> (<path>)

Depended by (other files import this):
  ← <module_id> (<path>)

Impact summary: N upstream dependencies, M downstream dependents

# The following is only output when --git-stats is provided and the file has hotspot/coupling data
Git risk: high (N changes in 90 days)
Coupled files (co-change):
  - <peer_path> (coupling: 0.XX, N co-changes)
```

### --hub-analysis

```
=== Hub Analysis ===

Top fan-in (most imported by others):
  1. <module_id> — imported by N module(s)  [<path>]

Top fan-out (imports most others):
  1. <module_id> — imports N internal module(s)  [<path>]
```

### --summary

```
=== Directory Summary ===

<dir>/ (N modules, N classes, N functions, N lines)
  Key classes: ClassA, ClassB, ...
  Key imports from: <other_dir>, ...
```
