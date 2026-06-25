---
name: effect-http-api
description: Effect-TS server-side HTTP patterns with @effect/platform – building an HTTP server, defining routes and GET/POST handlers, extracting path params, returning JSON responses, validating request bodies with Schema, composing middleware, CORS, authentication, rate limiting, API error mapping, OpenAPI doc generation, and providing service dependencies to routes via Layer. Use whenever building or wiring an HTTP API/server in Effect – setting up HttpRouter/HttpServer, writing a route handler, parsing or validating an incoming request, returning HttpServerResponse.json, adding auth/CORS/rate-limit middleware, mapping domain errors to status codes, or generating OpenAPI – even if the user just says "add an endpoint", "validate this request body", or "stand up a server" in an Effect codebase. For outgoing HTTP calls (a client hitting another service), see the effect-http-client skill.
source-rules:
  - building-apis.md
---

# Effect – Building HTTP APIs

This is the server side of HTTP in Effect, built on `@effect/platform`. A server
is an Effect value: you assemble routes into an `HttpRouter`, each route handler
is an `Effect` producing an `HttpServerResponse`, and the whole app is served by
providing a platform-specific server layer (e.g. `NodeHttpServer.layer`). Because
handlers are effects, request validation, service access, and error handling all
flow through the normal `Effect<A, E, R>` channels rather than callbacks.

## When to use this

- Standing up an HTTP server and serving an app (`HttpServer.serveEffect`).
- Defining routes and GET/POST handlers with `HttpRouter`, including
  colon-prefixed path params (`/users/:userId`).
- Returning JSON with `HttpServerResponse.json`, or other typed responses.
- Validating request bodies against a `Schema` and turning failures into 400s.
- Composing middleware – logging, timing, CORS, auth, rate limiting.
- Mapping domain errors to HTTP status codes, and generating OpenAPI docs.
- Providing service dependencies (a `Database`, a config) to handlers via a Layer.

## Mental model

A handler is `Effect<HttpServerResponse, E, R>`. The router (`HttpRouter.empty`
plus `HttpRouter.get`/`HttpRouter.post`) maps a method + path to a handler;
unmatched paths get a 404 automatically. Path params come from
`HttpRouter.params`, the request from `HttpServerRequest`. A handler's `R`
(required services) and `E` (failures) propagate up to the router, so you satisfy
them by `Effect.provide`-ing layers before serving. Middleware is just a function
`Handler -> Handler`: it runs the inner effect and transforms the request,
response, error, or environment around it – composition is plain function
composition, not a framework registry.

## Core patterns

### Router + handler + JSON response, with a service dependency

Assemble routes on `HttpRouter.empty`, read params with `HttpRouter.params`, pull
a service from the environment, and serialize with `HttpServerResponse.json`.
Provide the service layer and a platform server layer before serving:

```typescript
import * as HttpRouter from "@effect/platform/HttpRouter";
import * as HttpResponse from "@effect/platform/HttpServerResponse";
import * as HttpServer from "@effect/platform/HttpServer";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Data, Effect } from "effect";

class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
  id: string;
}> {}

class Database extends Effect.Service<Database>()("Database", {
  sync: () => ({
    getUser: (id: string) =>
      id === "123"
        ? Effect.succeed({ name: "Paul" })
        : Effect.fail(new UserNotFoundError({ id })),
  }),
}) {}

const userHandler = Effect.flatMap(HttpRouter.params, (p) =>
  Effect.flatMap(Database, (db) => db.getUser(p["userId"] ?? "")).pipe(
    Effect.flatMap(HttpResponse.json)
  )
);

const app = HttpRouter.empty.pipe(
  HttpRouter.get("/users/:userId", userHandler)
);

const serverEffect = HttpServer.serveEffect(app).pipe(
  Effect.provide(Database.Default),
  Effect.provide(
    NodeHttpServer.layer(() => require("node:http").createServer(), {
      port: 3458,
    })
  )
);

NodeRuntime.runMain(Effect.scoped(serverEffect));
```

### Validate a request body with Schema

Define the shape as a `Schema`, then decode the incoming value. A decode failure
is a typed error in `E`, so it maps cleanly onto a 400 rather than throwing:

```typescript
import { Effect } from "effect";
import * as S from "effect/Schema";

const UserSchema = S.Struct({
  name: S.String,
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
});

// fails with ParseError in the E channel on invalid input
const validateUser = (data: unknown) => S.decodeUnknown(UserSchema)(data);
```

`@effect/platform` exposes `HttpServerRequest.schemaBodyJson(UserSchema)` to read
and validate the body in one step inside a handler; the platform turns a parse
failure into a descriptive 400.

### Middleware as a Handler transformer

Middleware wraps a handler: run the inner effect, then read the request or adjust
the response around it. Compose several by piping. This timing middleware adds a
response header:

```typescript
import { Effect } from "effect";
import { HttpServerResponse } from "@effect/platform";

const withTiming = <E, R>(
  handler: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>
) =>
  Effect.gen(function* () {
    const startTime = Date.now();
    const response = yield* handler;
    const duration = Date.now() - startTime;
    return HttpServerResponse.setHeader(
      response,
      "X-Response-Time",
      `${duration}ms`
    );
  });
```

### Map domain errors to status codes

Model failures as tagged errors and recover per tag at the edge, returning the
right status. Catch known tags to a 404/400 and let a fallback produce a 500:

```typescript
import { Effect } from "effect";

const handled = userHandler.pipe(
  Effect.catchTags({
    UserNotFoundError: (e) => HttpResponse.json({ error: e.id }, { status: 404 }),
    InvalidIdError: () => HttpResponse.json({ error: "bad id" }, { status: 400 }),
  })
);
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/building-apis.md` (13 patterns)
- Add Rate Limiting to APIs
- Compose API Middleware
- Configure CORS for APIs
- Create a Basic HTTP Server
- Extract Path Parameters
- Generate OpenAPI Documentation
- Handle a GET Request
- Handle API Errors
- Implement API Authentication
- Make an Outgoing HTTP Client Request
- Provide Dependencies to Routes
- Send a JSON Response
- Validate Request Body
