# Claude Code Setup Guide

This guide shows how to configure Effect patterns for Claude Code.

Effect patterns ship as skills. Claude Code loads each skill on demand – only the
skill's name and description sit in context until the skill's description matches the
task, at which point its `SKILL.md` body and referenced files are pulled in. Skills
install into `.claude/skills/`, not `.claude/rules/`; files under `.claude/rules/` are
auto-loaded in full on every session, which is exactly what skills avoid.

## Quick Start

### Option 1: CLI Installer with Starter Preset (Recommended)

```bash
# Install package
npm install -D effect-claude-primitives

# Install the recommended starter skills
npx effect-claude-primitives --starter
```

This installs 6 essential skills for getting started with Effect.

### Option 2: CLI with Custom Skills

```bash
# List available skills
npx effect-claude-primitives --list

# Install specific skills
npx effect-claude-primitives --skills effect-core-concepts,effect-error-handling,effect-testing
```

### Option 3: Manual Installation

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .claude/skills

# Copy whole skill directories (SKILL.md + references/)
cp -R node_modules/effect-claude-primitives/skills/effect-core-concepts .claude/skills/
cp -R node_modules/effect-claude-primitives/skills/effect-error-handling .claude/skills/
cp -R node_modules/effect-claude-primitives/skills/effect-testing .claude/skills/
```

## Configuration

### Skill Layout

After running the CLI, you'll have one directory per skill:

```
my-project/
├── .claude/
│   └── skills/
│       ├── effect-getting-started/
│       │   ├── SKILL.md
│       │   └── references/
│       ├── effect-core-concepts/
│       ├── effect-service-pattern/
│       ├── effect-error-handling/
│       ├── effect-concurrency/
│       └── effect-testing/
└── CLAUDE.md
```

Claude Code discovers these skills automatically and triggers each one when its
description matches the task.

### Optional: Reference in CLAUDE.md

Create or edit `CLAUDE.md` in your project root:

```markdown
# Project Instructions

Effect-TS patterns are available as skills under `.claude/skills/` - Claude loads each one on demand.

## Architecture
[Your architecture description]

## Conventions
[Your coding conventions]
```

## What Gets Installed

### With --starter (Recommended)

Installs 6 essential skills into `.claude/skills/`:

- **effect-getting-started** - First steps, running effects, project bootstrap
- **effect-core-concepts** - Effect.gen, pipe, map/flatMap, Option, Either, Layers
- **effect-service-pattern** - Effect.Service, Context.Tag, dependency injection
- **effect-error-handling** - catchTag/catchAll, retry, timeouts, Cause
- **effect-concurrency** - Fibers, parallel execution, Ref, Deferred, Semaphore
- **effect-testing** - Mock layers, TestClock, property-based testing

### With --skills

Installs only the skills you specify.

### With --all

Installs all 17 skills. Because skills load on demand, installing every skill does not
add upfront context cost.

## Verifying Installation

After installation, Claude Code should recognize Effect patterns when:
- Writing new Effect code
- Reviewing existing code
- Suggesting improvements

Test by asking Claude to "create an Effect service" - it should trigger the
`effect-service-pattern` skill and follow its patterns.

## Troubleshooting

### Skills not loading

1. Check that skill directories exist under `.claude/skills/` and each has a `SKILL.md`
2. Restart Claude Code
3. Ask Claude directly about a topic the skill covers to confirm it triggers

### Skills conflicting with project conventions

You can customize a skill by editing the files in its `.claude/skills/<skill>/`
directory to match your project needs.

## Next Steps

- Start coding with Effect - Claude will trigger the relevant skill automatically
- Explore [customization options](../README.md#customization) to adapt skills to your project
- Check [available skills](../README.md#available-skills) to see what's covered
