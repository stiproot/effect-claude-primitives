---
name: effect-platform
description: Effect-TS @effect/platform patterns for OS-level operations — executing
  shell commands with Command, filesystem operations with FileSystem (read/write/stat/
  mkdir/readDirectory plus advanced atomic-write, streaming, recursive traversal, locking,
  copy), persistent KeyValueStore, interactive Terminal I/O, cross-platform path
  manipulation (join/resolve/parse/normalize/relative, traversal-safe joins), and reading
  environment variables via Config. Use whenever Effect code touches the operating system:
  spawning a subprocess, reading or writing files, prompting for stdin, building or
  normalizing paths cross-platform, caching to disk, or pulling config from the
  environment — even if the user just says "run this command", "read this file", or
  "get an env var" in an Effect codebase.
source-rules:
  - platform.md
  - platform-getting-started.md
---

# Effect – Platform & OS Operations

`@effect/platform` is the portable abstraction layer over the operating system: shell
commands, the filesystem, terminal I/O, key-value storage, and paths. The services are
defined platform-agnostically and a concrete runtime (e.g. `@effect/platform-node`)
provides them, so the same program runs on Node, Bun, or Deno without change. Side
effects become typed Effects with proper error channels and resource cleanup instead of
raw async calls.

## When to use this

- Spawning and managing external processes (`Command.make`, capturing output, exit codes).
- Reading, writing, stat-ing, or listing files and directories (`FileSystem`).
- Advanced file work: atomic writes, streaming large files, recursive traversal, locking.
- Persisting small key-value data across runs (`KeyValueStore`).
- Prompting for and reading user input in a CLI (`Terminal`).
- Cross-platform path building/parsing and traversal-safe joins.
- Reading environment variables and app config (`Config`).

## Mental model

Platform capabilities are **services accessed from the `R` channel**, not free functions.
You `yield* FileSystem.FileSystem` (or `Terminal`, `KeyValueStore.KeyValueStore`) to get
the service, then call its methods, each returning an `Effect` whose failures live in the
`E` channel (typically `PlatformError`). You make the program runnable by providing a
platform layer at the edge – `Effect.provide(NodeContext.layer)` then `NodeRuntime.runMain`.
Environment variables come through the `Config` module (from `effect`), not `process.env`,
so missing-var failures are typed and defaults/options are first-class. Path operations
use Node's `node:path` so separators and normalization stay correct across OSes.

## Core patterns

**Run a shell command and capture output** – `Command.make` builds the spec; `Command.string`
/ `Command.lines` / `Command.exitCode` run it:

```typescript
import { Command, Effect } from "@effect/platform";

const ls = Command.make("ls", ["-la"]).pipe(Command.string);

// exit code, recovered instead of failing
const exists = Command.make("test", ["-f", "/etc/passwd"]).pipe(
  Command.exitCode,
  Effect.either
);
```

**Read and write files via the FileSystem service** – grab the service from `R`, then call
its methods:

```typescript
import { Effect } from "effect";
import { FileSystem } from "@effect/platform";
import { NodeContext, NodeRuntime } from "@effect/platform-node";

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  yield* fs.writeFileString("./app.log", `Started ${new Date().toISOString()}\n`);
  const content = yield* fs.readFileString("./config.json");
  return JSON.parse(content);
});

program.pipe(Effect.provide(NodeContext.layer), NodeRuntime.runMain);
```

**Read environment variables with Config** – typed, with defaults or `Option` instead of
throwing on missing:

```typescript
import { Config, Effect } from "effect";

const AppConfig = Config.all({
  apiKey: Config.string("API_KEY"),
  port: Config.number("PORT").pipe(Config.withDefault(3000)),
  debug: Config.boolean("DEBUG").pipe(Config.withDefault(false)),
});

const program = Effect.gen(function* () {
  const config = yield* AppConfig;
  yield* Effect.log(`Port: ${config.port}`);
});
```

**Cross-platform paths** – use `node:path` so separators, absolute/relative resolution,
and normalization are correct everywhere:

```typescript
import * as Path from "node:path";

const joined = Path.join("data", "reports", "2024"); // OS-correct separators
const abs = Path.resolve("./config/settings.json");
const { dir, base, name, ext } = Path.parse("/home/user/report.pdf");
```

## Pattern reference

The complete pattern set lives in `references/`. Open the file for the area you need –
each entry below is a `## ` heading inside that file.

### `references/platform.md` (6 patterns)
- Platform Pattern 1: Execute Shell Commands
- Platform Pattern 2: Filesystem Operations
- Platform Pattern 3: Persistent Key-Value Storage
- Platform Pattern 4: Interactive Terminal I/O
- Platform Pattern 5: Cross-Platform Path Manipulation
- Platform Pattern 6: Advanced FileSystem Operations

### `references/platform-getting-started.md` (2 patterns)
- Access Environment Variables
- Your First Platform Operation
