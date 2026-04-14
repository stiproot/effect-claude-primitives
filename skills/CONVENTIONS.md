# Skill Conventions

## Frontmatter schema

Every `SKILL.md` must include the following frontmatter:

```yaml
---
name: <kebab-case-name>
description: <one-line description — used by the IDE/agent to decide when to activate the skill>
source-rules:
  - <rule-file.md>   # files under rules/by-category/ that this skill is derived from
---
```

The `source-rules` field creates a traceable dependency graph between skills and rules. When a rule is updated, all skills listing it in `source-rules` should be reviewed and updated to stay in sync.

## Rules vs skills

| | Rules | Skills |
|---|---|---|
| **Purpose** | Comprehensive reference — all variants, edge cases, context | Task-scoped distillation — "how do I build X?" |
| **Location** | `rules/by-category/<name>.md` | `skills/<name>/SKILL.md` |
| **Scope** | Broad topic coverage | Single, concrete task |
| **Content** | All patterns for a domain | Minimal patterns needed for the task, with actionable scaffolding |

Skills do not duplicate rule content — they reference the relevant subset and add task-specific scaffolding (directory layout, bootstrap code, wiring).

## Naming

Skill directories use kebab-case and should reflect the task, not the technology:

- `effect-mcp-server` — building an MCP server
- `effect-service-pattern` — implementing a service
- `effect-http-api` — building an HTTP API

## Update process

1. Update the rule (`rules/by-category/<name>.md`) — this is the source of truth.
2. Find all skills with that rule in `source-rules`.
3. Review whether the skill's patterns are still current and update accordingly.
