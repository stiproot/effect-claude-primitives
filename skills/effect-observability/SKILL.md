---
name: effect-observability
description: Effect-TS observability patterns – structured logging with Effect.log/logInfo/logError and annotateLogs, custom metrics via Metric.counter/gauge/histogram/timer, exporting a /metrics endpoint for Prometheus, distributed tracing with Effect.withSpan, OpenTelemetry integration, instrumenting function boundaries with Effect.fn, plus dashboards, SLO-based alerting, and debugging with Effect.tap. Use whenever making Effect code observable – adding logs, recording or exposing metrics, wiring up tracing/spans, propagating trace context across services, integrating OTel, setting up alerts, or just debugging a pipeline by inspecting values without changing flow – even if the user only says "add logging", "add a metric", "trace this", or "why is this slow" in an Effect codebase.
source-rules:
  - observability.md
---

# Effect – Observability

Observability in Effect is built on the runtime, not bolted on. Logging,
metrics, and tracing are all effects you compose into your workflow, so they
inherit the same context, structured annotations, and timing the runtime
already tracks. You instrument by wrapping operations (`Effect.withSpan`,
`Metric.track*`, `Effect.annotateLogs`) rather than scattering `console.log`
calls – which keeps instrumentation composable, type-safe, and separate from
business logic, and lets you swap the backend (Prometheus, OpenTelemetry,
Jaeger) without touching the instrumented code.

## When to use this

- Adding structured, leveled, context-annotated logging to a workflow.
- Defining custom counters, gauges, histograms, or timers for business and
  performance metrics, and exposing them to Prometheus.
- Tracing operations with spans, building parent/child span hierarchies, and
  propagating trace context across service boundaries.
- Integrating Effect tracing with OpenTelemetry, or instrumenting function
  boundaries with `Effect.fn`.
- Setting up SLO-based alerting, designing dashboards, or debugging a pipeline
  by inspecting intermediate values.

## Mental model

The three pillars are distinct effects. **Logs** are point-in-time structured
events – `Effect.log`/`logInfo`/`logError` emit them, `Effect.annotateLogs`
attaches structured context, `Effect.withLogSpan` adds timing. **Metrics** are
aggregates the runtime maintains – `Metric.counter`/`gauge`/`histogram`/`timer`
define them once, `Metric.increment`/`set`/`update`/`trackDuration` feed them,
and `Metric.tagged` adds label dimensions. **Traces** are causal trees of spans
– `Effect.withSpan(name, { attributes })` wraps an operation as a span, and
nesting spanned effects builds the parent/child hierarchy a tracing UI renders.
Because all three are just effects, you attach them with `.pipe(...)` and they
flow through the same `R` context as your domain logic.

## Core patterns

### Structured logging with annotations

Log at the right level and attach structured context rather than interpolating
everything into the message – annotations are queryable fields downstream:

```typescript
import { Effect } from "effect";

const processOrder = (orderId: string, userId: string) =>
  Effect.gen(function* () {
    yield* Effect.logInfo("Processing order").pipe(
      Effect.annotateLogs({ orderId, userId })
    );
    yield* Effect.sleep("50 millis");
    yield* Effect.logInfo("Order processed successfully").pipe(
      Effect.annotateLogs({ orderId, status: "completed" })
    );
  }).pipe(Effect.withLogSpan("processOrder")); // adds timing for the span
```

### Custom metrics

Define metrics once, then feed them inside your logic. Counters count events,
gauges track an up/down value, timers/histograms track distributions:

```typescript
import { Effect, Metric } from "effect";

const userRegisteredCounter = Metric.counter("users_registered_total", {
  description: "How many users have been registered.",
});
const dbDurationTimer = Metric.timer(
  "db_operation_duration",
  "A timer for DB operation durations"
);

const createUser = Effect.gen(function* () {
  yield* saveUserToDb.pipe(Metric.trackDuration(dbDurationTimer));
  yield* Metric.increment(userRegisteredCounter);
  return { status: "success" };
});
```

Add label dimensions with `Metric.tagged` before updating:

```typescript
yield* Metric.increment(
  httpRequestsByStatus.pipe(
    Metric.tagged("status", String(status)),
    Metric.tagged("path", path)
  )
);
```

### Tracing with spans

Wrap operations in named spans; nesting spanned effects builds the trace tree.
Attributes give each span queryable context:

```typescript
import { Effect } from "effect";

const validateInput = (input: unknown) =>
  doValidation(input).pipe(Effect.withSpan("validateInput")); // child span

const saveToDatabase = (user: { email: string }) =>
  doSave(user).pipe(
    Effect.withSpan("saveToDatabase", {
      attributes: { "db.system": "postgresql", "db.user.email": user.email },
    })
  );

const createUser = (input: unknown) =>
  Effect.gen(function* () {
    const validated = yield* validateInput(input);
    return yield* saveToDatabase(validated);
  }).pipe(Effect.withSpan("createUserOperation")); // parent span
```

### Debug without changing flow

`Effect.tap` runs a side effect (a log) on a value and passes the original
value through unchanged – the right tool for inspecting a pipeline:

```typescript
import { Effect } from "effect";

const processUser = (id: string) =>
  fetchUser(id).pipe(
    Effect.tap((user) => Effect.log(`Fetched user: ${user.name}`)),
    Effect.map((user) => ({ ...user, processed: true }))
  );
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file. (Note: the source
file repeats a few headings – "Add Custom Metrics to Your Application" and
"Trace Operations Across Services with Spans" each appear twice, as distinct
examples; they are listed once below.)

### `references/observability.md`
- Add Custom Metrics to Your Application (appears twice – `Metric.counter`/`gauge`/`histogram`/`timer` + `Metric.increment`/`set`/`update`)
- Create Observability Dashboards
- Debug Effect Programs
- Export Metrics to Prometheus
- Implement Distributed Tracing
- Instrument and Observe Function Calls with Effect.fn
- Integrate Effect Tracing with OpenTelemetry
- Leverage Effect's Built-in Structured Logging
- Set Up Alerting
- Trace Operations Across Services with Spans (appears twice – attributes on spans + parent/child span hierarchy)
- Your First Logs
