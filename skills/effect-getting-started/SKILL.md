---
name: effect-getting-started
description: First steps with Effect-TS – Hello World, Effect.succeed / Effect.fail, transforming with Effect.map, recovering with catchAll / catchTag, and actually running an effect with Effect.runSync / Effect.runPromise. Also covers bootstrapping a brand-new Effect project (deps, tsconfig, src/index.ts) and compiling layers into a reusable Runtime. Use this whenever someone is new to Effect or starting from scratch – "how do I run an Effect", "set up an Effect project", "my first Effect program", "what does Effect.succeed do", "Effect vs Promise", "make a runtime from my layers" – even if they only say "I'm just trying Effect out".
source-rules:
  - getting-started.md
  - project-setup--execution.md
---

# Effect – Getting Started

This is the on-ramp for someone new to Effect. An `Effect<A, E, R>` is a *lazy
description* of a computation that may succeed with `A`, fail with a typed `E`,
and need dependencies `R`. Building an effect runs nothing – you compose
descriptions with combinators like `map` and `catchAll`, then hand the final
description to a runtime (`runSync` / `runPromise`) at the edge of your program
to actually execute it. That separation between describing and running is the
whole point, and the reason Effect can give you typed errors, retries, and
dependency injection for free.

## When to use this

- Writing your very first Effect program (Hello World, `Effect.succeed`).
- Learning the core building blocks: `Effect.succeed`, `Effect.fail`,
  `Effect.map`, and recovering with `catchAll` / `catchTag`.
- Working out how to actually *run* an effect – `runSync` vs `runPromise`.
- Bootstrapping a new Effect project from nothing (deps, `tsconfig`, entrypoint).
- Compiling your layers once into a reusable `Runtime` (e.g. for a server).
- Explaining *why* Effect over raw Promises to a teammate.

## Mental model

Constructing an effect is pure data; it does not execute until a run function is
called. `Effect.succeed(x)` describes a success in the `A` channel;
`Effect.fail(e)` describes a typed failure in the `E` channel. Combinators
transform the description without running it: `Effect.map` rewrites the success
value, `catchAll` / `catchTag` recover from the error channel. At the very end
you choose a runtime: `runSync` for fully synchronous effects, `runPromise` for
anything async. For a long-lived process, compile your `Layer`s into a `Runtime`
once and reuse it per request instead of rebuilding the dependency graph each
time. (Typed errors and tagged-error recovery go much deeper – see the
effect-error-handling skill once you are past the basics.)

## Core patterns

### Hello World – build then run

Constructing the effect does nothing; `runSync` is what executes it:

```typescript
import { Effect } from "effect";

const helloWorld = Effect.succeed("Hello, Effect!");

const result = Effect.runSync(helloWorld);
console.log(result); // "Hello, Effect!"
```

### Transform success values with map

`Effect.map` rewrites the `A` channel, leaving a new description to run later:

```typescript
import { Effect } from "effect";

const getNumber = Effect.succeed(5);
const doubled = Effect.map(getNumber, (n) => n * 2);
const asString = Effect.map(doubled, (n) => `The result is ${n}`);

console.log(Effect.runSync(asString)); // "The result is 10"
```

### Fail, then recover

`Effect.fail` puts a typed value in the error channel; recover it with
`catchTag` (one variant) or `catchAll` (everything) so the result succeeds:

```typescript
import { Effect, pipe } from "effect";

class UserNotFound {
  readonly _tag = "UserNotFound";
  constructor(readonly id: string) {}
}

const findUser = (id: string) =>
  id === "123"
    ? Effect.succeed({ id, name: "Alice" })
    : Effect.fail(new UserNotFound(id));

const program = pipe(
  findUser("456"),
  Effect.catchTag("UserNotFound", (e) =>
    Effect.succeed({ id: e.id, name: "Guest" })
  ),
  Effect.map((user) => `Hello, ${user.name}!`)
);

console.log(Effect.runSync(program)); // "Hello, Guest!"
```

### Run async effects with runPromise

Use `runPromise` when the effect contains anything asynchronous; `runSync`
throws if it hits an async boundary:

```typescript
import { Effect } from "effect";

const program = Effect.succeed("Hello, World!").pipe(Effect.delay("1 second"));

Effect.runPromise(program); // resolves after 1 second
```

### Reuse a Runtime built from layers

Compile layers into a `Runtime` once, then reuse it for every execution so you
don't rebuild the dependency graph each time:

```typescript
import { Effect, Layer, Runtime } from "effect";

class GreeterService extends Effect.Service<GreeterService>()("Greeter", {
  sync: () => ({
    greet: (name: string) => Effect.sync(() => `Hello ${name}`),
  }),
}) {}

const runtime = Effect.runSync(
  Layer.toRuntime(GreeterService.Default).pipe(Effect.scoped)
);

Runtime.runPromise(runtime)(Effect.log("Hello"));
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/getting-started.md` (6 patterns)
- Handle Your First Error with Effect.fail and catchAll
- Hello World: Your First Effect
- Retry a Failed Operation with Effect.retry
- Run Multiple Effects in Parallel with Effect.all
- Transform Values with Effect.map
- Why Effect? Comparing Effect to Promise

### `references/project-setup--execution.md` (4 patterns)
- Create a Reusable Runtime from Layers
- Execute Asynchronous Effects with Effect.runPromise
- Execute Synchronous Effects with Effect.runSync
- Set Up a New Effect Project
