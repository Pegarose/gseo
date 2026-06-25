# Skill: codegraph-intelligence (v1.0.0)

## Dependencies

- `prismx-skill-gateway` (optional): For cross-repo symbol navigation
- `systematic-debugging` (optional): When query results indicate bug patterns

## Purpose

Use codegraph CLI for semantic code intelligence when the user asks about:
- Finding where a symbol is defined or used
- Understanding call graphs and dependencies
- Identifying affected tests after code changes
- Exploring codebase structure beyond file-level search

## When to Activate

Activate when the user mentions:
- "where is X defined", "who calls X", "X kullanımı"
- "affected tests", "what breaks if I change X"
- "codegraph", "semantik arama", "symbol query"
- Exploring unfamiliar code paths or large refactors

## Prerequisites

- `codegraph` CLI installed: `npm i -g codegraph`
- Project indexed: `codegraph init -i` (run once per project)
- Index kept fresh: `codegraph sync` (after significant changes)

## Commands

### Query symbols by name

```bash
codegraph query "functionName" --json
codegraph query "className.methodName" --json
```

### Find callers of a symbol

```bash
codegraph callers "symbolName" --json
```

### Analyze impact of changing a symbol

```bash
codegraph impact "symbolName" --json
```

### Find affected tests after file changes

```bash
codegraph affected src/lib/route-engine.js src/lib/intent-parser.js --json
```

### Check index status

```bash
codegraph status --json
```

### Sync index after changes

```bash
codegraph sync
```

## Integration with CapInt Routing

This skill does NOT modify CapInt core. It is a standalone skill that:

1. Receives the routed intent (e.g., "who calls buildExecutionPolicy")
2. Extracts the symbol name from the intent
3. Runs `codegraph query` or `codegraph callers`
4. Returns structured results to the agent

## Workflow

1. **Check availability**: `codegraph --version`
2. **Check status**: `codegraph status --json` (verify initialized)
3. **Run query**: Based on intent, choose `query` / `callers` / `impact` / `affected`
4. **Present results**: Show file paths, line numbers, and relevance scores
5. **Suggest sync**: If status shows pending changes, suggest `codegraph sync`

## Output Format

JSON results contain:
- `node.kind`: function | class | method | variable | import
- `node.name`: symbol name
- `node.filePath`: source file
- `node.startLine` / `node.endLine`: location
- `score`: relevance (higher = better match)

## Examples

### Example 1: Find where a function is defined

User: "buildExecutionPolicy nerede tanımlı?"

```bash
codegraph query "buildExecutionPolicy" --json
```

Result: `src/lib/execution-policy.js:52`

### Example 2: Find callers before refactoring

User: "refactor etmeden önce kimler çağırıyor bu fonksiyonu?"

```bash
codegraph callers "buildExecutionPolicy" --json
```

Result: `src/lib/route-engine.js`, `src/commands/route.js`

### Example 3: Affected tests after change

User: "route-engine.js değiştirdim, hangi testler etkilenir?"

```bash
codegraph affected src/lib/route-engine.js --json
```

## Notes

- codegraph is a **sidecar tool**, not a CapInt dependency
- CapInt routing remains unchanged; this skill is one of many optional skills
- For graph visualization, use `graphify` (separate skill: `graph-visualization`)
- For memory/context, use `context-memory-bridge` (core skill)
