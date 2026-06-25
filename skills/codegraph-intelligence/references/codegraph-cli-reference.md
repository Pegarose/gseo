# Reference: codegraph CLI Quick Reference

## Installation

```bash
npm i -g codegraph
```

## Project Setup

```bash
# Initialize and index (run once)
codegraph init -i

# Check status
codegraph status --json

# Sync after changes
codegraph sync

# Remove from project
codegraph uninit
```

## Query Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `query` | Search symbols by name | `codegraph query "route" --json` |
| `callers` | Find who calls a symbol | `codegraph callers "buildExecutionPolicy" --json` |
| `callees` | Find what a symbol calls | `codegraph callees "route" --json` |
| `impact` | Analyze change impact | `codegraph impact "route" --json` |
| `affected` | Find affected tests | `codegraph affected src/lib/route.js --json` |
| `files` | Show indexed file tree | `codegraph files --json` |

## Output Fields

```json
{
  "node": {
    "id": "function:...",
    "kind": "function",
    "name": "route",
    "qualifiedName": "route",
    "filePath": "src/commands/route.js",
    "language": "javascript",
    "startLine": 4,
    "endLine": 37,
    "signature": "(args, flags)",
    "isAsync": true,
    "isExported": false
  },
  "score": 113.14
}
```

## Status Output

```json
{
  "initialized": true,
  "fileCount": 237,
  "nodeCount": 2175,
  "edgeCount": 3935,
  "pendingChanges": { "added": 0, "modified": 12, "removed": 0 }
}
```

## CapInt Integration Pattern

This skill is activated by CapInt routing when the intent matches keywords:
- `codegraph`, `semantik arama`, `symbol query`
- `kim çağırıyor`, `affected tests`, `impact analysis`

The skill runs CLI commands and returns structured results. It does NOT modify CapInt core.
