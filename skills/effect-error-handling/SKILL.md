---
name: effect-error-handling
description: Effect-TS error-handling patterns – typed/tagged errors, catchTag/catchTags/catchAll, retry with Schedule, timeouts, Cause inspection, error mapping across domain boundaries, match/matchEffect on success and failure, and accumulating multiple errors. Use whenever working with failures in Effect code – recovering from errors, designing tagged error types, retrying flaky or slow operations, mapping errors across layer boundaries, inspecting a Cause for defects/interrupts, or pattern-matching on success/failure – even if the user just says "handle this error", "retry this", "add a timeout", or "make this resilient" in an Effect codebase.
source-rules:
  - error-handling.md
  - error-handling-resilience.md
  - error-management.md
---

# Effect – Error Handling

In Effect, errors are typed values in the `E` channel of `Effect<A, E, R>`, not
thrown exceptions. Recovery is just another effect that matches the failure and
returns the success channel instead. Because errors are values, the compiler
tracks every way an effect can fail and forces you to handle each one – so the
goal is to model failures precisely and recover by matching the tag, not by
wrapping everything in `try/catch`.

## When to use this

- Designing domain error types (`Data.TaggedError`) and exposing a clean error
  surface from a service or layer.
- Recovering from specific failures with `catchTag` / `catchTags`, or from
  everything with `catchAll`.
- Retrying flaky operations with `Schedule`, adding `timeout`, or combining both.
- Mapping low-level errors to domain errors across an architectural boundary.
- Inspecting a `Cause` to distinguish expected failures from defects/interrupts.
- Pattern-matching on both channels at once with `match` / `matchEffect`, or
  accumulating many validation errors instead of failing on the first.

## Mental model

`Effect<A, E, R>` succeeds with `A`, fails with a typed `E`, needs `R`. A
failure in `E` is an *expected* error you model and recover; a defect (in the
`Cause`) is an *unexpected* one you usually let crash or log. Tagged errors
(`Data.TaggedError("Name")<{...}>`) carry a `_tag` so `catchTag` can recover one
variant type-safely while leaving the rest in the error channel. Recovery
narrows `E`: catch a tag and it disappears from the type. `mapError` rewrites
`E` without recovering – the tool for turning a noisy inner error type into the
one error your layer promises to its callers.

## Core patterns

### Tagged errors + recover by tag

Define errors as tagged values; recover each variant with `catchTags`. Handled
tags leave the error channel, so the result type narrows to `never` here:

```typescript
import { Data, Effect } from "effect";

class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly url: string;
  readonly code: number;
}> {}
class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly id: string;
}> {}

const processUser = (id: string): Effect.Effect<string, never> =>
  fetchUser(id).pipe(
    Effect.catchTags({
      NetworkError: (e) => Effect.succeed(`Network error: ${e.code} for ${e.url}`),
      NotFoundError: (e) => Effect.succeed(`User ${e.id} not found`),
    })
  );
```

### Retry with Schedule + timeout

Bound each attempt with `timeout`, convert the timeout into a domain error, then
retry with an exponential-backoff `Schedule`, and finally fall back:

```typescript
import { Data, Duration, Effect, Schedule } from "effect";

const retryPolicy = Schedule.exponential(Duration.millis(100)).pipe(
  Schedule.compose(Schedule.recurs(3))
);

const result = api.fetchData().pipe(
  Effect.timeout(Duration.seconds(2)),
  Effect.catchTag("TimeoutException", () =>
    Effect.fail(new TimeoutError({ duration: "2 seconds" }))
  ),
  Effect.retry(retryPolicy),
  Effect.catchAll(() => Effect.succeed({ data: "fallback" }))
);
```

### Map errors across a boundary

Use `mapError` so a layer's public signature exposes only its own error type,
keeping inner failures from leaking into callers:

```typescript
import { Effect, Data } from "effect";

class RepositoryError extends Data.TaggedError("RepositoryError")<{
  readonly cause: unknown;
}> {}

// dbQuery fails with ConnectionError | QueryError; callers see only RepositoryError
const findUser = (): Effect.Effect<{ name: string }, RepositoryError> =>
  dbQuery().pipe(
    Effect.mapError((error) => new RepositoryError({ cause: error }))
  );
```

### Match both channels at once

`match` handles success and failure declaratively in one place (use
`matchEffect` when each branch is itself effectful):

```typescript
import { Effect } from "effect";

const program = Effect.fail("Oops!").pipe(
  Effect.match({
    onFailure: (err) => `Error: ${err}`,
    onSuccess: (value) => `Success: ${value}`,
  })
); // Effect<string>
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/error-management.md` (15 patterns)
- Checking Option and Either Cases
- Conditionally Branching Workflows
- Control Repetition with Schedule
- Effectful Pattern Matching with matchEffect
- Handle Errors with catchTag, catchTags, and catchAll
- Handle Flaky Operations with Retries and Timeouts
- Handle Unexpected Errors by Inspecting the Cause
- Handling Specific Errors with catchTag and catchTags
- Leverage Effect's Built-in Structured Logging
- Mapping Errors to Fit Your Domain
- Matching on Success and Failure with match
- Matching Tagged Unions with matchTag and matchTags
- Pattern Match on Option and Either
- Retry Operations Based on Specific Errors
- Your First Error Handler

### `references/error-handling.md` (3 patterns)
- Error Handling Pattern 1: Accumulating Multiple Errors
- Error Handling Pattern 2: Error Propagation and Chains
- Error Handling Pattern 3: Custom Error Strategies

### `references/error-handling-resilience.md` (1 pattern)
- Scheduling Pattern 2: Implement Exponential Backoff for Retries
