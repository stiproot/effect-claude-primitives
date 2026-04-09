# Windsurf IDE Setup Guide

This guide shows how to configure Effect patterns for Windsurf IDE.

## Quick Start

### Option 1: CLI Installer (Recommended)

```bash
# Install package
npm install -D effect-claude-primitives

# Install rules
npx effect-claude-kit install --target windsurf --level beginner
```

### Option 2: Manual Installation

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .windsurf/rules

# Copy rules
cp node_modules/effect-claude-primitives/rules/by-skill-level/beginner.md \
   .windsurf/rules/effect-patterns.md
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

### By Skill Level

```bash
# Beginner (recommended for learning)
npx effect-claude-kit install --target windsurf --level beginner

# Intermediate
npx effect-claude-kit install --target windsurf --level intermediate

# Advanced
npx effect-claude-kit install --target windsurf --level advanced

# Complete (all patterns)
npx effect-claude-kit install --target windsurf --level complete
```

### By Category

Install specific categories:

```bash
# Core concepts
npx effect-claude-kit install --target windsurf --category core-concepts

# Error management
npx effect-claude-kit install --target windsurf --category error-management

# Concurrency
npx effect-claude-kit install --target windsurf --category concurrency

# Schema validation
npx effect-claude-kit install --target windsurf --category schema
```

See [README.md](../README.md#available-categories) for all 25 categories.

## Progressive Learning Path

Recommended approach:

```bash
# Week 1: Core concepts and getting started
npx effect-claude-kit install --target windsurf --category getting-started
npx effect-claude-kit install --target windsurf --category core-concepts

# Week 2: Error handling
npx effect-claude-kit install --target windsurf --category error-management

# Week 3: Concurrency
npx effect-claude-kit install --target windsurf --category concurrency

# Week 4: Testing
npx effect-claude-kit install --target windsurf --category testing

# Later: Add more categories as needed
```

## Verifying Installation

1. Open Windsurf IDE
2. Check `.windsurf/rules/` contains rule files
3. Open a TypeScript file
4. Start coding - Windsurf should provide Effect-aware suggestions

Test: Type `Effect.gen` and Windsurf should suggest proper Effect generator patterns.

## Tips

- **Category-Specific**: Install only categories relevant to your current work
- **Progressive**: Start with beginner or getting-started, add more as you learn
- **Customize**: Edit files in `.windsurf/rules/` to match your project

## Troubleshooting

### Rules not being applied

1. Verify files exist in `.windsurf/rules/`
2. Check file extensions (`.md` or `.mdc`)
3. Reload Windsurf window
4. Try adding more code context

### Too many suggestions

- Install fewer categories
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

- Explore [available categories](../README.md#available-categories)
- Read [progressive learning path](../README.md#progressive-learning-path)
- See [CLI commands reference](../README.md#cli-commands-reference)
- Learn about [customization](../README.md#customization)
