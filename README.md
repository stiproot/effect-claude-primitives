# Effect Claude Primitives

700+ Effect-TS patterns as AI-readable rules for Claude Code, Cursor, GitHub Copilot, and Windsurf.

## What's Inside?

- **Complete Rules** (797KB): All 700+ Effect patterns in one comprehensive file
- **Category Rules**: 24 topic-specific files (error-management, concurrency, schema, streams, etc.) for focused work
- **Skills**: Pre-configured agent skills for Cursor
- **Templates**: Project setup templates

## Quick Start

### Development Use (Current - Before NPM Publication)

#### Option A: Local Development with npm link
```bash
# 1. Clone the primitives repo
git clone https://github.com/stiproot/effect-claude-primitives.git
cd effect-claude-primitives

# 2. Install dependencies and build
npm install
npm run build

# 3. Link it globally
npm link

# 4. In your Effect project
cd ~/my-effect-project
npm link effect-claude-primitives

# 5. Install complete rules
npx effect-claude-primitives
```

#### Option B: Manual Copy (Simplest for Testing)
```bash
# 1. Clone the primitives repo
git clone https://github.com/stiproot/effect-claude-primitives.git

# 2. Copy complete rules to your project
cp effect-claude-primitives/rules/effect-patterns-rules.md \
   ~/my-effect-project/.claude/rules/effect-patterns.md
```

### Production Use (After NPM Publication)

#### Option 1: CLI Installer (Recommended)
```bash
# Install the package
npm install -D effect-claude-primitives

# Install complete Effect patterns
npx effect-claude-primitives
```

#### Option 2: Manual Installation
```bash
# Install the package
npm install -D effect-claude-primitives

# Copy rules manually
cp node_modules/effect-claude-primitives/rules/effect-patterns-rules.md \
   .claude/rules/effect-patterns.md
```

## Claude Code Configuration

Once installed, Claude Code will read rules from your project:

### Method 1: Direct Rules File
```
my-effect-project/
├── .claude/
│   └── rules/
│       └── effect-patterns.md  ← Claude reads this automatically
└── CLAUDE.md
```

### Method 2: Reference in CLAUDE.md
```markdown
<!-- CLAUDE.md -->
# Project Instructions

For Effect-TS patterns, see `.claude/rules/effect-patterns.md`

## Additional Context
[Your project-specific instructions]
```

### Method 3: Skills (Advanced)
```
my-effect-project/
├── .claude/
│   └── skills/
│       └── effect-service-pattern/
│           └── SKILL.md  ← Claude can use this as a skill
└── CLAUDE.md
```

## Installation Guides by Tool

- [Claude Code Setup](./docs/claude-setup.md) - Detailed Claude Code configuration
- [Cursor Setup](./docs/cursor-setup.md) - Cursor rules and skills installation
- [GitHub Copilot Setup](./docs/copilot-setup.md) - GitHub Copilot instructions
- [Windsurf Setup](./docs/windsurf-setup.md) - Windsurf configuration

## Usage

Simply run the CLI to install comprehensive Effect patterns:

```bash
# Install complete Effect patterns (700+ patterns, 797KB)
npx effect-claude-primitives
```

This installs all Effect patterns to `.claude/rules/effect-patterns.md` in your project.

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
