---
name: effect-resource-management
description: Effect-TS resource-management patterns – acquireRelease bracketing, Scope and addFinalizer for manual lifecycles, composing scoped layers with Layer.merge, managed runtimes for scoped resources, building service layers from managed resources (Layer.scoped / Effect.Service scoped), hierarchical parent-child resources, Pool for reuse, and timeouts on acquisition/usage. Use whenever a resource needs guaranteed cleanup in Effect code – opening DB connections/files/sockets, writing acquire/release pairs, wiring finalizers, sharing a scoped service through a Layer, pooling expensive connections, or bounding a slow acquire – even if the user just says "open and close this safely", "make sure this gets cleaned up", "add a connection pool", or "manage this resource" in an Effect codebase.
source-rules:
  - resource-management.md
---

# Effect – Resource Management

In Effect, a resource that must be released is tied to a `Scope`: you pair an
`acquire` effect with a `release` effect, and the runtime guarantees the release
runs when the scope closes – on success, failure, *or* interruption. This
replaces `try/finally` and the leaks it causes, because cleanup is part of the
effect's type (`Scope` appears in the `R` channel) rather than discipline a
caller has to remember.

## When to use this

- Wrapping anything that must be torn down – DB connections, file handles,
  sockets, sessions – in a guaranteed acquire/release pair.
- Registering ad-hoc cleanup with `addFinalizer` for fine-grained control.
- Sharing a managed resource across a program as a service via `Layer.scoped`
  or `Effect.Service`'s `scoped` constructor, and composing several with
  `Layer.merge`.
- Modelling parent-child resource trees (database → connection → transaction)
  that must release in the right order.
- Reusing expensive resources across many operations with a `Pool`.
- Bounding a slow acquisition or usage with a timeout so nothing hangs forever.

## Mental model

Resources live in a `Scope`. `Effect.acquireRelease(acquire, release)` adds the
`release` to the current scope; `Effect.scoped` (or `Effect.scope`) opens a fresh
scope, runs the body, then closes it – running every registered finalizer in
**LIFO order** (last acquired, first released). Because the scope requirement
shows up as `Scope` in `Effect<A, E, R>`, the compiler tells you a resource is
unmanaged until you discharge it with `Effect.scoped`. Lift a scoped resource
into a reusable service with `Layer.scoped` / `Effect.Service`'s `scoped`
constructor so its lifecycle is owned by the layer, not by each caller.

## Core patterns

### Bracket a resource with `acquireRelease`

Pair acquire and release; the release is guaranteed to run when the scope closes:

```typescript
import { Effect } from "effect";

const getDbConnection = Effect.sync(() => ({ id: Math.random() })).pipe(
  Effect.tap(() => Effect.log("Connection Acquired"))
);
const closeDbConnection = (conn: { id: number }) =>
  Effect.log(`Connection ${conn.id} Released`);

const program = Effect.acquireRelease(
  getDbConnection,
  (connection) => closeDbConnection(connection)
).pipe(
  Effect.tap((connection) => Effect.log(`Using connection ${connection.id}...`))
);

Effect.runPromise(Effect.scoped(program));
```

### Expose a managed resource as a service

`Effect.Service`'s `scoped` constructor runs the acquire once, caches the value,
and registers cleanup via `addFinalizer` – callers just `yield* Database`:

```typescript
import { Effect } from "effect";

interface DatabaseService {
  readonly query: (sql: string) => Effect.Effect<string[]>;
}

class Database extends Effect.Service<DatabaseService>()("Database", {
  scoped: Effect.gen(function* () {
    const id = Math.floor(Math.random() * 1000);
    yield* Effect.log(`[Pool ${id}] Acquired`);
    yield* Effect.addFinalizer(() => Effect.log(`[Pool ${id}] Released`));
    return {
      query: (sql: string) =>
        Effect.sync(() => [`Result for '${sql}' from pool ${id}`]),
    };
  }),
}) {}

const program = Effect.gen(function* () {
  const db = yield* Database;
  return yield* db.query("SELECT * FROM users");
});

Effect.runPromise(Effect.scoped(program).pipe(Effect.provide(Database.Default)));
```

### Compose independent scoped layers with `Layer.merge`

Merge two services into one layer; their resources release in reverse
acquisition order on shutdown:

```typescript
import { Effect, Layer } from "effect";

const AppLayer = Layer.merge(Database.Default, ApiClient.Default);

const program = Effect.gen(function* () {
  const db = yield* Database;
  const api = yield* ApiClient;
  yield* Effect.log(yield* db.query("SELECT *"));
  yield* Effect.log(yield* api.fetch("/users"));
});

Effect.runPromise(Effect.provide(program, AppLayer));
```

### Pool expensive resources for reuse

A `Pool` caps how many resources exist; `pool.get` hands one out for the current
scope and returns it automatically when that scope ends:

```typescript
import { Effect, Pool } from "effect";

const makeConnectionPool = Pool.make({ acquire: createConnection, size: 5 });

const runQuery = (pool: Pool.Pool<DatabaseConnection>, sql: string) =>
  Effect.scoped(
    Effect.gen(function* () {
      const connection = yield* pool.get;
      return yield* connection.query(sql);
    })
  );
```

### Bound a slow acquire with a timeout

Always cap acquisition so a stuck dependency can't block forever:

```typescript
import { Effect } from "effect";

const acquireWithTimeout = acquireConnection.pipe(
  Effect.timeout("1 second"),
  Effect.catchTag("TimeoutException", () =>
    Effect.fail(new Error("Connection timeout - database unreachable"))
  )
);
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you
need – each entry below is a `## ` heading inside that file.

### `references/resource-management.md` (8 patterns)
- Compose Resource Lifecycles with `Layer.merge`
- Create a Managed Runtime for Scoped Resources
- Create a Service Layer from a Managed Resource
- Handle Resource Timeouts
- Manage Hierarchical Resources
- Manually Manage Lifecycles with `Scope`
- Pool Resources for Reuse
- Safely Bracket Resource Usage with `acquireRelease`
