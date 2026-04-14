---
name: effect-service-pattern
description: Effect-TS service patterns for composable, type-safe dependency injection. Use when implementing services, following Effect.Service patterns, Layer composition, and error-handling conventions.
source-rules:
  - core-concepts.md
  - error-management.md
---

# Effect Patterns – Service Pattern

## Effect.Service pattern

Use Effect's Service pattern for composable, type-safe dependency injection:

```typescript
import { Effect, Context } from "effect"

export class MyService extends Context.Tag("MyService")<MyService, {
  method: () => Effect.Effect<string>
}>() {}

const effect = Effect.gen(function* () {
  const service = yield* MyService
  const result = yield* service.method()
  return result
})
```

Modern form with `Effect.Service`:

```typescript
export class MyAgent extends Effect.Service<MyAgent>()("MyAgent", {
  effect: Effect.gen(function* () {
    return {
      analyze: (input: string) => Effect.succeed("result")
    }
  })
})
```

## Service / agent structure

Recommended layout for agents and service modules:

```
services/
├── my-service/
│   ├── api.ts          # Public interface
│   ├── schema.ts       # Type definitions
│   ├── service.ts      # Core logic
│   ├── types.ts        # Domain types
│   └── __tests__/      # Test suite
```

## Error handling as values

Use tagged error types; recover with `catchTag`:

```typescript
import { Data } from "effect"

export class APIError extends Data.TaggedError("APIError")<{
  readonly status: number
  readonly message: string
}> {}

Effect.catchTag("APIError", (err) => /* handle */)
```

## Layered service composition

Compose services via `Effect.Layer`; provide to the app with `Effect.provide`:

```typescript
const appLayer = Layer.mergeAll(
  ConfigService.layer,
  CacheService.layer,
  CircuitBreakerService.layer,
  RateLimiterService.layer,
  ReviewCodeService.layer,
)

Effect.provide(appEffect, appLayer)
```

## Recommended Conventions

- **Effect-TS native**: Use Effect for composability and error handling
- **Type safety**: Use @effect/schema for types and validation
- **Explicit dependencies**: Declare all service dependencies via Effect.Service
- **Error as values**: Use tagged errors instead of throwing exceptions

## Project Customization

This skill provides general Effect.Service patterns. Customize for your project:

- **Error types**: Add project-specific error types (e.g., `DatabaseError`, `AuthError`)
- **Folder structure**: Define your service module organization
- **Infrastructure patterns**: Add database, caching, or external API service patterns
- **Layer composition**: Document how your project composes service layers
- **Testing patterns**: Include mock layer patterns for your services
