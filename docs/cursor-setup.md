# Cursor IDE Setup Guide

This guide shows how to configure Effect patterns for Cursor IDE.

## Quick Start

### Option 1: CLI Installer (Recommended)

```bash
# Install package
npm install -D effect-claude-primitives

# Install rules
npx effect-claude-kit install --target cursor --level beginner
```

### Option 2: Manual Installation

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .cursor/rules

# Copy rules
cp node_modules/effect-claude-primitives/rules/by-skill-level/beginner.md \
   .cursor/rules/effect-patterns.md
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

Install category-specific `.mdc` files:

```bash
npx effect-claude-kit install --target cursor --category error-management
npx effect-claude-kit install --target cursor --category concurrency
npx effect-claude-kit install --target cursor --category schema
```

## Skills

Copy the Effect service pattern skill to Cursor:

```bash
mkdir -p .cursor/skills/effect-service-pattern
cp node_modules/effect-claude-primitives/skills/effect-service-pattern/SKILL.md \
   .cursor/skills/effect-service-pattern/
```

## Progressive Learning

```bash
# 1. Beginner rules
npx effect-claude-kit install --target cursor --level beginner

# 2. Intermediate rules
npx effect-claude-kit install --target cursor --level intermediate

# 3. Advanced rules
npx effect-claude-kit install --target cursor --level advanced

# 4. Complete rules
npx effect-claude-kit install --target cursor --level complete
```

## Category-Specific Installation

Install only the categories you need:

```bash
# Core concepts
npx effect-claude-kit install --target cursor --category core-concepts

# Error management
npx effect-claude-kit install --target cursor --category error-management

# Concurrency
npx effect-claude-kit install --target cursor --category concurrency

# Schema validation
npx effect-claude-kit install --target cursor --category schema

# Testing
npx effect-claude-kit install --target cursor --category testing
```

See [README.md](../README.md#available-categories) for all available categories.

## Verifying Installation

1. Open Cursor IDE
2. Check `.cursor/rules/` directory contains the rules files
3. Open a TypeScript file
4. Start typing Effect code - Cursor should suggest patterns from the rules

## Tips

- **Category-Specific**: Install only categories relevant to your current work for focused assistance
- **Progressive**: Start with beginner, add more as you learn
- **Customize**: Edit files in `.cursor/rules/` to match your project conventions

## Troubleshooting

### Rules not being applied

1. Check files exist in `.cursor/rules/`
2. Ensure `.md` or `.mdc` extension
3. Reload Cursor window (Cmd/Ctrl + Shift + P → "Reload Window")

### Too many suggestions

Install fewer categories or use `.mdc` files with `alwaysApply: false` to make rules contextual.

## Next Steps

- Explore [available categories](../README.md#available-categories)
- Read [progressive learning path](../README.md#progressive-learning-path)
- See [customization guide](../README.md#customization)
