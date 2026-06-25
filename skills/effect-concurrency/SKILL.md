---
name: effect-concurrency
description: Effect-TS concurrency and parallelism patterns – fibers, Effect.fork/forEach/all with the concurrency option, racing and timeouts, shared state via Ref/SynchronizedRef/SubscriptionRef, and coordination primitives Deferred, Semaphore, Latch, Queue, and PubSub, plus Scope-based lifecycles and graceful shutdown. Use whenever doing concurrent or parallel work in Effect code – running effects in parallel, fetching many things at once with a concurrency limit, forking background tasks, racing for the fastest result, sharing mutable state across fibers, rate-limiting, building producer/consumer or pub/sub pipelines, polling until done, or shutting an app down cleanly – even if the user just says "do these in parallel", "run this in the background", "limit concurrency", or "share state between tasks".
source-rules:
  - concurrency.md
  - concurrency-getting-started.md
---

# Effect – Concurrency

Effect runs concurrent work on **fibers** – lightweight, cooperatively-scheduled
green threads, not OS threads. Thousands can run on a single CPU thread, and
because Effect controls scheduling it can interrupt, supervise, and clean them
up structurally. The reason this matters: you never manage threads, locks, or
manual cancellation – you compose effects with a `concurrency` option, fork
where you want a background fiber, and let structured concurrency guarantee that
losers get interrupted and resources get released.

## When to use this

- Running independent effects at once (`Effect.all`) or mapping a collection in
  parallel with a bounded limit (`Effect.forEach({ concurrency })`).
- Forking background tasks and managing their lifecycle via the returned `Fiber`.
- Racing several effects for the fastest result, or adding timeouts.
- Sharing mutable state safely across fibers (`Ref`, `SynchronizedRef`,
  `SubscriptionRef`).
- Coordinating fibers: one-shot signalling (`Deferred`), rate-limiting
  (`Semaphore`), gated start (`Latch`), work distribution (`Queue`), fan-out
  events (`PubSub`).
- Long-running apps: `Effect.runFork`, `Scope`-bound resources, graceful shutdown.

## Mental model

A `Fiber` is the unit of concurrent execution. Forking (`Effect.fork`) starts a
fiber that runs alongside the current one and hands you a `Fiber` handle to
`join` (await) or `interrupt` (cancel). Operators that take a `concurrency`
option (`Effect.all`, `Effect.forEach`) fork internally and rejoin for you –
`concurrency: "unbounded"` runs everything at once, `concurrency: n` caps it at
`n` in flight. **Concurrency is opt-in**: without the option these operators run
sequentially. Structured concurrency means a parent fiber owns its children – if
the parent is interrupted or a race is decided, the losing children are
interrupted automatically and their `Scope`-bound resources released. Shared
state never uses locks; you reach for a `Ref` (atomic state), a `SynchronizedRef`
(atomic *effectful* updates), or a `SubscriptionRef` (state others can subscribe
to). Coordination between fibers uses purpose-built primitives rather than ad-hoc
flags.

## Core patterns

### Run independent effects in parallel

`Effect.all` runs a collection concurrently – pass the `concurrency` option, or
it runs sequentially:

```typescript
import { Effect } from "effect";

const fetchUser = Effect.succeed({ id: 1, name: "Paul" }).pipe(Effect.delay("1 second"));
const fetchPosts = Effect.succeed([{ title: "Effect is great" }]).pipe(Effect.delay("1.5 seconds"));

// Result is a tuple [user, posts]; total time ~1.5s, not 2.5s.
const program = Effect.all([fetchUser, fetchPosts], { concurrency: "unbounded" });
```

### Map a collection in parallel with a limit

`Effect.forEach` with `concurrency: n` processes a collection in controlled
batches – the standard way to fan out without overwhelming a downstream:

```typescript
import { Effect } from "effect";

const fetchUserById = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.sleep("1 second");
    return { id, name: `User ${id}` };
  });

const userIds = Array.from({ length: 100 }, (_, i) => i + 1);

// 100 fetches, but only 5 in flight at any moment.
const users = Effect.forEach(userIds, fetchUserById, { concurrency: 5 });
```

### Fork a background task and interrupt it

`Effect.fork` starts a fiber that runs concurrently and returns a `Fiber` you
control. Interrupt it for a clean shutdown:

```typescript
import { Effect, Fiber } from "effect";

const tickingClock = Effect.log("tick").pipe(Effect.delay("1 second"), Effect.forever);

const program = Effect.gen(function* () {
  const clockFiber = yield* Effect.fork(tickingClock); // non-blocking
  yield* Effect.sleep("5 seconds"); // main work runs alongside the clock
  yield* Fiber.interrupt(clockFiber); // controlled shutdown of the background fiber
});
```

### Race for the fastest result

`Effect.race` returns the first effect to succeed and interrupts the losers –
e.g. a fast cache against a slower database:

```typescript
import { Effect, Option } from "effect";

const checkCache: Effect.Effect<Option.Option<{ id: number }>> = Effect.succeed(Option.none()).pipe(Effect.delay("200 millis"));
const queryDatabase: Effect.Effect<Option.Option<{ id: number }>> = Effect.succeed(Option.some({ id: 1 })).pipe(Effect.delay("50 millis"));

const fastest = Effect.race(checkCache, queryDatabase); // database wins, cache fiber interrupted
```

### Share state across fibers with Ref

A `Ref` is atomic mutable state safe to read and update from many fibers –
reach for it instead of a plain variable when more than one fiber touches it:

```typescript
import { Effect, Ref } from "effect";

const program = Effect.gen(function* () {
  const counter = yield* Ref.make(0);
  yield* Effect.forEach([1, 2, 3], () => Ref.update(counter, (n) => n + 1), {
    concurrency: "unbounded",
  });
  return yield* Ref.get(counter); // 3, regardless of interleaving
});
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/concurrency.md` (20 patterns)
- Add Caching by Wrapping a Layer
- Concurrency Pattern 1: Coordinate Async Operations with Deferred
- Concurrency Pattern 2: Rate Limit Concurrent Access with Semaphore
- Concurrency Pattern 3: Coordinate Multiple Fibers with Latch
- Concurrency Pattern 4: Distribute Work with Queue
- Concurrency Pattern 5: Broadcast Events with PubSub
- Concurrency Pattern 6: Race and Timeout Competing Effects
- Decouple Fibers with Queues and PubSub
- Execute Long-Running Apps with Effect.runFork
- Implement Graceful Shutdown for Your Application
- Manage Resource Lifecycles with Scope
- Manage Shared State Safely with Ref
- Poll for Status Until a Task Completes
- Process a Collection in Parallel with Effect.forEach
- Race Concurrent Effects for the Fastest Result
- Run Background Tasks with Effect.fork
- Run Independent Effects in Parallel with Effect.all
- State Management Pattern 1: Synchronized Reference with SynchronizedRef
- State Management Pattern 2: Observable State with SubscriptionRef
- Understand Fibers as Lightweight Threads

### `references/concurrency-getting-started.md` (3 patterns)
- Race Effects and Handle Timeouts
- Understanding Fibers
- Your First Parallel Operation
