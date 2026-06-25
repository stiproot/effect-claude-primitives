export interface Skill {
  id: string;           // Skill directory name under skills/
  title: string;        // Display name
  description: string;  // What the skill triggers on / covers
  recommended: boolean; // Is this in the starter set?
}

export const skills: Skill[] = [
  {
    id: "effect-getting-started",
    title: "Getting Started",
    description: "First steps with Effect – Hello World, succeed/fail, map, catchAll/catchTag, runSync/runPromise, project bootstrap, and building a Runtime from layers.",
    recommended: true
  },
  {
    id: "effect-core-concepts",
    title: "Core Concepts",
    description: "The Effect<A, E, R> mental model – gen vs pipe, map/flatMap/andThen/tap, Option and Either, the Data module, Layers, and lifting Promises/callbacks/throwing code.",
    recommended: true
  },
  {
    id: "effect-service-pattern",
    title: "Service Pattern",
    description: "Services and dependency injection – Effect.Service, Context.Tag, composing and merging Layers, providing dependencies, and structuring a service/agent module.",
    recommended: true
  },
  {
    id: "effect-error-handling",
    title: "Error Handling",
    description: "Typed/tagged errors, catchTag/catchTags/catchAll, retry with Schedule, timeouts, Cause inspection, error mapping across boundaries, and accumulating errors.",
    recommended: true
  },
  {
    id: "effect-concurrency",
    title: "Concurrency",
    description: "Fibers, fork/forEach/all with the concurrency option, racing and timeouts, shared state via Ref/SynchronizedRef, and Deferred/Semaphore/Latch/Queue/PubSub.",
    recommended: true
  },
  {
    id: "effect-testing",
    title: "Testing",
    description: "Running effects in tests, asserting success/failure, mock services and test Layers, the .Default layer, TestClock, fast-check property tests, and testing streams.",
    recommended: true
  },
  {
    id: "effect-streams",
    title: "Streams",
    description: "Stream and Sink patterns – building and running streams, map/filter/scan, merging, backpressure, grouping/windowing, resource safety, error handling, and sinks.",
    recommended: false
  },
  {
    id: "effect-http-api",
    title: "HTTP API",
    description: "Server-side HTTP with @effect/platform – routers and handlers, path params, JSON responses, Schema request validation, middleware, CORS, auth, rate limiting, OpenAPI.",
    recommended: false
  },
  {
    id: "effect-http-client",
    title: "HTTP Client",
    description: "Outgoing HTTP with @effect/platform HttpClient – GET/POST, Schema response parsing, timeouts, retry with backoff, caching, rate-limit handling, and testable client services.",
    recommended: false
  },
  {
    id: "effect-mcp-server",
    title: "MCP Server",
    description: "Building MCP (Model Context Protocol) servers – tool registration with Schema, the Effect.Service layer, createMcpApp bootstrap, session handling, and resilience.",
    recommended: false
  },
  {
    id: "effect-domain-modeling",
    title: "Domain Modeling",
    description: "Schema contracts, Brand for validated domain types, Data.TaggedError, Option for optional values, and distinguishing 'not found' from real failures.",
    recommended: false
  },
  {
    id: "effect-data-pipelines",
    title: "Data Pipelines",
    description: "End-to-end Stream pipelines – sourcing from lists/files/paginated APIs, bounded-concurrency mapEffect, batching, backpressure, fan-out, merging, DLQs, and terminators.",
    recommended: false
  },
  {
    id: "effect-observability",
    title: "Observability",
    description: "Structured logging, custom metrics, a Prometheus /metrics endpoint, distributed tracing with withSpan, OpenTelemetry, dashboards, SLO alerting, and tap debugging.",
    recommended: false
  },
  {
    id: "effect-scheduling",
    title: "Scheduling",
    description: "Recurrence with Schedule – fixed-interval repeats, retries, exponential backoff, cron-style jobs, debounce/throttle, and circuit breakers.",
    recommended: false
  },
  {
    id: "effect-platform",
    title: "Platform",
    description: "@effect/platform OS operations – shell commands, FileSystem read/write/stat, KeyValueStore, Terminal I/O, cross-platform path manipulation, and env vars via Config.",
    recommended: false
  },
  {
    id: "effect-resource-management",
    title: "Resource Management",
    description: "acquireRelease bracketing, Scope and addFinalizer, scoped Layers, managed runtimes, hierarchical resources, Pool for reuse, and acquisition timeouts.",
    recommended: false
  },
  {
    id: "effect-tooling-debugging",
    title: "Tooling & Debugging",
    description: "Dev-environment setup, the Effect LSP, reading Effect type errors, Biome/ESLint config, CI/CD, DevTools, performance profiling, and the @effect/mcp-server.",
    recommended: false
  }
];

export const starterPreset = skills
  .filter(s => s.recommended)
  .map(s => s.id);
