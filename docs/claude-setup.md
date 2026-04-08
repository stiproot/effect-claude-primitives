# Claude Code Setup Guide

This guide shows how to configure Effect patterns for Claude Code.

## Quick Start

### Option 1: CLI Installer with Starter Preset (Recommended)

```bash
# Install package
npm install -D effect-claude-primitives

# Install recommended starter categories (~256KB)
npx effect-claude-primitives --starter
```

This installs 6 essential categories optimized for getting started with Effect.

### Option 2: CLI with Custom Categories

```bash
# List available categories
npx effect-claude-primitives --list

# Install specific categories
npx effect-claude-primitives --categories=core-concepts,error-management,testing
```

### Option 3: Manual Installation

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .claude/rules

# Copy specific category files (30-66KB each)
cp node_modules/effect-claude-primitives/rules/by-category/core-concepts.md .claude/rules/
cp node_modules/effect-claude-primitives/rules/by-category/error-management.md .claude/rules/
cp node_modules/effect-claude-primitives/rules/by-category/testing.md .claude/rules/
```

## Configuration Methods

### Method 1: Category-Based Rules (Recommended)

After running the CLI, you'll have multiple category files:

```
my-project/
├── .claude/
│   └── rules/
│       ├── core-concepts.md       (66KB)
│       ├── error-management.md    (35KB)
│       ├── testing.md             (37KB)
│       ├── building-apis.md       (53KB)
│       ├── concurrency.md         (62KB)
│       └── getting-started.md     (3KB)
└── CLAUDE.md
```

Claude Code automatically loads all `.md` files from `.claude/rules/`.

### Method 2: Reference in CLAUDE.md (Optional)

Create or edit `CLAUDE.md` in your project root:

```markdown
# Project Instructions

Effect-TS patterns are available in `.claude/rules/` - Claude automatically loads them.

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

### With --starter (Recommended)

Installs 6 essential categories (~256KB total) to `.claude/rules/`:

- **Core Concepts** (66KB) - Effect.gen, pipe, map, flatMap, Option, Either
- **Error Management** (35KB) - catchTag/catchAll, retry, Cause
- **Testing** (37KB) - Mock layers, testing services, property-based testing
- **Building APIs** (53KB) - HTTP APIs, routing, middleware, authentication
- **Concurrency** (62KB) - Parallel execution, fibers, Deferred, Semaphore
- **Getting Started** (3KB) - New Effect projects, first programs

### With --categories

Installs only the categories you specify.

### With --all

Installs all 24 categories (816KB total) - may impact Claude Code performance.

**Performance Note**: Claude Code recommends individual files under 40KB. The category-based approach keeps files within this limit.

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
