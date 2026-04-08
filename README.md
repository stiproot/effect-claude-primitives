# Effect Claude Primitives

700+ Effect-TS patterns as AI-readable rules for Claude Code, Cursor, GitHub Copilot, and Windsurf.

## What's Inside?

- **Category Rules**: 24 topic-specific files (30-66KB each) for selective installation
- **Starter Preset**: 6 recommended categories (~256KB) - perfect for getting started
- **Complete Rules** (816KB): All 700+ Effect patterns (available in rules/ directory)
- **Skills**: Pre-configured agent skills for Cursor
- **Templates**: Project setup templates

**Performance Note**: Claude Code recommends individual files under 40KB. The CLI installs category-based rules to stay within performance limits.

## Quick Start

### Development Use (Current - Before NPM Publication)

#### Option A: Local Development with npm link
```bash
# 1. Clone the primitives repo
git clone https://github.com/stiproot/effect-claude-primitives.git
cd effect-claude-primitives

# 2. Install dependencies and build
bun install
bun run build

# 3. Link it globally
npm link

# 4. In your Effect project
cd ~/my-effect-project
npm link effect-claude-primitives

# 5. Install starter categories (recommended)
npx effect-claude-primitives --starter
```

#### Option B: Manual Copy (Simplest for Testing)
```bash
# 1. Clone the primitives repo
git clone https://github.com/stiproot/effect-claude-primitives.git

# 2. Copy specific categories to your project
cp effect-claude-primitives/rules/by-category/core-concepts.md \
   ~/my-effect-project/.claude/rules/
cp effect-claude-primitives/rules/by-category/error-management.md \
   ~/my-effect-project/.claude/rules/
# ... add more categories as needed
```

### Production Use (After NPM Publication)

#### Option 1: CLI Installer (Recommended)
```bash
# Install the package
npm install -D effect-claude-primitives

# Install starter categories (recommended, ~256KB)
npx effect-claude-primitives --starter

# Or list and select specific categories
npx effect-claude-primitives --list
npx effect-claude-primitives --categories=core-concepts,error-management,testing
```

#### Option 2: Manual Installation
```bash
# Install the package
npm install -D effect-claude-primitives

# Copy specific category files manually
mkdir -p .claude/rules
cp node_modules/effect-claude-primitives/rules/by-category/core-concepts.md .claude/rules/
cp node_modules/effect-claude-primitives/rules/by-category/error-management.md .claude/rules/
# ... add more categories as needed
```

## Claude Code Configuration

Once installed, Claude Code will automatically read all `.md` files from `.claude/rules/`:

### After Running --starter
```
my-effect-project/
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

### Optional: Reference in CLAUDE.md
```markdown
<!-- CLAUDE.md -->
# Project Instructions

Effect-TS patterns are available in `.claude/rules/` - Claude will automatically load them.

## Additional Context
[Your project-specific instructions]
```

### Advanced: Skills (For Cursor)
```
my-effect-project/
├── .claude/
│   ├── rules/          ← For Claude Code
│   └── skills/         ← For Cursor
│       └── effect-service-pattern/
│           └── SKILL.md
└── CLAUDE.md
```

## Installation Guides by Tool

- [Claude Code Setup](./docs/claude-setup.md) - Detailed Claude Code configuration
- [Cursor Setup](./docs/cursor-setup.md) - Cursor rules and skills installation
- [GitHub Copilot Setup](./docs/copilot-setup.md) - GitHub Copilot instructions
- [Windsurf Setup](./docs/windsurf-setup.md) - Windsurf configuration

## Usage

The CLI installs Effect patterns by category to avoid performance issues with large files.

### Recommended: Starter Preset

Install 6 recommended categories for getting started (~256KB total):

```bash
bun x effect-claude-primitives --starter
# or: npx effect-claude-primitives --starter
```

Installs:
- Core Concepts (66KB) - Effect.gen, pipe, map, flatMap, Option, Either
- Error Management (35KB) - catchTag/catchAll, retry, Cause
- Testing (37KB) - Mock layers, testing services
- Building APIs (53KB) - HTTP APIs, routing, middleware
- Concurrency (62KB) - Parallel execution, fibers
- Getting Started (3KB) - New Effect projects

### List Available Categories

```bash
bun x effect-claude-primitives --list
```

### Install Specific Categories

```bash
bun x effect-claude-primitives --categories=error-management,streams,observability
```

### Install All Categories

⚠️ Warning: Installs all 24 categories (816KB total) - may trigger performance warnings:

```bash
bun x effect-claude-primitives --all
```

### Default Behavior

Running without flags installs the starter preset:

```bash
bun x effect-claude-primitives
```

## Available Categories

- `building-apis` - HTTP APIs, routing, middleware, authentication
- `building-data-pipelines` - Data pipelines, backpressure, batching
- `concurrency` - Parallel execution, fibers, Deferred, Semaphore
- `concurrency-getting-started` - Concurrency fundamentals
- `core-concepts` - Effect.gen, pipe, map, flatMap, Option, Either
- `domain-modeling` - Brand, Schema contracts, TaggedError
- `error-handling` - Error handling patterns
- `error-handling-resilience` - Resilient error handling
- `error-management` - catchTag/catchAll, retry, Cause
- `getting-started` - New Effect projects, first programs
- `making-http-requests` - HttpClient, timeouts, caching
- `observability` - Logging, metrics, tracing, OpenTelemetry
- `platform` - Filesystem, shell commands, environment variables
- `platform-getting-started` - Platform fundamentals
- `project-setup--execution` - Project setup and execution
- `resource-management` - acquireRelease, Scope, pools
- `scheduling` - Repeated tasks, cron, debounce, throttle
- `scheduling-periodic-tasks` - Periodic task scheduling
- `schema` - Schema validation, parsing, transforms
- `streams` - Stream, Sink, transforms, stateful operations
- `streams-getting-started` - Streams fundamentals
- `streams-sinks` - Working with Sinks
- `testing` - Mock layers, testing services, property-based testing
- `tooling-and-debugging` - Editor setup, CI/CD, linting
- `value-handling` - Working with values in Effect

## Customization

All primitives are templates. Fork and customize for your specific needs:

```bash
# Fork the repo
git clone https://github.com/stiproot/effect-claude-primitives.git
cd effect-claude-primitives

# Edit rules as needed
vim rules/effect-patterns-rules.md

# Use locally
npm link
```

## Credits

Sourced from the [Effect Patterns Repository](https://github.com/PaulJPhilp/EffectPatterns) - a community-driven knowledge base of 700+ practical patterns for building robust applications with Effect-TS.

## License

MIT - See [LICENSE](./LICENSE) file for details.

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Support

- **Issues**: [GitHub Issues](https://github.com/stiproot/effect-claude-primitives/issues)
- **Discussions**: [GitHub Discussions](https://github.com/stiproot/effect-claude-primitives/discussions)
- **Effect Discord**: [Join the Effect community](https://discord.gg/effect-ts)
