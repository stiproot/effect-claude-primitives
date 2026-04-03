# Claude Code Setup Guide

This guide shows how to configure Effect patterns for Claude Code.

## Quick Start

### Option 1: CLI Installer (Recommended)

```bash
# Install package
npm install -D effect-claude-primitives

# Install rules
npx effect-claude-kit install --target claude --level beginner
```

### Option 2: Manual Installation

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .claude/rules

# Copy rules
cp node_modules/effect-claude-primitives/rules/by-skill-level/beginner.md \
   .claude/rules/effect-patterns.md
```

## Configuration Methods

### Method 1: Direct Rules File

Create `.claude/rules/effect-patterns.md`:

```
my-project/
├── .claude/
│   └── rules/
│       └── effect-patterns.md  ← Claude reads this automatically
└── CLAUDE.md
```

Claude Code will automatically load rules from any `.md` files in `.claude/rules/`.

### Method 2: Reference in CLAUDE.md

Create or edit `CLAUDE.md` in your project root:

```markdown
# Project Instructions

For Effect-TS patterns, see `.claude/rules/effect-patterns.md`

## Architecture
[Your architecture description]

## Conventions
[Your coding conventions]
```

### Method 3: Skills (Advanced)

Copy the Effect service pattern skill:

```bash
mkdir -p .claude/skills/effect-service-pattern
cp node_modules/effect-claude-primitives/skills/effect-service-pattern/SKILL.md \
   .claude/skills/effect-service-pattern/
```

## Progressive Learning

Start with beginner rules and progressively add more:

```bash
# 1. Start with beginner
npx effect-claude-kit install --target claude --level beginner

# 2. Add intermediate when comfortable
npx effect-claude-kit install --target claude --level intermediate

# 3. Add advanced patterns
npx effect-claude-kit install --target claude --level advanced

# 4. Or install everything
npx effect-claude-kit install --target claude --level complete
```

## Category-Specific Rules

Install only rules for specific topics:

```bash
# Error handling
npx effect-claude-kit install --target claude --category error-management

# Concurrency
npx effect-claude-kit install --target claude --category concurrency

# Schema validation
npx effect-claude-kit install --target claude --category schema
```

See [README.md](../README.md) for the complete list of categories.

## Verifying Installation

After installation, Claude Code should recognize Effect patterns when:
- Writing new Effect code
- Reviewing existing code
- Suggesting improvements

Test by asking Claude to "create an Effect service" - it should follow the patterns.

## Troubleshooting

### Rules not loading

1. Check that files exist in `.claude/rules/` or `.claude/skills/`
2. Ensure files are valid Markdown (`.md` extension)
3. Restart Claude Code

### Rules conflicting with project conventions

You can customize the rules by editing the files in `.claude/rules/` to match your project needs.

## Next Steps

- Read [progressive learning path](../README.md#progressive-learning-path)
- See [CLI commands reference](../README.md#cli-commands-reference)
- Explore [customization options](../README.md#customization)
