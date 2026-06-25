# Skill Conventions

## Why skills, not eagerly-loaded rules

This plugin ships Effect-TS patterns as **skills** that load progressively, not
as a flat pile of rules that load all at once. The distinction matters: an agent
that auto-loads every pattern file on startup spends its whole context budget
before the user has typed anything – with this corpus (~50k lines) that means
out-of-memory at init. Skills avoid that by loading in three stages:

1. **Always loaded** – each skill's `name` + `description` only (~2 lines).
2. **On trigger** – the `SKILL.md` body, once the description matches the task.
3. **On demand** – files under the skill's `references/`, opened only when the
   `SKILL.md` points the reader at them for depth.

So the always-loaded cost is ~17 short descriptions instead of the entire corpus.
The full patterns are never lost – they live verbatim in `references/`, one hop away.

## Anatomy of a skill

```
skills/<skill-name>/
├── SKILL.md            # required: lean, task-scoped guide
└── references/         # the full pattern content, loaded on demand
    └── <topic>.md
```

`SKILL.md` is a router plus a mental model plus a few canonical inline snippets –
the 80% case a reader needs without opening anything else. The exhaustive pattern
set lives in `references/`, indexed from the SKILL.md "Pattern reference" section.

`effect-service-pattern` is the one curated exception: it is hand-written guidance
with no `references/` dir, and points at sibling skills for depth.

## Frontmatter schema

Every `SKILL.md` must include:

```yaml
---
name: <kebab-case-name>
description: <what the skill provides AND the contexts/phrases that should
  trigger it — this is the only text always in context and the sole trigger
  signal, so make it specific and a little pushy>
source-rules:
  - <topic>.md   # the reference file(s) under this skill's references/ dir
---
```

`source-rules` lists the reference filenames bundled in this skill. It creates a
traceable link between the skill and the pattern content it is built from: when a
reference file changes, the `SKILL.md` that fronts it should be reviewed to stay
in sync.

## Naming

Skill directories use kebab-case and reflect the task, not the technology:

- `effect-mcp-server` – building an MCP server
- `effect-service-pattern` – implementing a service
- `effect-http-api` – building an HTTP API

## The master reference

`rules/effect-patterns-rules.md` is an auto-generated, alphabetical compendium of
every pattern (produced upstream by the `ep` tool from `content/published/rules`).
It is a deep appendix – no skill auto-loads it, and it is regenerated upstream, so
it is not hand-edited. The per-skill `references/` files are the content a reader
actually navigates to; the master file is a fallback index across the whole corpus.

## Update process

1. Update the pattern content in the owning skill's `references/<topic>.md`.
2. Find the `SKILL.md` whose `source-rules` lists that file.
3. Review whether the SKILL.md's inline snippets, mental model, and pattern index
   are still accurate, and update them to match.
