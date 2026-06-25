# Cursor IDE Setup Guide

This guide shows how to configure Effect patterns for Cursor IDE.

## Quick Start

Cursor does not consume Claude Code skills. The CLI installs skills for Claude Code
under `.claude/skills/`; for Cursor, copy the pattern content from a skill's
`references/` directory into a Cursor rules file as shown below.

### Manual Installation

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .cursor/rules

# Copy a skill's reference content into a Cursor rules file
cat node_modules/effect-claude-primitives/skills/effect-error-handling/references/*.md \
   > .cursor/rules/effect-patterns.md
```

## Cursor Configuration

Cursor reads rules from `.cursor/rules/` directory.

### File Structure

```
my-project/
├── .cursor/
│   └── rules/
│       └── effect-patterns.md  ← Cursor reads this
└── package.json
```

## Using .mdc Files (Cursor Rules Format)

Cursor supports `.mdc` files with metadata:

```markdown
---
description: "Effect error management patterns"
globs: "**/*.ts, **/*.tsx"
alwaysApply: false
---

# Effect Error Management

[Rules content...]
```

Build a `.mdc` file from a skill's reference content:

```bash
cat node_modules/effect-claude-primitives/skills/effect-error-handling/references/*.md \
   > .cursor/rules/effect-error-handling.mdc
# then add the .mdc frontmatter shown above to the top of the file
```

## Picking Skills

The pattern content lives in the skill directories under
`node_modules/effect-claude-primitives/skills/`. Each skill's `references/`
directory holds the full patterns for one topic – `effect-core-concepts`,
`effect-error-handling`, `effect-concurrency`, `effect-testing`, and so on.

Copy only the topics relevant to your current work:

```bash
# Core concepts
cat node_modules/effect-claude-primitives/skills/effect-core-concepts/references/*.md \
   > .cursor/rules/effect-core-concepts.md

# Error handling
cat node_modules/effect-claude-primitives/skills/effect-error-handling/references/*.md \
   > .cursor/rules/effect-error-handling.md
```

See [README.md](../README.md#available-skills) for the full list of skills.

## Verifying Installation

1. Open Cursor IDE
2. Check `.cursor/rules/` directory contains the rules files
3. Open a TypeScript file
4. Start typing Effect code - Cursor should suggest patterns from the rules

## Tips

- **Topic-Specific**: Copy only the skills relevant to your current work for focused assistance
- **Customize**: Edit files in `.cursor/rules/` to match your project conventions

## Troubleshooting

### Rules not being applied

1. Check files exist in `.cursor/rules/`
2. Ensure `.md` or `.mdc` extension
3. Reload Cursor window (Cmd/Ctrl + Shift + P → "Reload Window")

### Too many suggestions

Copy fewer skills or use `.mdc` files with `alwaysApply: false` to make rules contextual.

## Next Steps

- Explore [available skills](../README.md#available-skills)
- See [customization guide](../README.md#customization)
