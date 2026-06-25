---
name: effect-streams
description: Effect-TS Stream and Sink patterns – building and running streams (runCollect/runForEach/runDrain/runFold), map/filter/scan/take/drop, merging and combining streams, controlling backpressure with buffer/throttle, grouping and windowing, resource management inside streams, stream error handling and retry, plus Sinks for batch DB inserts, event logs, files, message queues, fallback and retry. Use whenever working with sequences of values over time in Effect code – processing a file line by line, paginated API results, real-time events, large datasets or data pipelines; or whenever choosing between Stream and Effect – even if the user just says "stream this", "process these records in batches", "handle backpressure", "write a sink", or "build a pipeline" in an Effect codebase.
source-rules:
  - streams-getting-started.md
  - streams.md
  - streams-sinks.md
---

# Effect – Streams and Sinks

A `Stream<A, E, R>` is the multi-value sibling of `Effect<A, E, R>`: where an
Effect produces one result, a Stream produces zero, one, or many `A` values
over time, can fail with `E`, and needs `R`. Streams are pull-based and lazy –
nothing happens until you run them – which is what gives Effect streams their
backpressure: a slow consumer naturally throttles a fast producer. A `Sink<A,
E, In, R>` is the consuming end – it folds a stream's elements into a single
result (a count, a batch flushed to a database, a file written).

## When to use this

- Processing sequences: files line by line, paginated API pages, event feeds,
  large datasets that should not be loaded into memory at once.
- Transforming pipelines with `map`/`filter`/`scan`/`take`/`drop`, or running
  effectful steps per element with `mapEffect`.
- Merging or combining several sources, or controlling throughput with
  `buffer`/`throttle` and grouping/windowing.
- Managing resources that must open before and close after a stream, and
  handling or retrying failures mid-stream.
- Writing a `Sink` to batch-insert into a DB, append to an event log, write a
  file, push to a queue, or fall back / retry on failure.
- Deciding whether a task is a Stream job at all versus a plain Effect.

## Mental model

Reach for **Stream** when you have *many* values – especially values that
arrive over time or are too large to hold in memory. Reach for **Effect** when
you have a *single* result. Conversions bridge them: `Stream.fromEffect` lifts
one value into a 1-element stream, and the `Stream.run*` family collapses a
stream back into an Effect. A Stream is just a description until you run it, so
build the pipeline freely and only pay for it at the `run*` boundary. Sinks are
the dual of streams: a stream defines *what flows*, a sink defines *what the
flow accumulates into*.

## Core patterns

### Run a stream into an Effect

Pick the `run*` method by what you need back – all of them turn the lazy stream
into a runnable Effect:

```typescript
import { Effect, Stream } from "effect"

const numbers = Stream.make(1, 2, 3, 4, 5)

// Collect every element into a Chunk
const collected = numbers.pipe(Stream.map((n) => n * 10), Stream.runCollect)

// Run for side effects only, discarding values
const drained = numbers.pipe(
  Stream.tap((n) => Effect.log(`Saw: ${n}`)),
  Stream.runDrain
)

// Accumulate into a single value
const sum = numbers.pipe(Stream.runFold(0, (acc, n) => acc + n)) // Effect<number>
```

### Transform with map / filter / scan

Build the pipeline declaratively; `scan` carries running state element by
element (here a running total emitted alongside each step):

```typescript
import { Effect, Stream } from "effect"

const program = Stream.make(1, 2, 3, 4, 5).pipe(
  Stream.filter((n) => n % 2 === 1),       // keep odds
  Stream.map((n) => n * 100),              // transform
  Stream.scan(0, (acc, value) => acc + value), // running total
  Stream.runCollect
)
```

### Per-element effects + error handling

`mapEffect` runs an effectful step per element; `catchAll` recovers a failed
stream by switching to a fallback stream:

```typescript
import { Effect, Stream } from "effect"

const pipeline = Stream.fromIterable(ids).pipe(
  Stream.mapEffect((id) => fetchRecord(id)), // Effect per element
  Stream.catchAll((error) =>
    Stream.make({ id: "fallback", error: String(error) })
  ),
  Stream.runCollect
)
```

### A Sink that batches and flushes

`Sink.fold` accumulates a batch and flushes when it fills – the consuming dual
of a stream. Pair it with `Stream.paginateEffect` to drive it from a paginated
source:

```typescript
import { Effect, Stream, Sink } from "effect"

// Accumulate users into batches of 50, counting total inserted
const batchInsertSink = Sink.fold(
  { batch: [] as User[], total: 0 },
  () => true,
  (state, user: User) => {
    const batch = [...state.batch, user]
    return batch.length >= 50
      ? { batch: [], total: state.total + batch.length }
      : { ...state, batch }
  }
)

const run = userStream.pipe(Stream.run(batchInsertSink))
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/streams-getting-started.md` (4 patterns)
- Running and Collecting Stream Results
- Stream vs Effect - When to Use Which
- Take and Drop Stream Elements
- Your First Stream

### `references/streams.md` (8 patterns)
- Stream Pattern 1: Transform Streams with Map and Filter
- Stream Pattern 2: Merge and Combine Multiple Streams
- Stream Pattern 3: Control Backpressure in Streams
- Stream Pattern 4: Stateful Operations with Scan and Fold
- Stream Pattern 5: Grouping and Windowing Streams
- Stream Pattern 6: Resource Management in Streams
- Stream Pattern 7: Error Handling in Streams
- Stream Pattern 8: Advanced Stream Transformations

### `references/streams-sinks.md` (6 patterns)
- Sink Pattern 1: Batch Insert Stream Records into Database
- Sink Pattern 2: Write Stream Events to Event Log
- Sink Pattern 3: Write Stream Lines to File
- Sink Pattern 4: Send Stream Records to Message Queue
- Sink Pattern 5: Fall Back to Alternative Sink on Failure
- Sink Pattern 6: Retry Failed Stream Operations
