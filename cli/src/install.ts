#!/usr/bin/env node

import { Command } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the package root (two levels up from cli/dist)
const getPackageRoot = () => path.resolve(__dirname, "..", "..");

const mainCommand = Command.make("effect-claude-primitives").pipe(
  Command.withDescription("Install comprehensive Effect patterns for Claude Code"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      yield* Console.log("Installing Effect patterns for Claude Code...");

      // Get paths
      const packageRoot = getPackageRoot();
      const targetDir = path.join(process.cwd(), ".claude", "rules");
      const sourceFile = path.join(packageRoot, "rules", "effect-patterns-rules.md");
      const targetFile = path.join(targetDir, "effect-patterns.md");

      // Create target directory
      yield* Effect.tryPromise({
        try: () => fs.mkdir(targetDir, { recursive: true }),
        catch: (error) => new Error(`Failed to create directory: ${error}`),
      });

      // Check if source file exists
      const sourceExists = yield* Effect.tryPromise({
        try: () => fs.access(sourceFile).then(() => true).catch(() => false),
        catch: () => false,
      });

      if (!sourceExists) {
        yield* Console.error(`Source file not found: ${sourceFile}`);
        return yield* Effect.fail(new Error(`Source file not found: ${sourceFile}`));
      }

      // Copy the file
      yield* Effect.tryPromise({
        try: () => fs.copyFile(sourceFile, targetFile),
        catch: (error) => new Error(`Failed to copy file: ${error}`),
      });

      yield* Console.log(`✅ Installed Effect patterns to ${targetFile}`);
      yield* Console.log(`\nClaude Code will automatically load rules from .claude/rules/`);
      yield* Console.log(`\nNext steps:`);
      yield* Console.log(`  1. Open your project in Claude Code`);
      yield* Console.log(`  2. Start coding with Effect - Claude will use these patterns`);
      yield* Console.log(`\nThe complete ruleset (700+ patterns, 797KB) is now available to Claude.`);
    })
  )
);

const cli = Command.run(mainCommand, {
  name: "Effect Claude Primitives",
  version: "1.0.0",
});

Effect.suspend(() => cli(process.argv.slice(2))).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
);
