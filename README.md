# Effect Claude Primitives

700+ Effect-TS patterns as AI-readable rules for Claude Code, Cursor, GitHub Copilot, and Windsurf.

## What's Inside?

- **Complete Rules** (797KB): All Effect patterns in one file
- **Beginner Rules** (1,453 lines): Start here for learning Effect
- **Intermediate Rules** (3,449 lines): Common use cases
- **Advanced Rules** (1,238 lines): Complex compositions
- **Category Rules**: 24 topic-specific files (error-management, concurrency, schema, streams, etc.)
- **Skills**: Pre-configured agent skills for Cursor
- **Templates**: Project setup templates

## Quick Start

### Development Use (Current - Before NPM Publication)

#### Option A: Local Development with npm link
```bash
# 1. Clone the primitives repo
git clone https://github.com/effect-patterns/claude-primitives.git
cd effect-claude-primitives

# 2. Install dependencies and build
npm install
npm run build

# 3. Link it globally
npm link

# 4. In your Effect project
cd ~/my-effect-project
npm link effect-claude-primitives

# 5. Use the CLI
npx effect-claude-kit install --target claude --level beginner
```

#### Option B: Manual Copy (Simplest for Testing)
```bash
# 1. Clone the primitives repo
git clone https://github.com/effect-patterns/claude-primitives.git

# 2. Copy rules to your project
cp effect-claude-primitives/rules/by-skill-level/beginner.md \
   ~/my-effect-project/.claude/rules/effect-patterns.md

# Or reference in CLAUDE.md
echo "See .claude/rules/effect-patterns.md for Effect patterns" >> ~/my-effect-project/CLAUDE.md
```

### Production Use (After NPM Publication)

#### Option 1: CLI Installer (Recommended)
```bash
# Install the package
npm install -D effect-claude-primitives

# Interactive installation wizard
npx effect-claude-kit install --wizard

# Or install specific rules
npx effect-claude-kit install --target claude --level beginner
npx effect-claude-kit install --target cursor --category error-management
```

#### Option 2: Manual Installation
```bash
# Install the package
npm install -D effect-claude-primitives

# Copy rules manually
cp node_modules/effect-claude-primitives/rules/complete/effect-patterns-rules.md \
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

## Progressive Learning Path

**Recommended approach for learning Effect:**

1. **Start with Beginner** - Install `rules/by-skill-level/beginner.md`
2. **Add Intermediate** - Once comfortable, add `intermediate.md`
3. **Use Category-Specific** - Install topic rules for focused work (error-management, concurrency, etc.)
4. **Complete Rules** - For comprehensive coverage, install the full 797KB ruleset

## CLI Commands Reference

```bash
# List available primitives
npx effect-claude-kit list

# List installed rules
npx effect-claude-kit list --installed

# Install with interactive wizard
npx effect-claude-kit install --wizard

# Install by skill level
npx effect-claude-kit install --target claude --level beginner
npx effect-claude-kit install --target claude --level intermediate
npx effect-claude-kit install --target claude --level advanced
npx effect-claude-kit install --target claude --level complete

# Install by category
npx effect-claude-kit install --target cursor --category error-management
npx effect-claude-kit install --target cursor --category concurrency
npx effect-claude-kit install --target cursor --category schema

# Install to different tools
npx effect-claude-kit install --target claude    # Claude Code (.claude/skills/)
npx effect-claude-kit install --target cursor    # Cursor (.cursor/rules/)
npx effect-claude-kit install --target vscode    # GitHub Copilot (.github/copilot-instructions.md)
npx effect-claude-kit install --target windsurf  # Windsurf (.windsurf/rules/)
npx effect-claude-kit install --target agent     # Generic (AGENTS.md)
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
git clone https://github.com/effect-patterns/claude-primitives.git
cd effect-claude-primitives

# Edit rules as needed
vim rules/by-skill-level/beginner.md

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

- **Issues**: [GitHub Issues](https://github.com/effect-patterns/claude-primitives/issues)
- **Discussions**: [GitHub Discussions](https://github.com/effect-patterns/claude-primitives/discussions)
- **Effect Discord**: [Join the Effect community](https://discord.gg/effect-ts)