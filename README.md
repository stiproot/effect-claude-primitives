# Effect Claude Primitives

700+ Effect-TS patterns delivered as Claude Code skills.

## What's Inside?

- **Skills**: 17 Effect-TS skills, each a lean `SKILL.md` plus a `references/` directory holding the full pattern content. Claude Code loads each skill on demand – only the skill's name and description sit in context until the skill's description matches the task, at which point the `SKILL.md` body and any referenced files are pulled in. This progressive disclosure keeps the eager-loaded context small, so installing many skills carries no upfront cost.
- **Starter Preset**: 6 recommended skills – perfect for getting started.
- **Templates**: Project setup templates.

Skills install into `.claude/skills/`, not `.claude/rules/`. Files under `.claude/rules/` are auto-loaded in full on every session; skills are not, which is what avoids the context blow-up of shipping these patterns as rules.

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

# 5. Install starter skills (recommended)
npx effect-claude-primitives --starter
```

#### Option B: Manual Copy (Simplest for Testing)
```bash
# 1. Clone the primitives repo
git clone https://github.com/stiproot/effect-claude-primitives.git

# 2. Copy whole skill directories into your project
mkdir -p ~/my-effect-project/.claude/skills
cp -R effect-claude-primitives/skills/effect-core-concepts \
   ~/my-effect-project/.claude/skills/
cp -R effect-claude-primitives/skills/effect-error-handling \
   ~/my-effect-project/.claude/skills/
# ... add more skills as needed
```

### Production Use (After NPM Publication)

#### Option 1: CLI Installer (Recommended)
```bash
# Install the package
npm install -D effect-claude-primitives

# Install starter skills (recommended)
npx effect-claude-primitives --starter

# Or list and select specific skills
npx effect-claude-primitives --list
npx effect-claude-primitives --skills effect-core-concepts,effect-error-handling,effect-testing
```

#### Option 2: Manual Installation
```bash
# Install the package
npm install -D effect-claude-primitives

# Copy whole skill directories manually
mkdir -p .claude/skills
cp -R node_modules/effect-claude-primitives/skills/effect-core-concepts .claude/skills/
cp -R node_modules/effect-claude-primitives/skills/effect-error-handling .claude/skills/
# ... add more skills as needed
```

## Claude Code Configuration

Once installed, Claude Code discovers the skills under `.claude/skills/` and loads each one on demand – only when its description matches the task in front of it.

### After Running --starter
```
my-effect-project/
├── .claude/
│   └── skills/
│       ├── effect-getting-started/
│       │   ├── SKILL.md
│       │   └── references/
│       ├── effect-core-concepts/
│       ├── effect-service-pattern/
│       ├── effect-error-handling/
│       ├── effect-concurrency/
│       └── effect-testing/
└── CLAUDE.md
```

### Optional: Reference in CLAUDE.md
```markdown
<!-- CLAUDE.md -->
# Project Instructions

Effect-TS patterns are available as skills under `.claude/skills/` - Claude loads each one on demand.

## Additional Context
[Your project-specific instructions]
```

## Installation Guides by Tool

- [Claude Code Setup](./docs/claude-setup.md) - Detailed Claude Code configuration
- [Cursor Setup](./docs/cursor-setup.md) - Cursor rules and skills installation
- [GitHub Copilot Setup](./docs/copilot-setup.md) - GitHub Copilot instructions
- [Windsurf Setup](./docs/windsurf-setup.md) - Windsurf configuration

## Usage

The CLI installs Effect patterns as skills under `.claude/skills/`. Claude Code loads each skill on demand, so the number of installed skills does not bloat session context.

### Recommended: Starter Preset

Install the 6 recommended skills for getting started:

```bash
bun x effect-claude-primitives --starter
# or: npx effect-claude-primitives --starter
```

Installs:
- `effect-getting-started` - First steps, running effects, project bootstrap
- `effect-core-concepts` - Effect.gen, pipe, map/flatMap, Option, Either, Layers
- `effect-service-pattern` - Effect.Service, Context.Tag, dependency injection
- `effect-error-handling` - catchTag/catchAll, retry, timeouts, Cause
- `effect-concurrency` - Fibers, parallel execution, Ref, Deferred, Semaphore
- `effect-testing` - Mock layers, TestClock, property-based testing

### List Available Skills

```bash
bun x effect-claude-primitives --list
```

### Install Specific Skills

```bash
bun x effect-claude-primitives --skills effect-error-handling,effect-streams,effect-observability
```

### Install All Skills

```bash
bun x effect-claude-primitives --all
```

### Default Behavior

Running without flags installs the starter preset:

```bash
bun x effect-claude-primitives
```

## Available Skills

- `effect-getting-started` - First steps, running effects, project bootstrap, building a Runtime
- `effect-core-concepts` - The Effect<A, E, R> model, gen vs pipe, Option/Either, Data, Layers
- `effect-service-pattern` - Effect.Service, Context.Tag, composing Layers, dependency injection
- `effect-error-handling` - Tagged errors, catchTag/catchAll, retry, timeouts, Cause inspection
- `effect-concurrency` - Fibers, fork/forEach/all, racing, Ref, Deferred, Semaphore, Queue, PubSub
- `effect-testing` - Mock services, test Layers, TestClock, fast-check, testing streams
- `effect-streams` - Stream and Sink patterns, backpressure, grouping, error handling
- `effect-http-api` - Server-side HTTP with @effect/platform, routing, validation, middleware
- `effect-http-client` - Outgoing HTTP, response parsing, timeouts, retry, caching
- `effect-mcp-server` - Building Model Context Protocol servers with Effect-TS
- `effect-domain-modeling` - Schema contracts, Brand, TaggedError, Option
- `effect-data-pipelines` - End-to-end Stream pipelines, batching, backpressure, fan-out, DLQs
- `effect-observability` - Logging, metrics, tracing with withSpan, OpenTelemetry
- `effect-scheduling` - Schedule, retries, backoff, cron jobs, debounce/throttle, circuit breakers
- `effect-platform` - @effect/platform OS operations: shell, FileSystem, paths, env via Config
- `effect-resource-management` - acquireRelease, Scope, scoped Layers, Pool
- `effect-tooling-debugging` - LSP, reading type errors, lint/CI, DevTools, profiling

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
