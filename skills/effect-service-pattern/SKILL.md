---
name: effect-service-pattern
description: Effect-TS service and dependency-injection patterns — defining services with Effect.Service and Context.Tag, wiring dependencies, composing and merging Layers, and structuring a service or agent module. Use whenever building or organising Effect code that exposes capabilities behind an interface: implementing an Effect.Service, declaring a Context.Tag, composing Layers, providing dependencies with Effect.provide, laying out a service/agent folder, or deciding how a module declares what it needs — even if the user just says "add a service" or "wire this up" in an Effect codebase.
source-rules:
  - core-concepts.md
  - error-management.md
---

# Effect – Service Pattern

A service in Effect is a capability published behind a tag and resolved at the edge of the program. Instead of importing a concrete implementation, code asks for the tag and receives whatever Layer was provided. This keeps dependencies explicit in the type system – they show up in the `R` channel of `Effect<A, E, R>` until satisfied – so the compiler tells you what a program still needs before it can run, and swapping a real implementation for a test one is just providing a different Layer.

## When to use this

- Defining a new service or agent: choosing between `Context.Tag` and `Effect.Service`.
- Declaring what a module depends on and resolving it through dependency injection.
- Composing several services into an application Layer and providing it at the entry point.
- Laying out a service/agent module's files (api, schema, service, types, tests).
- Designing the failures a service can return as typed, tagged errors rather than thrown exceptions.

## Mental model

A service is two things: a **tag** (an identity plus the shape of its interface) and a **Layer** (a recipe that builds the implementation, possibly depending on other services). Effectful code yields the tag to obtain the interface; the unmet requirement is tracked in the `R` channel. You discharge it once, near the top, with `Effect.provide`. Errors are part of the contract too – return them as values in the `E` channel so callers recover by matching a tag, never by `try/catch`.

## Core patterns

Declare a service with `Context.Tag` when you want the interface and its implementation kept separate:

```typescript
import { Effect, Context } from "effect"

export class MyService extends Context.Tag("MyService")<MyService, {
  method: () => Effect.Effect<string>
}>() {}

const program = Effect.gen(function* () {
  const service = yield* MyService
  return yield* service.method()
})
```

Reach for `Effect.Service` when one class should bundle the tag and a default implementation – the common case for an agent or self-contained module. It also generates a `Default` Layer for you:

```typescript
export class MyAgent extends Effect.Service<MyAgent>()("MyAgent", {
  effect: Effect.gen(function* () {
    return {
      analyze: (input: string) => Effect.succeed("result"),
    }
  }),
}) {}
```

Model failures as tagged errors so recovery is type-directed – `catchTag` only compiles against errors the effect can actually produce:

```typescript
import { Data, Effect } from "effect"

export class APIError extends Data.TaggedError("APIError")<{
  readonly status: number
  readonly message: string
}> {}

program.pipe(Effect.catchTag("APIError", (err) => Effect.succeed(fallback)))
```

Compose services into one application Layer and discharge every requirement at the entry point. `Layer.mergeAll` combines independent services; the merged Layer satisfies the `R` channel so `Effect.provide` leaves an effect that can run:

```typescript
const appLayer = Layer.mergeAll(
  ConfigService.Default,
  CacheService.Default,
  CircuitBreakerService.Default,
  RateLimiterService.Default,
  ReviewCodeService.Default,
)

Effect.provide(appEffect, appLayer)
```

## Module structure

Keep a service's public surface, its types, and its logic in separate files so callers depend on the interface, not the implementation:

```
services/
└── my-service/
    ├── api.ts        # Public interface – what callers import
    ├── schema.ts     # @effect/schema definitions and validation
    ├── service.ts    # Core logic and the Layer
    ├── types.ts      # Domain types
    └── __tests__/    # Tests, typically against a mock Layer
```

## Conventions

- **Declare dependencies explicitly.** Let them surface in the `R` channel rather than reaching for module-level singletons – the type signature becomes the dependency manifest.
- **Errors are values.** Use `Data.TaggedError` and recover by tag; reserve thrown exceptions for genuine defects.
- **Validate at the boundary.** Use `@effect/schema` for input types and parsing so bad data fails as a typed error, not a runtime surprise.
- **Provide once, near the top.** Build one application Layer and discharge requirements at the entry point so the rest of the code stays requirement-agnostic.

## Project customization

These are the general patterns. Adapt them to your codebase:

- **Error taxonomy** – define the tagged errors your domain raises (e.g. `DatabaseError`, `AuthError`) and the boundaries at which they are mapped.
- **Folder layout** – settle on one module shape and apply it consistently.
- **Infrastructure services** – add Layers for your database, cache, and external-API clients.
- **Test Layers** – provide mock implementations of each service for use in `__tests__`.

## Going deeper

This skill covers the service-and-injection task. For the broader foundations, reach for the sibling skills in this plugin: the `effect-core-concepts` skill for the `Effect<A, E, R>` type, generators, and Layer fundamentals, and the `effect-error-handling` skill for the full set of error-management patterns – `catchTag`/`catchTags`/`catchAll`, retries with `Schedule`, and `Cause` inspection.
