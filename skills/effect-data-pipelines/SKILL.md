---
name: effect-data-pipelines
description: Effect-TS data-pipeline patterns – building end-to-end pipelines with Stream: sourcing from lists/files/paginated APIs, processing in constant memory, mapEffect with bounded concurrency, grouped batching, buffer/throttle/debounce backpressure, broadcast/partition/groupByKey fan-out, merge/concat/zip, dead-letter queues, acquireRelease resource safety, retry, and runDrain/runCollect terminators. Use whenever building or wiring a pipeline in Effect code – streaming over a collection or large file, paginating an API into one stream, processing items concurrently or in batches, adding backpressure or throttling, fanning out to multiple consumers, merging streams, capturing failed items in a DLQ, or running a stream for its side effects – even if the user just says "process this list", "stream this file", "rate-limit this", or "build a pipeline".
source-rules:
  - building-data-pipelines.md
---

# Effect – Building Data Pipelines

A data pipeline in Effect is a `Stream<A, E, R>` – a lazy, pull-based sequence
of values you build by composing operators, then terminate with a runner. The
consumer pulls, so the producer only advances as fast as the slowest stage:
backpressure is the default, not something you bolt on. Because a stream is
just a value, you assemble a source → transform → sink pipeline declaratively
and only the runner (`runDrain`, `runCollect`, …) actually executes it.

## When to use this

- Sourcing a pipeline from an in-memory list, a large file read in chunks, or a
  paginated API turned into one continuous stream.
- Processing items effectfully with bounded concurrency, or grouping them into
  batches for bulk operations.
- Adding backpressure: buffering, throttling to a rate, debouncing, or bridging
  a fast producer and slow consumer through a bounded queue.
- Fanning one stream out to multiple consumers (broadcast / partition /
  groupByKey) or combining several streams (merge / concat / zip).
- Capturing failed items in a dead-letter queue instead of dropping them,
  managing resource lifecycles safely, or retrying transient failures.

## Mental model

Every pipeline has three parts: a **source** (`Stream.fromIterable`,
`Stream.fromReadable`/`fs.readFile`, `Stream.paginateEffect`), zero or more
**transforms** (`map`, `mapEffect`, `grouped`, `throttle`, `broadcast`, …), and
a **terminator** that produces an `Effect` you run (`runDrain` for side effects,
`runCollect` to gather a `Chunk`, `runFold` to reduce). Nothing runs until the
terminator's effect is executed. Concurrency is a per-operator option
(`Stream.mapEffect(f, { concurrency: n })`), not a separate combinator, and the
pull-based model means a slow sink automatically slows the source – so reach for
explicit `buffer`/`throttle` only when you want to *decouple* rates, not merely
to avoid overrun. Errors flow in the stream's `E` channel, so `retry`,
`catchAll`, and a DLQ stage compose into the pipeline like any other operator.

## Core patterns

### Stream a collection with bounded concurrency

`Stream.mapEffect` applies an effectful function per item; the `concurrency`
option caps in-flight work while preserving resource safety:

```typescript
import { Effect, Stream, Chunk } from "effect";

const getUserById = (id: number): Effect.Effect<{ id: number; name: string }, Error> =>
  Effect.succeed({ id, name: `User ${id}` }).pipe(Effect.delay("100 millis"));

const program = Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
  Stream.mapEffect(getUserById, { concurrency: 2 }), // at most 2 in flight
  Stream.runCollect                                  // gather into a Chunk
);
```

### Process a large file in constant memory

Read the file as a byte stream and decode/split lazily – the file is pulled in
chunks, never loaded whole:

```typescript
import { FileSystem } from "@effect/platform";
import { Effect, Stream } from "effect";

const lines = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    yield* fs.readFile(path).pipe(
      Stream.decodeText("utf-8"),
      Stream.splitLines,
      Stream.tap((line) => Effect.log(`Processing: ${line}`)),
      Stream.runDrain
    );
  });
```

### Turn a paginated API into one stream

`Stream.paginateEffect` carries page state; return the next page as
`Option.some`/`Option.none` to drive or end the stream:

```typescript
import { Effect, Stream, Chunk, Option } from "effect";

const fetchPage = (page: number): Effect.Effect<[Chunk.Chunk<User>, Option.Option<number>], FetchError> =>
  Effect.gen(function* () {
    const users = yield* getPage(page);
    const next = hasMore(page) ? Option.some(page + 1) : Option.none();
    return [users, next];
  });

const allUsers = Stream.paginateEffect(1, fetchPage); // one stream over every page
```

### Batch for bulk operations

`Stream.grouped(n)` reshapes a stream of items into a stream of `Chunk`s, so a
bulk sink runs once per batch instead of once per item:

```typescript
import { Effect, Stream, Chunk } from "effect";

const program = Stream.fromIterable(userIds).pipe(
  Stream.grouped(5),                                    // batches of 5
  Stream.mapEffect(saveUsersInBulk, { concurrency: 1 }), // one bulk insert per batch
  Stream.runDrain
);
```

### Throttle to a rate

`Stream.throttle` bounds throughput; `buffer` and `debounce` are the sibling
tools when you need to decouple producer and consumer rates:

```typescript
import { Stream } from "effect";

const limited = source.pipe(
  Stream.throttle({ cost: () => 1, units: 10, duration: "1 second", strategy: "enforce" })
);
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/building-data-pipelines.md` (14 patterns)
- Automatically Retry Failed Operations
- Collect All Results into a List
- Create a Stream from a List
- Fan Out to Multiple Consumers
- Implement Backpressure in Pipelines
- Implement Dead Letter Queues
- Manage Resources Safely in a Pipeline
- Merge Multiple Streams
- Process a Large File with Constant Memory
- Process collections of data asynchronously
- Process Items Concurrently
- Process Items in Batches
- Run a Pipeline for its Side Effects
- Turn a Paginated API into a Single Stream
