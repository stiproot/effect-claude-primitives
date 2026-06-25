---
name: effect-scheduling
description: Effect-TS scheduling and recurrence with Schedule – repeating an effect on a fixed interval, retrying failed operations, exponential backoff, cron-style periodic jobs, debounce/throttle, and advanced retry chains with circuit breakers. Use whenever you need an effect to recur or retry over time: polling or health-checking on an interval, retrying a flaky API call, adding backoff, scheduling jobs at calendar times, debouncing rapid input, throttling event handlers, or building a circuit breaker – even if the user just says "repeat this every N seconds", "retry until it works", "back off", "run this on a cron", or "poll the endpoint" in an Effect codebase.
source-rules:
  - scheduling.md
  - scheduling-periodic-tasks.md
---

# Effect – Scheduling & Recurrence

A `Schedule<Out, In, R>` is a reusable, composable description of *when* something
should recur – how many times, with what delays, and under what conditions to
stop. You hand a `Schedule` to `Effect.repeat` (recur on success) or
`Effect.retry` (recur on failure); the same combinators drive both. Because
schedules are values, you build complex policies (backoff capped at N attempts,
spaced-then-limited) by composing small ones rather than writing loop logic.

## When to use this

- Repeating a background task on a fixed cadence – health checks, polling,
  metrics flushes – with `Effect.repeat(Schedule.fixed(...))`.
- Retrying a flaky operation with `Effect.retry`, optionally only for certain
  error tags, and adding exponential backoff.
- Scheduling jobs at calendar times (cron-style) rather than simple intervals.
- Debouncing rapid input (wait for silence) or throttling event frequency.
- Building advanced resilience: retry chains, fallback chains, and circuit
  breakers that open after repeated failures.

## Mental model

Two entry points, one vocabulary. `Effect.repeat(schedule)` reruns an effect
*while it keeps succeeding*; `Effect.retry(schedule)` reruns it *while it keeps
failing*. The schedule decides the rhythm:

- `Schedule.recurs(n)` – at most `n` additional runs (a count).
- `Schedule.spaced(d)` – a fixed gap `d` *between* completions.
- `Schedule.fixed(d)` – a fixed *period* `d` (ignores how long the effect took).
- `Schedule.exponential(base, factor?)` – growing delays for backoff.

Compose them: `Schedule.intersect` (or `compose`) combines two schedules so both
must continue – e.g. exponential backoff *and* a max attempt count. `upTo`,
`addDelay`, and `untilInputEffect` further shape when recurrence stops.

## Core patterns

### Repeat on a fixed interval

`Schedule.fixed` repeats on a steady period regardless of execution time – the
backbone of polling and health checks. Fork it so the rest of your program keeps
running:

```typescript
import { Effect, Schedule, Duration } from "effect";

const poll = checkAllServices(config).pipe(
  Effect.repeat(Schedule.fixed(Duration.seconds(5)))
);

// run in background, interrupt later
const program = Effect.gen(function* () {
  const fiber = yield* poll.pipe(Effect.fork);
  // ... do other work ...
  yield* fiber.interrupt();
});
```

### Retry with exponential backoff, capped

Combine a growing delay with a max attempt count via `intersect`, so backoff
can't retry forever:

```typescript
import { Effect, Schedule } from "effect";

const withExponentialBackoff = fetchData.pipe(
  Effect.retry(
    Schedule.exponential("100 millis", 2).pipe( // 100ms, 200ms, 400ms...
      Schedule.intersect(Schedule.recurs(5))     // at most 5 retries
    )
  )
);
```

### Retry only specific errors

Pass an options object with a `while` predicate so transient failures retry but
permanent ones surface immediately:

```typescript
import { Effect, Schedule } from "effect";

const retryTransientOnly = fetchWithErrors(true).pipe(
  Effect.retry({
    schedule: Schedule.recurs(3),
    while: (error) =>
      error._tag === "NetworkError" || error._tag === "RateLimitError",
  })
);
```

### Spaced delay between runs

`Schedule.spaced` puts a fixed gap between completions; intersect with `recurs`
to bound the total:

```typescript
import { Effect, Schedule } from "effect";

const polling = logTime.pipe(
  Effect.repeat(
    Schedule.spaced("1 second").pipe(Schedule.intersect(Schedule.recurs(5)))
  )
);
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/scheduling.md` (3 patterns)
- Retry Failed Operations
- Scheduling Pattern 1: Repeat an Effect on a Fixed Interval
- Your First Schedule

### `references/scheduling-periodic-tasks.md` (3 patterns)
- Scheduling Pattern 3: Schedule Tasks with Cron Expressions
- Scheduling Pattern 4: Debounce and Throttle Execution
- Scheduling Pattern 5: Advanced Retry Chains and Circuit Breakers
