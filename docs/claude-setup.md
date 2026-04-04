# Claude Code Setup Guide

This guide shows how to configure Effect patterns for Claude Code.

## Quick Start

### Option 1: CLI Installer (Recommended)

```bash
# Install package
npm install -D effect-claude-primitives

# Install complete Effect patterns
npx effect-claude-primitives
```

### Option 2: Manual Installation

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .claude/rules

# Copy complete rules (700+ patterns)
cp node_modules/effect-claude-primitives/rules/effect-patterns-rules.md \
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

## What Gets Installed

The CLI installs the complete Effect patterns ruleset (797KB, 700+ patterns) to `.claude/rules/effect-patterns.md`.

This includes all Effect patterns across all topics:
- Core concepts and fundamentals
- Error management and resilience
- Concurrency and parallel execution
- Schema validation
- Streams and data processing
- Testing patterns
- And much more...

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

- Start coding with Effect - Claude will use these comprehensive patterns
- Explore [customization options](../README.md#customization) to adapt rules to your project
- Check [available categories](../README.md#available-categories) to see what's covered
