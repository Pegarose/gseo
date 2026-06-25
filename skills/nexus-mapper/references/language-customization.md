# Adding Language Support to nexus-mapper

> This file is not a stage-gated file. When built-in language coverage is insufficient, downstream agents should refer to this file first and supplement support via command-line arguments; only when the configuration is complex should an explicit JSON configuration file be used.

---

## Goal

The current script's default model is:

1. First use built-in extension mappings and built-in Tree-sitter queries
2. If built-in coverage is insufficient, agents supplement language support via command-line arguments
3. If there are too many command-line arguments or the query is too long, fall back to `--language-config <JSON_FILE>`

This means:
- A fixed-path language configuration file is not required to exist in the repository
- Modifying core scripts for a single repository's one-off analysis is not recommended
- A newly onboarded agent can integrate additional languages into the analysis pipeline in a single command

---

## Preferred Approach: Command-Line Supplementation

### Applicable Scenarios

Use command-line arguments when all of the following conditions are met:

- The repository contains extensions not covered by built-in mappings
- Only 1 to 3 language mappings need to be added
- The query is short enough to be written directly on the command line

### Step 1: Confirm the Language Name

First confirm the language name recognized by `tree-sitter-language-pack` or the current environment. For example:

- `.templ` -> `templ`
- `.hbs` -> `handlebars`
- `.rego` -> `rego`

If the language name is uncertain, look up the official grammar name first; do not guess a language name and write it into the final conclusion.

### Step 2: Add Extension Mappings

```bash
python extract_ast.py <repo_path> \
  --add-extension .templ=templ \
  --add-extension .hbs=handlebars
```

This brings previously unrecognized extensions into the language dispatch pipeline.

### Step 3: Add Queries as Needed

If only Module-level coverage is needed, you can stop here.

If class/function-level structure is needed, add `--add-query`:

```bash
python extract_ast.py <repo_path> \
  --add-extension .templ=templ \
  --add-query templ struct "(component_declaration name: (identifier) @class.name) @class.def"
```

Argument format:

```text
--add-query <LANG> <TYPE> <QUERY_STRING>
```

Where:
- `<LANG>`: Language name, e.g. `templ`
- `<TYPE>`: `struct` or `imports`
- `<QUERY_STRING>`: Tree-sitter query string

Capture naming must continue to follow existing conventions:
- Class: `@class.def` / `@class.name`
- Function: `@func.def` / `@func.name`
- Import: `@mod`

---

## Alternative Approach: Explicit JSON Configuration File

Use `--language-config` when any of the following conditions are true:

- Multiple languages need to be added and the command line is already too long
- The query is complex and not suitable for inlining in a shell command
- You want to consolidate all extension mappings and queries needed for a single analysis

Example:

```json
{
  "extensions": {
    ".templ": "templ",
    ".hbs": "handlebars"
  },
  "queries": {
    "templ": {
      "struct": "(component_declaration name: (identifier) @class.name) @class.def",
      "imports": ""
    }
  },
  "unsupported_extensions": {
    ".legacydsl": "legacydsl"
  }
}
```

Usage:

```bash
python extract_ast.py <repo_path> --language-config /custom/path/to/language-config.json
```

Notes:
- `extensions`: Mapping from file extensions to language names
- `queries`: Custom `struct` / `imports` queries
- `unsupported_extensions`: Explicitly declared extensions that are still unsupported, to avoid silent skipping

The JSON file here is an explicit input for a single analysis run and is not required to be placed at a fixed default location within the repository.

---

## Coverage Honesty Rules

Whether using command-line arguments or an explicit JSON file, all newly added languages must follow the same tiered standard:

1. `structural coverage`
   Condition: Parser can be loaded and a `struct` query exists

2. `module-only coverage`
   Condition: Parser can be loaded but no `struct` query exists

3. `configured-but-unavailable`
   Condition: The agent explicitly requested support for this language, but the current environment cannot load the parser

4. `unsupported`
   Condition: The language has not been included in the current AST pipeline, or has been explicitly marked as unsupported

Prohibited:
- Reporting `configured-but-unavailable` as `module-only`
- Disguising `unsupported` as "not present in the repository"

---

## Recommended Decision Order

When a downstream agent encounters an uncovered language, process in the following order:

1. First confirm whether files with that extension actually exist in the current repository
2. Then confirm whether the current environment can load the corresponding parser
3. If the parser can be loaded: prefer `--add-extension`; add `--add-query` only when structural nodes are needed
4. If the command is too long: switch to `--language-config`
5. If the parser cannot be loaded: keep `configured-but-unavailable`, do not fabricate results

---

## Design Principles

- Built-in languages first, command-line supplementation second, explicit JSON last
- For a single analysis, prefer the minimal additional input; do not modify core scripts first
- Custom queries are formal input, not a bypass hack
- All newly added languages must follow the same metadata and provenance rules
