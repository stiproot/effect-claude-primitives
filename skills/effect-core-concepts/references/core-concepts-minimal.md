# core-concepts-minimal Patterns

> Compact reference for the 12 most fundamental Effect-TS concepts. Load this at startup; use the full `core-concepts` category for deeper coverage.

---

## The Effect Type Signature

`Effect<A, E, R>` represents a program that: succeeds with a value of type `A`, may fail with an error of type `E`, and requires services/context of type `R`.

### Example

```typescript
import { Effect } from "effect";

// Effect<number, never, never>  — succeeds with number, no errors, no requirements
const noFailure: Effect.Effect<number> = Effect.succeed(42);

// Effect<string, Error, never>  — may fail with Error
const mayFail: Effect.Effect<string, Error> = Effect.fail(new Error("oops"));

// Effect<User, NotFoundError, Database>  — requires Database service
declare const getUser: (id: string) => Effect.Effect<User, NotFoundError, Database>;
```

`never` in the error position means the effect cannot fail. `never` in the requirements position means it needs no external services.

---

## Effect.succeed and Effect.fail

Create effects that immediately succeed with a value or fail with an error.

### Example

```typescript
import { Effect } from "effect";

const ok = Effect.succeed(42);             // Effect<number, never, never>
const fail = Effect.fail("bad input");     // Effect<never, string, never>

// Wrap existing sync code safely
const parsed = Effect.try({
  try: () => JSON.parse('{"a":1}'),
  catch: (e) => new Error(`Parse failed: ${e}`),
});
```

---

## Effect.gen — Generator Syntax

Use `Effect.gen` with `yield*` to sequence effects like async/await. Each `yield*` unwraps an effect's success value; any failure short-circuits the generator.

### Example

```typescript
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const a = yield* Effect.succeed(10);    // a = 10
  const b = yield* Effect.succeed(20);    // b = 20
  yield* Effect.log(`sum = ${a + b}`);
  return a + b;                           // Effect<number, never, never>
});
```

Prefer `Effect.gen` for multi-step sequences; use `pipe` for single-step transformations.

---

## pipe, Effect.map, and Effect.flatMap

`pipe` passes a value through a chain of functions. `Effect.map` transforms a success value. `Effect.flatMap` sequences an effect-returning function.

### Example

```typescript
import { Effect, pipe } from "effect";

// map: transform the success value (A → B)
const doubled = pipe(
  Effect.succeed(5),
  Effect.map((n) => n * 2),           // Effect<number>
  Effect.map((n) => `result: ${n}`),  // Effect<string>
);

// flatMap: chain effects (A → Effect<B>)
const chained = pipe(
  Effect.succeed("hello"),
  Effect.flatMap((s) => Effect.succeed(s.toUpperCase())),
);
```

---

## Typed Errors with `_tag`

Define errors as classes with a `readonly _tag` discriminant. Effect tracks error types in the `E` channel so the compiler enforces exhaustive handling.

### Example

```typescript
import { Effect } from "effect";

class NotFound {
  readonly _tag = "NotFound";
  constructor(readonly id: string) {}
}

class Unauthorized {
  readonly _tag = "Unauthorized";
}

const findItem = (id: string): Effect.Effect<string, NotFound> =>
  id === "1" ? Effect.succeed("item") : Effect.fail(new NotFound(id));
```

---

## Effect.catchTag and Effect.catchAll

Recover from typed errors. `catchTag` handles one error variant; `catchAll` handles any error.

### Example

```typescript
import { Effect } from "effect";

class NotFound { readonly _tag = "NotFound"; constructor(readonly id: string) {} }
class DbError   { readonly _tag = "DbError";  constructor(readonly msg: string) {} }

declare const fetch: (id: string) => Effect.Effect<string, NotFound | DbError>;

const program = fetch("42").pipe(
  // Handle one specific error
  Effect.catchTag("NotFound", (e) => Effect.succeed(`default for ${e.id}`)),
  // Handle all remaining errors
  Effect.catchAll((e) => Effect.succeed(`fallback: ${e.msg}`)),
);
```

---

## Effect.Service — Defining Injectable Services

`Effect.Service` creates a named service with a typed interface. The class itself acts as both the tag and the default implementation anchor.

### Example

```typescript
import { Effect } from "effect";

class Logger extends Effect.Service<Logger>()("Logger", {
  sync: () => ({
    log: (msg: string) => Effect.sync(() => console.log(msg)),
  }),
}) {}

// Use in a program — Logger is tracked in the R channel
const program = Effect.gen(function* () {
  const logger = yield* Logger;
  yield* logger.log("hello from Logger");
});
```

---

## Layer — Providing Service Implementations

A `Layer` describes how to construct one or more services, possibly from other services. Compose layers with `Layer.merge` and `Layer.provide`.

### Example

```typescript
import { Effect, Layer } from "effect";

class Config extends Effect.Service<Config>()("Config", {
  sync: () => ({ dbUrl: "postgres://localhost/dev" }),
}) {}

class Db extends Effect.Service<Db>()("Db", {
  effect: Effect.gen(function* () {
    const config = yield* Config;
    return { query: (sql: string) => Effect.succeed(`result of: ${sql} @ ${config.dbUrl}`) };
  }),
}) {}

// Db.Default requires Config; provide Config.Default to satisfy it
const AppLayer = Db.Default.pipe(Layer.provide(Config.Default));
```

---

## Effect.provide — Wiring Layers to Programs

Supply a program's requirements by providing a layer. `Effect.provide` removes the `R` type, leaving an effect with `R = never` that can be run.

### Example

```typescript
import { Effect, Layer } from "effect";

// (assuming Logger and AppLayer from above examples)
declare const program: Effect.Effect<void, never, Logger>;
declare const LoggerLive: Layer.Layer<Logger>;

// Provide the layer — program is now Effect<void, never, never>
const runnable = Effect.provide(program, LoggerLive);

Effect.runPromise(runnable);
```

---

## Effect.runSync and Effect.runPromise

Execute an effect. Use `runSync` for synchronous effects; `runPromise` for async. Both require `R = never` (all requirements satisfied).

### Example

```typescript
import { Effect } from "effect";

// Synchronous
const value = Effect.runSync(Effect.succeed(42));           // 42

// Async
const asyncValue = await Effect.runPromise(
  Effect.tryPromise(() => fetch("https://api.example.com/data").then(r => r.json()))
);

// runSync throws on failure; runPromise rejects
```

---

## Effect.all — Parallel Execution

Run multiple effects concurrently and collect their results. `Effect.all` with an array returns a tuple of results; with a record it returns a record.

### Example

```typescript
import { Effect } from "effect";

const [user, posts] = await Effect.runPromise(
  Effect.all(
    [
      Effect.succeed({ id: 1, name: "Alice" }),
      Effect.succeed([{ title: "Hello" }, { title: "World" }]),
    ],
    { concurrency: "unbounded" }
  )
);

// Record form — results keyed by property name
const { profile, settings } = await Effect.runPromise(
  Effect.all({ profile: Effect.succeed("prof"), settings: Effect.succeed("sett") })
);
```

---

## Effect.tryPromise — Wrapping Async Code

Convert a Promise-based function into an Effect, capturing rejections as typed errors.

### Example

```typescript
import { Effect } from "effect";

class FetchError {
  readonly _tag = "FetchError";
  constructor(readonly cause: unknown) {}
}

const fetchJson = (url: string): Effect.Effect<unknown, FetchError> =>
  Effect.tryPromise({
    try: () => fetch(url).then((r) => r.json()),
    catch: (cause) => new FetchError(cause),
  });

const program = Effect.gen(function* () {
  const data = yield* fetchJson("https://api.example.com/items");
  return data;
});
```

---
