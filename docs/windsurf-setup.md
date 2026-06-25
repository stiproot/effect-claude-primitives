# Windsurf IDE Setup Guide

This guide shows how to configure Effect patterns for Windsurf IDE.

Windsurf does not consume Claude Code skills. The CLI installs skills for Claude Code
under `.claude/skills/`; for Windsurf, copy the pattern content from a skill's
`references/` directory into a Windsurf rules file.

## Quick Start

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .windsurf/rules

# Copy a skill's reference content into a Windsurf rules file
cat node_modules/effect-claude-primitives/skills/effect-error-handling/references/*.md \
   > .windsurf/rules/effect-patterns.md
```

## Windsurf Configuration

Windsurf reads rules from `.windsurf/rules/` directory.

### File Structure

```
my-project/
├── .windsurf/
│   └── rules/
│       └── effect-patterns.md  ← Windsurf reads this
└── package.json
```

## Using .mdc Files (Windsurf Rules Format)

Windsurf supports `.mdc` files with metadata (similar to Cursor):

```markdown
---
description: "Effect error management patterns"
globs: "**/*.ts, **/*.tsx"
alwaysApply: false
---

# Effect Error Management

[Rules content...]
```

## Installation Options

Pick the skills relevant to your work and copy their `references/` content into
`.windsurf/rules/`. Each skill covers one topic.

```bash
# Core concepts
cat node_modules/effect-claude-primitives/skills/effect-core-concepts/references/*.md \
   > .windsurf/rules/effect-core-concepts.md

# Error handling
cat node_modules/effect-claude-primitives/skills/effect-error-handling/references/*.md \
   > .windsurf/rules/effect-error-handling.md

# Concurrency
cat node_modules/effect-claude-primitives/skills/effect-concurrency/references/*.md \
   > .windsurf/rules/effect-concurrency.md
```

See [README.md](../README.md#available-skills) for all 17 skills.

## Suggested Order

```bash
# Start with the fundamentals
cat node_modules/effect-claude-primitives/skills/effect-getting-started/references/*.md \
   > .windsurf/rules/effect-getting-started.md
cat node_modules/effect-claude-primitives/skills/effect-core-concepts/references/*.md \
   > .windsurf/rules/effect-core-concepts.md

# Then error handling, concurrency, testing, and more as needed
```

## Verifying Installation

1. Open Windsurf IDE
2. Check `.windsurf/rules/` contains rule files
3. Open a TypeScript file
4. Start coding - Windsurf should provide Effect-aware suggestions

Test: Type `Effect.gen` and Windsurf should suggest proper Effect generator patterns.

## Tips

- **Topic-Specific**: Copy only the skills relevant to your current work
- **Customize**: Edit files in `.windsurf/rules/` to match your project

## Troubleshooting

### Rules not being applied

1. Verify files exist in `.windsurf/rules/`
2. Check file extensions (`.md` or `.mdc`)
3. Reload Windsurf window
4. Try adding more code context

### Too many suggestions

- Copy fewer skills
- Use `.mdc` format with `alwaysApply: false`
- Edit files to keep only most relevant patterns

### Conflicting with project conventions

Edit the rule files in `.windsurf/rules/` to align with your project's specific conventions and architecture.

## Customization Example

Add project-specific rules to the installed files:

```markdown
# Effect Patterns

[Generated patterns...]

---

# Project-Specific Rules

## Our Conventions

- Services in `src/services/`
- Errors in `src/errors/`
- Layers composed in `src/layers/index.ts`
- All effects run through `src/runtime.ts`

## Testing

- Test files: `*.test.ts`
- Mock layers: `tests/mocks/`
- Use TestContext for all tests
```

## Next Steps

- Explore [available skills](../README.md#available-skills)
- Learn about [customization](../README.md#customization)
