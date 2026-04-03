#!/usr/bin/env node

import { Command, Options } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the package root (two levels up from cli/dist)
const getPackageRoot = () => path.resolve(__dirname, "..", "..");

type SkillLevel = "beginner" | "intermediate" | "advanced" | "complete";

const mainCommand = Command.make("effect-claude-kit", {
  options: {
    level: Options.text("level").pipe(
      Options.withDescription("Skill level: beginner, intermediate, advanced, or complete"),
      Options.withDefault("beginner" as SkillLevel)
    ),
  },
}).pipe(
  Command.withDescription("Effect Claude Primitives - Install Effect patterns for Claude Code"),
  Command.withHandler(({ options }) =>
    Effect.gen(function* () {
      const level = options.level as SkillLevel;

      // Validate level
      const validLevels: SkillLevel[] = ["beginner", "intermediate", "advanced", "complete"];
      if (!validLevels.includes(level)) {
        yield* Console.error(`Invalid level: ${level}. Must be one of: ${validLevels.join(", ")}`);
        return yield* Effect.fail(new Error(`Invalid level: ${level}`));
      }

      yield* Console.log(`Installing Effect patterns for Claude Code (${level} level)...`);

      // Get paths
      const packageRoot = getPackageRoot();
      const targetDir = path.join(process.cwd(), ".claude", "rules");

      let sourceFile: string;
      let targetFile: string;

      if (level === "complete") {
        sourceFile = path.join(packageRoot, "rules", "complete", "effect-patterns-rules.md");
        targetFile = path.join(targetDir, "effect-patterns-complete.md");
      } else {
        sourceFile = path.join(packageRoot, "rules", "by-skill-level", `${level}.md`);
        targetFile = path.join(targetDir, `effect-patterns-${level}.md`);
      }

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
      yield* Console.log(`\nTo upgrade:`);
      yield* Console.log(`  npx effect-claude-kit install --level intermediate`);
      yield* Console.log(`  npx effect-claude-kit install --level advanced`);
      yield* Console.log(`  npx effect-claude-kit install --level complete`);
    })
  )
);

const cli = Command.run(mainCommand, {
  name: "Effect Claude Kit",
  version: "1.0.0",
});

Effect.suspend(() => cli(process.argv.slice(2))).pipe(
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
);
