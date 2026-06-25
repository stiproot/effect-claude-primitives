---
name: effect-http-client
description: Effect-TS HTTP client patterns for outgoing requests – making a first GET/POST with @effect/platform HttpClient, parsing JSON responses safely with Schema, timeouts, retry with Schedule backoff, response caching and stale-while-revalidate, handling 429 rate-limit responses, and modelling the client as a testable Effect.Service with Live/Test layers. Use whenever calling an external API or fetching data over HTTP in Effect code – "fetch from this endpoint", "make an HTTP request", "call this API", "add a timeout to the request", "retry the request", "cache the response", "handle rate limits", "validate the JSON response", or "mock the HTTP client in tests" – even if the user just says "hit this URL" in an Effect codebase.
source-rules:
  - making-http-requests.md
---

# Effect – HTTP Client

This skill covers the client side of HTTP in Effect: making outgoing requests to
external services. The platform `HttpClient` is a service you pull from the
environment (`yield* HttpClient.HttpClient`), so requests are just effects –
they compose with `timeout`, `retry`, `catchTag`, caching, and logging the same
way any other effect does, and the implementation is swappable for tests via
layers. (For building a server that *receives* requests, see the
effect-http-api skill.)

## When to use this

- Making your first GET/POST against an API and reading the response.
- Validating untrusted JSON responses with `Schema` so API drift fails loudly.
- Bounding requests with `timeout`, or retrying transient failures with backoff.
- Caching responses (TTL, stale-while-revalidate, request deduplication).
- Detecting `429` responses and backing off per the `Retry-After` header.
- Wrapping the client as an `Effect.Service` with distinct Live and Test layers.
- Tracing requests/responses with structured logging.

## Mental model

`HttpClient.HttpClient` is a service in the `R` channel. `client.get(url)` yields
an `HttpClientResponse`; the body is a *separate* effect
(`HttpClientResponse.json(response)`) so decoding can fail independently of the
fetch. Provide an implementation at the edge with `NodeHttpClient.layer`. Because
the response body is `unknown`, never trust its shape – decode it with
`Schema.decodeUnknown` (which fails with a `ParseError` you can catch) rather
than casting. Resilience is composition: `timeout`, `retry(Schedule.…)`, and
`catchTag` wrap the request effect; they are not client config.

## Core patterns

### Your first request

Pull the client from the environment, fetch, read the body, and provide
`NodeHttpClient.layer` at the run boundary:

```typescript
import { Effect, Console } from "effect"
import { HttpClient, HttpClientResponse } from "@effect/platform"
import { NodeHttpClient, NodeRuntime } from "@effect/platform-node"

const simpleGet = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const response = yield* client.get("https://jsonplaceholder.typicode.com/posts/1")
  return yield* HttpClientResponse.json(response)
})

simpleGet.pipe(
  Effect.tap((data) => Console.log(JSON.stringify(data))),
  Effect.provide(NodeHttpClient.layer),
  NodeRuntime.runMain
)
```

### Parse JSON responses safely

The body is `unknown`. Decode it against a `Schema` so a changed API surfaces as
a `ParseError` rather than a silent runtime bug downstream:

```typescript
import { Effect, Schema } from "effect"
import { HttpClient, HttpClientResponse } from "@effect/platform"

const PostSchema = Schema.Struct({
  id: Schema.Number,
  title: Schema.String,
  body: Schema.String,
  userId: Schema.Number,
})

const getPost = (id: number) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    const response = yield* client.get(`https://api.example.com/posts/${id}`)
    const json = yield* HttpClientResponse.json(response)
    return yield* Schema.decodeUnknown(PostSchema)(json) // fails with ParseError
  })
```

### Timeout with a domain error

`Effect.timeout` returns `Option`; `timeoutFail` lets you convert a slow request
straight into a tagged error you can `catchTag` on:

```typescript
import { Effect, Duration, Data } from "effect"
import { HttpClient, HttpClientResponse } from "@effect/platform"

class RequestTimeoutError extends Data.TaggedError("RequestTimeoutError")<{
  readonly url: string
  readonly timeout: Duration.Duration
}> {}

const fetchWithTimeout = (url: string, timeout: Duration.DurationInput) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    return yield* client.get(url).pipe(
      Effect.flatMap((r) => HttpClientResponse.json(r)),
      Effect.timeoutFail({
        duration: timeout,
        onTimeout: () =>
          new RequestTimeoutError({ url, timeout: Duration.decode(timeout) }),
      })
    )
  })
```

### Retry with exponential backoff

`retry` takes a `Schedule`. Compose exponential backoff with a recurrence cap and
jitter; use `while` to retry only the failures that are worth retrying:

```typescript
import { Effect, Schedule } from "effect"
import { HttpClient, HttpClientResponse } from "@effect/platform"

const fetchWithRetry = (url: string) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient
    return yield* client.get(url).pipe(
      Effect.flatMap((r) => HttpClientResponse.json(r)),
      Effect.retry(
        Schedule.exponential("100 millis", 2).pipe(
          Schedule.intersect(Schedule.recurs(5)),
          Schedule.jittered
        )
      )
    )
  })
```

### Model the client as a testable service

Define an `Effect.Service` so business logic depends on the abstract client; swap
a `Layer.succeed` mock in tests with no network:

```typescript
import { Effect, Data, Layer } from "effect"

interface HttpErrorType { readonly _tag: "HttpError"; readonly error: unknown }
const HttpError = Data.tagged<HttpErrorType>("HttpError")

class HttpClient extends Effect.Service<HttpClient>()("HttpClient", {
  sync: () => ({
    get: <T>(url: string): Effect.Effect<T, HttpErrorType> =>
      Effect.tryPromise({
        try: () => fetch(url).then((res) => res.json() as Promise<T>),
        catch: (error) => HttpError({ error }),
      }),
  }),
}) {}

const TestLayer = Layer.succeed(
  HttpClient,
  HttpClient.of({ get: <T>(_url: string) => Effect.succeed({ title: "Mock" } as T) })
)
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/making-http-requests.md` (10 patterns)
- Add Timeouts to HTTP Requests
- Build a Basic HTTP Server – *server-side; lives here for historical reasons. For servers see the effect-http-api skill.*
- Cache HTTP Responses – in-memory TTL cache, stale-while-revalidate, request deduplication
- Create a Testable HTTP Client Service – Live/Test layer split
- Handle Rate Limiting Responses – parse `Retry-After`, server + client-side limiting, batching
- Log HTTP Requests and Responses – annotated logs, log spans, request-id tracking, error logging
- Model Dependencies as Services
- Parse JSON Responses Safely – `Schema.decodeUnknown`, optional fields, validation errors
- Retry HTTP Requests with Backoff – selective retry by status, retry logging, `Retry-After`-aware retry
- Your First HTTP Request – GET, typed GET, POST with `jsonBody`, error handling
