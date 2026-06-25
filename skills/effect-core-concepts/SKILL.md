---
name: effect-core-concepts
description: Effect-TS foundational mental model and primitives – the `Effect<A, E, R>` three-channel type, Effect.gen vs .pipe, map/flatMap/andThen/tap, Option and Either, the Data module (TaggedError, Data.struct/case/Class, structural Equal), Layers for dependency injection, lazy blueprints, and wrapping sync/async code with sync/try/tryPromise. Use whenever reasoning about or writing core Effect code – understanding what `Effect<A, E, R>` means, choosing between Effect.gen and pipe, composing with map/flatMap/andThen/tap, modelling absence with Option or alternatives with Either, building value objects with Data, wiring services through Layers, or lifting Promises/callbacks/throwing functions into Effects – even if the user just says "what does this Effect type mean", "convert this Promise to Effect", or "how do I sequence these steps".
source-rules:
  - core-concepts.md
  - core-concepts-minimal.md
---

# Effect – Core Concepts

Effect models a program as a *value*: an `Effect<A, E, R>` is a lazy blueprint
describing a computation that, when run, either succeeds with an `A`, fails with
a typed `E`, or needs services `R` from its environment. Nothing executes until
you hand the blueprint to a runtime (`runSync` / `runPromise`). Because effects
are values, you build big programs by composing small ones – and the compiler
tracks success, failure, and dependencies in the type, so the three channels are
the foundation every other Effect concept builds on.

## When to use this

- Understanding what `Effect<A, E, R>` means and reading an Effect type signature.
- Choosing between `Effect.gen` (sequential, imperative-looking) and `.pipe`
  (point-free composition) for a piece of code.
- Composing effects with `map`, `flatMap`, `andThen`, `tap`, `zip`, `all`, `forEach`.
- Modelling optional values with `Option` and alternatives/errors with `Either`.
- Building immutable value objects and tagged unions with the `Data` module
  (`Data.struct`, `Data.case`, `Data.TaggedError`, structural `Equal`).
- Wiring service dependencies through `Layer` and `Effect.provide`.
- Lifting existing sync/async code into Effect (`sync`, `try`, `tryPromise`,
  `async`), and understanding why effects are lazy blueprints.

## Mental model

`Effect<A, E, R>` has three type channels: `A` is the success value, `E` is the
*expected* error (a typed value, not a thrown exception), and `R` is the set of
services the effect requires before it can run. An effect is inert until a
runtime executes it, so constructing one has no side effects – this is what lets
you compose and reuse them freely. You sequence effects two ways: `Effect.gen`
with `yield*` reads like `async/await` and suits multi-step flows where later
steps depend on earlier values; `.pipe` with `map`/`flatMap` suits short
transformation chains. `Option` and `Either` are plain value types (not effects)
for modelling absence and binary outcomes; `Data.*` gives you structural
equality and tagged unions; `Layer` constructs the `R` services that
`Effect.provide` then satisfies, emptying the `R` channel.

## Core patterns

### The three channels

`Effect<A, E, R>` – success `A`, error `E`, requirements `R`. The signature is a
self-documenting contract: to get a `User` you must provide a `Database`, and it
may fail with `UserNotFoundError`.

```typescript
import { Effect, Data } from "effect";

interface User { readonly name: string }                       // A
class UserNotFoundError extends Data.TaggedError("UserNotFoundError") {} // E

const getUser = (
  id: number
): Effect.Effect<User, UserNotFoundError, Database> =>        // R = Database
  Effect.gen(function* () {
    const db = yield* Database;
    return yield* db.findUser(id);
  });
```

### Effect.gen for sequential steps

Use `Effect.gen` with `yield*` to sequence effects like `async/await`. Each
`yield*` unwraps a success value; any failure short-circuits the generator.

```typescript
import { Effect } from "effect";

const program = Effect.gen(function* () {
  const a = yield* Effect.succeed(10);
  const b = yield* Effect.succeed(20);
  yield* Effect.log(`sum = ${a + b}`);
  return a + b;                          // Effect<number, never, never>
});
```

### .pipe with map / flatMap for transformations

`map` transforms a success value (`A → B`); `flatMap` sequences an
effect-returning step (`A → Effect<B>`). Reach for `.pipe` on short chains.

```typescript
import { Effect, pipe } from "effect";

const doubled = pipe(
  Effect.succeed(5),
  Effect.map((n) => n * 2),            // Effect<number>
  Effect.flatMap((n) => Effect.succeed(`result: ${n}`)),
);
```

### Option for explicit absence

`Option` makes "maybe no value" type-safe instead of relying on `null`. Lift
nullable values with `fromNullable`, then handle both cases with `match`.

```typescript
import { Option } from "effect";

const maybe = Option.fromNullable(Math.random() > 0.5 ? "hello" : null);

const result = maybe.pipe(
  Option.match({
    onNone: () => "No value",
    onSome: (s) => `Value: ${s}`,
  })
); // string
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/core-concepts.md` (49 patterns)
- Access Configuration from the Context
- Accumulate Multiple Errors with Either
- Beyond the Date Type - Real World Dates, Times, and Timezones
- Chaining Computations with flatMap
- Combining Values with zip
- Comparing Data by Value with Data.struct
- Comparing Data by Value with Structural Equality
- Conditional Branching with if, when, and cond
- Control Flow with Conditional Combinators
- Converting from Nullable, Option, or Either
- Create Pre-resolved Effects with succeed and fail
- Creating from Collections
- Creating from Synchronous and Callback Code
- Define a Type-Safe Configuration Schema
- Filtering Results with filter
- Handle Unexpected Errors by Inspecting the Cause
- Handling Errors with catchAll, orElse, and match
- Lifting Errors and Absence with fail, none, and left
- Lifting Values with succeed, some, and right
- Manage Shared State Safely with Ref
- Mapping and Chaining over Collections with forEach and all
- Model Optional Values Safely with Option
- Modeling Effect Results with Exit
- Modeling Tagged Unions with Data.case
- Process Streaming Data with Stream
- Provide Configuration to Your App via a Layer
- Redact and Handle Sensitive Data
- Representing Time Spans with Duration
- Representing Time Spans with Duration
- Sequencing with andThen, tap, and flatten
- Solve Promise Problems with Effect
- Transform Effect Values with map and flatMap
- Transforming Values with map
- Type Classes for Equality, Ordering, and Hashing with Data.Class
- Understand Layers for Dependency Injection
- Understand that Effects are Lazy Blueprints
- Understand the Three Effect Channels (A, E, R)
- Use .pipe for Composition
- Use Chunk for High-Performance Collections
- Use Chunk for High-Performance Collections
- Work with Arbitrary-Precision Numbers using BigDecimal
- Work with Dates and Times using DateTime
- Work with Immutable Sets using HashSet
- Working with Immutable Arrays using Data.array
- Working with Tuples using Data.tuple
- Wrap Asynchronous Computations with tryPromise
- Wrap Synchronous Computations with sync and try
- Wrapping Synchronous and Asynchronous Computations
- Write Sequential Code with Effect.gen

### `references/core-concepts-minimal.md` (a condensed primer – 14 sections)
- The Effect Type Signature
- Effect.succeed and Effect.fail
- Effect.gen — Generator Syntax
- pipe, Effect.map, and Effect.flatMap
- Typed Errors with `_tag`
- Effect.catchTag and Effect.catchAll
- Effect.Service — Defining Injectable Services
- Layer — Providing Service Implementations
- Effect.provide — Wiring Layers to Programs
- Effect.runSync and Effect.runPromise
- Effect.all — Parallel Execution
- Effect.tryPromise — Wrapping Async Code
