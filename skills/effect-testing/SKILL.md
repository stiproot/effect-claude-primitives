---
name: effect-testing
description: Effect-TS testing patterns – running effects in tests with Effect.runPromise, asserting success/failure, providing mock services via Effect.provideService and test Layers, the auto-generated .Default layer, controlling time deterministically with TestClock/Clock, property-based testing with fast-check, testing concurrent code (fibers, Ref, Deferred, races, timeouts), testing streaming effects with Stream.runCollect/runFold/runDrain, and organizing layers into composable test modules. Use whenever writing or fixing tests for Effect code – "write a test for this effect", "mock this service", "how do I test a service/layer", "test that this fails", "make this concurrent test deterministic", "test a stream", "control time in a test", "property test", or setting up vitest around Effect programs.
source-rules:
  - testing.md
---

# Effect – Testing

Effect code is testable because effects are *descriptions* of computations, not
side effects that fire on definition. You run an effect in a test with
`Effect.runPromise` (or `runSync`) and assert on the resolved value or the
rejection. Dependencies live in the `R` channel, so you swap real services for
test doubles by providing a different `Layer` – no monkey-patching, no global
mocks. Time and concurrency are also values you control (`TestClock`, fibers),
which makes otherwise-flaky tests deterministic.

## When to use this

- Writing your first test for an `Effect`-returning function and asserting on
  success or failure.
- Testing code that depends on services: providing a mock or in-memory
  implementation via `Effect.provideService` or a test `Layer`.
- Using the auto-generated `.Default` layer for `Effect.Service`-defined services.
- Making time-dependent logic deterministic with `Clock` / `TestClock`.
- Property-based testing of pure functions, Effect operations, and Schema
  roundtrips with `fast-check`.
- Testing concurrent code – parallel execution, races, fiber lifecycles,
  timeouts, `Ref` atomicity, `Deferred` synchronization.
- Testing streams – transforms, aggregation, error handling, resource cleanup.
- Composing layers into modular test setups for larger applications.

## Mental model

A test runs an effect to a `Promise` and asserts on the outcome:
`runPromise` resolves with the `A` value and *rejects* on a failure in `E`, so
`await expect(runPromise(failing)).rejects.toThrow(...)` is how you assert
failures. Anything in the `R` channel must be provided before you run –
`Effect.provideService(Tag, impl)` for a single service, `Effect.provide(layer)`
for a wired graph. A service defined with `Effect.Service` gets a free
`.Default` layer you can provide directly; substituting a test double is just
providing a different layer with the same tag. For time, depend on `Clock`
rather than `Date.now()`, then provide `TestClock` and call `TestClock.adjust`
to move the clock forward by exact durations without real waiting.

## Core patterns

### Your first test – run and assert

`runPromise` resolves with the success value and rejects on failure:

```typescript
import { describe, it, expect } from "vitest";
import { Effect } from "effect";

const divide = (a: number, b: number): Effect.Effect<number, Error> =>
  b === 0 ? Effect.fail(new Error("Cannot divide by zero")) : Effect.succeed(a / b);

describe("divide", () => {
  it("divides", async () => {
    expect(await Effect.runPromise(divide(10, 2))).toBe(5);
  });

  it("fails on divide by zero", async () => {
    await expect(Effect.runPromise(divide(10, 0))).rejects.toThrow(
      "Cannot divide by zero"
    );
  });
});
```

### Provide a mock service

Swap a real dependency for a test double with `Effect.provideService` – the
program under test never changes:

```typescript
import { Effect, Context } from "effect";

class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  { readonly findById: (id: string) => Effect.Effect<User | null> }
>() {}

const makeTestRepo = (users: User[]) => {
  const byId = new Map(users.map((u) => [u.id, u]));
  return UserRepository.of({
    findById: (id) => Effect.succeed(byId.get(id) ?? null),
  });
};

const result = await Effect.runPromise(
  getUser("123").pipe(Effect.provideService(UserRepository, makeTestRepo([alice])))
);
```

### Control time with TestClock

Depend on `Clock`, provide `TestClock.live`, then `adjust` to fast-forward
exactly – no real sleeping, fully deterministic:

```typescript
import { Effect, Fiber, TestClock } from "effect";

const result = await Effect.runPromise(
  Effect.gen(function* () {
    const fiber = yield* Effect.fork(slowOp.pipe(Effect.timeout("1 second")));
    yield* TestClock.adjust("2 seconds"); // push past the timeout instantly
    return yield* Fiber.join(fiber);
  }).pipe(Effect.provide(TestClock.live))
);

expect(result._tag).toBe("None"); // timed out
```

### Test a stream by collecting it

Run a stream to a `Chunk` and assert on the array:

```typescript
import { Effect, Stream, Chunk } from "effect";

const result = await Effect.runPromise(
  Stream.fromIterable([1, 2, 3, 4, 5]).pipe(
    Stream.map((n) => n * 2),
    Stream.runCollect
  )
);

expect(Chunk.toReadonlyArray(result)).toEqual([2, 4, 6, 8, 10]);
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/testing.md` (10 patterns)
- Accessing the Current Time with Clock
- Mocking Dependencies in Tests
- Organize Layers into Composable Modules
- Property-Based Testing with Effect
- Test Concurrent Code
- Test Effects with Services
- Test Streaming Effects
- Use the Auto-Generated .Default Layer in Tests
- Write Tests That Adapt to Application Code
- Your First Effect Test
