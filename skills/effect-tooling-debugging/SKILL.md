---
name: effect-tooling-debugging
description: Effect-TS developer tooling and debugging — dev-environment setup, the Effect
  LSP, reading Effect type errors, Biome/ESLint linting config, GitHub Actions CI/CD,
  Effect DevTools (debug logging, fiber inspection, log spans, Cause inspection, custom
  loggers), performance profiling (withLogSpan, Metric histograms, CPU/memory profiling,
  benchmarking), and teaching AI agents Effect via the MCP server. Use whenever setting up
  or debugging Effect tooling: configuring lint/CI, installing the Effect LSP, making sense
  of a verbose Effect type error, adding debug logging or log spans, inspecting a Cause or
  fibers, profiling a slow Effect, or pointing an AI agent at the @effect/mcp-server — even
  if the user just says "set up CI", "lint my Effect project", or "why is this Effect slow".
source-rules:
  - tooling-and-debugging.md
---

# Effect – Tooling & Debugging

Effect is a typed effect system, so the tooling that helps most is the tooling that reads
the `Effect<A, E, R>` type and the structured runtime it produces. The Effect LSP surfaces
the inferred type as an inlay hint; the runtime gives you structured logs, log spans,
`Cause` values, fibers, and `Metric`s instead of `console.log` and stack traces. Lint and
CI config exist mainly to stay out of Effect's way (forEach, computed keys, void) while
catching the things that genuinely bite (floating promises, throwing instead of failing).

## When to use this

- Setting up an Effect dev environment: TypeScript config, the Effect LSP extension, editor integration.
- Configuring linting (Biome or ESLint) so it understands Effect idioms instead of fighting them.
- Standing up CI/CD (GitHub Actions) for an Effect project, with caching and multi-stage workflows.
- Debugging at runtime: debug logging, log spans, fiber introspection, `Cause` inspection, custom loggers.
- Profiling performance: timing operations, `Metric` histograms, CPU/memory profiles, benchmarking concurrency.
- Reading a verbose Effect type error, or pointing an AI agent at `@effect/mcp-server` for live app context.

## Mental model

Effect debugging is *structured*, not textual. A failure is a `Cause` value you inspect
with `Cause.pretty`, `Cause.failures`, `Cause.isInterrupted` – not a stack trace you read.
Timing is a `withLogSpan` annotation or a `Metric.histogram`, not a `Date.now()` you scatter
by hand (though that works too). Concurrency is fibers you can fork, name, and query for
status. And the type itself – `Effect<A, E, R>` – is the primary debugging signal: when the
LSP shows `Effect<void, never, never>` you know the program is fully provided and total. Get
the type readable first; most "bugs" are an unexpected `E` or a leftover `R`.

## Core patterns

**Log spans for timing** – annotate sections, and the duration shows up in the log line.
This is the cheapest profiling you can do:

```typescript
import { Effect } from "effect"

const timedProgram = Effect.gen(function* () {
  yield* fetchUsers().pipe(Effect.withLogSpan("fetchUsers"))
  yield* processUsers().pipe(Effect.withLogSpan("processUsers"))
}).pipe(Effect.withLogSpan("total"))
```

**Debug logging, gated by level** – use `Effect.logDebug` freely; it only emits when the
minimum log level is set to Debug, so it costs nothing in production:

```typescript
import { Effect, Logger, LogLevel } from "effect"

const debugProgram = Effect.gen(function* () {
  yield* Effect.logDebug("Starting operation")
  const result = yield* someEffect.pipe(
    Effect.tap((value) => Effect.logDebug(`Got value: ${value}`))
  )
  return result
})

const run = debugProgram.pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug),
  Effect.runPromise
)
```

**Inspect a Cause instead of swallowing the error** – `catchAllCause` gives you the full
`Cause`, which carries far more than `error.message` (interrupts, multiple failures, defects):

```typescript
import { Effect, Cause } from "effect"

failingEffect.pipe(
  Effect.catchAllCause((cause) =>
    Effect.gen(function* () {
      yield* Effect.log(`Pretty printed:\n${Cause.pretty(cause)}`)
      yield* Effect.log(`Is interrupted: ${Cause.isInterrupted(cause)}`)
      const failures = Cause.failures(cause)
      yield* Effect.log(`Failures: ${JSON.stringify([...failures])}`)
      return "recovered"
    })
  )
)
```

**Metric histogram for repeated measurement** – when one log line per run isn't enough,
record durations into a histogram and tag by operation:

```typescript
import { Metric } from "effect"

const operationDuration = Metric.histogram("operation_duration_ms", {
  description: "Operation duration in milliseconds",
  boundaries: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
})
// Metric.update(operationDuration.pipe(Metric.tagged("operation", name)), duration)
```

**Lint that doesn't fight Effect** – turn off rules that flag idiomatic Effect
(`noForEach`, `noConfusingVoidType`) and turn on the ones that catch real Effect bugs
(`no-floating-promises`, `no-unused-imports`). Full Biome/ESLint configs are in references.

## Pattern reference

The complete pattern set lives in `references/tooling-and-debugging.md`. Each entry below is
a `## ` heading in that file; open the file for the area you need. Several sections carry a
numbered worked example (`### N. …`) under the heading.

### `references/tooling-and-debugging.md` (8 patterns)
- **Configure Linting for Effect** – Biome config (recommended), ESLint alternative, package.json scripts, VS Code integration, pre-commit hook, Effect-specific rules to consider.
- **Profile Effect Applications** – basic span timing, `withLogSpan` nesting, `Metric` histograms, memory profiling, CPU profiling via the Node inspector, benchmarking, profiling concurrency, running a profiling session.
- **Read Effect Type Errors** – extracting the key information from Effect's verbose-but-structured errors.
- **Set Up CI/CD for Effect Projects** – basic GitHub Actions workflow, caching (Bun deps + tsbuildinfo), package.json scripts, multi-stage workflow, release workflow.
- **Set Up Your Effect Development Environment** – installing the Effect extension and configuring TypeScript for Effect.
- **Supercharge Your Editor with the Effect LSP** – installing the LSP for readable inferred-type inlay hints (`Effect<void, never, never>`).
- **Teach your AI Agents Effect with the MCP Server** – running `@effect/mcp-server` against your `AppLayer` so AI agents get live architectural context.
- **Use Effect DevTools** – debug-mode logging, fiber supervision/introspection, span tracing, `Cause` inspection, context inspection, custom dev logger, runtime metrics.
