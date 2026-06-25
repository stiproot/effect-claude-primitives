---
name: effect-mcp-server
description: Effect-TS patterns for building MCP (Model Context Protocol) servers — tool
  registration with Effect Schema, the Effect.Service layer for business logic,
  createMcpApp bootstrap, session handling, resilience (timeout/retry/Config), and the
  anti-patterns to avoid. Use whenever building or extending an MCP server in this
  codebase: registering a new tool, wiring up a `*-mcp` service, decoding tool inputs,
  shaping a ToolResult, naming tools, handling tool errors, or setting up the server
  entrypoint — even if the user just says "add an MCP tool" or "expose this to Claude".
source-rules:
  - mcp-server.md
---

# Effect – MCP Server Development

MCP servers expose platform-specific tools to Claude over HTTP. In this codebase every
server (`dapr-mcp`, `ga4-mcp`, `github-issues-mcp`, `shopify-mcp`, `meta-mcp`) follows
the same Effect-TS shape: tools are Effect programs, business logic lives in an
`Effect.Service`, and `mcp-core` provides the HTTP plumbing and session lifecycle. You
write tools and services; you do not write transport or session code.

## When to use this

- Adding a new tool to an existing `*-mcp` server (schema, effect, registration).
- Standing up a new MCP server from scratch (`index.ts` bootstrap, service, types).
- Decoding/validating tool input with Effect Schema and returning a `ToolResult`.
- Naming tools, shaping error responses, or deciding what goes in `structuredContent`.
- Wrapping a third-party client in an `Effect.Service` with timeout + retry.

## Mental model

A tool is a four-part unit: **Schema → Type → Effect → Registration**. The Schema is an
Effect `Schema.Struct` with `.annotations({ description })` (Claude reads those to pick
and fill tools). The Effect is the business logic, depending on services through the `R`
channel. Registration decodes raw args against the schema, runs the effect with its
services provided, and hands back a `ToolResult`. Errors are values in the `E` channel –
you `catchTag` them and convert to `{ isError: true }` results, never throw. Everything
external (clients, API calls) is built *inside* an `Effect.Service`, never at module
level, and every external call is wrapped in timeout + retry.

## Core patterns

**A tool, end to end** – schema with annotations, derived type, effect, and the
registration that decodes input and provides services:

```typescript
import { Effect, Schema } from "effect";
import { McpServer } from "mcp-core";

export const SubmitDataInputSchema = Schema.Struct({
  key: Schema.String.annotations({ description: "The cache key for storage" }),
});
export type SubmitDataInput = Schema.Schema.Type<typeof SubmitDataInputSchema>;

const submitDataEffect = (input: SubmitDataInput) =>
  Effect.gen(function* () {
    const service = yield* MyService;
    const result = yield* service.saveData(input.key);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(result) }],
      structuredContent: result,
    };
  }).pipe(
    Effect.catchTag("ServiceError", (error) =>
      Effect.succeed({
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true as const,
      })
    )
  );

export function registerSubmitDataTool(server: McpServer): void {
  server.registerTool(
    "submit_data",
    { title: "Submit Data", description: "Submits data to the platform", inputSchema: SubmitDataInputSchema },
    (args) =>
      Effect.runPromise(
        Effect.gen(function* () {
          const input = yield* Schema.decodeUnknown(SubmitDataInputSchema)(args);
          return yield* submitDataEffect(input);
        }).pipe(Effect.provide(MyService.Default))
      )
  );
}
```

**Service with resilience** – build the client inside the effect, then timeout + retry
every external call:

```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(function* () {
    const config = yield* MyConfig;
    const client = new ThirdPartyClient(config.apiKey); // inside effect, not module-level

    return {
      fetchData: (id: string) =>
        Effect.tryPromise({
          try: () => client.get(id),
          catch: (error) => new ApiError({ cause: error }),
        }).pipe(
          Effect.timeoutFail({
            duration: "60 seconds",
            onTimeout: () => new TimeoutError({ operation: "fetchData" }),
          }),
          Effect.retry({
            schedule: Schedule.exponential("1 second").pipe(
              Schedule.jittered,
              Schedule.intersect(Schedule.recurs(3))
            ),
          }),
          Effect.withSpan("fetchData", { attributes: { id } })
        ),
    };
  }),
  dependencies: [MyConfig.Default],
}) {}
```

**Tool naming** – `{platform}_{action}_{resource}` in `snake_case`: `ga4_run_report`,
`shopify_get_orders`, `dapr_save_state`. Never camelCase.

**Config, not `process.env`** – read everything through the Effect `Config` module, with
`Config.secret` for sensitive values and `Config.withDefault` for optionals.

## Pattern reference

The full guide lives in `references/mcp-server.md`. It is organised as sections rather
than a flat pattern list – open it for the area you need:

### `references/mcp-server.md`
- **Overview** – what MCP servers are and the shared architecture across servers.
- **Architecture** – canonical `src/{name}-mcp/` directory structure.
- **Core Patterns** (10 numbered patterns):
  1. Tool Structure – the Schema → Type → Effect → Registration unit.
  2. Tool Naming Convention – `{platform}_{action}_{resource}`, snake_case.
  3. ToolResult Structure – `content` / `isError` / `structuredContent`.
  4. Server Setup Pattern – `createMcpApp`, SIGINT shutdown, top-level service provision.
  5. Service Pattern – `Effect.Service` with in-effect client init.
  6. Configuration – `Config.all`, `Config.secret`, `Config.withDefault`.
  7. Error Handling – per-domain `Data.TaggedError` types, catch into ToolResult.
  8. Logging – `createLogger` from mcp-core, one per module.
  9. Schema Conventions – `Schema` with descriptive annotations for Claude.
  10. Resilience Patterns – timeout, retry with backoff/jitter, third-party error guards.
- **Anti-Patterns** – the don'ts (process.env, module-level clients, raw Promises,
  missing timeouts, throwing, Zod, skipped logging, camelCase names, malformed ToolResult).
- **Tool Registration Pattern** – aggregating tools in `src/tools/index.ts`.
- **Session Management** – handled by `mcp-core` `createMcpApp`; endpoints it provides.
- **Testing** – what integration tests should cover.
- **Reference Implementations** – `dapr-mcp`, `ga4-mcp`, `github-issues-mcp` as canonical examples.
