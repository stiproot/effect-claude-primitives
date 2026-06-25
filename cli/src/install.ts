#!/usr/bin/env bun

import { Command } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { skills, starterPreset } from "./skills.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the package root (two levels up from cli/dist)
const getPackageRoot = () => path.resolve(__dirname, "..", "..");

// Parse CLI args
const args = process.argv.slice(2);
const hasFlag = (flag: string) => args.includes(`--${flag}`);
const getOptionValue = (flag: string): string | undefined => {
  const index = args.findIndex(arg => arg.startsWith(`--${flag}`));
  if (index === -1) return undefined;

  const arg = args[index];
  if (arg.includes("=")) {
    return arg.split("=")[1];
  }
  return args[index + 1];
};

const mainCommand = Command.make("effect-claude-primitives").pipe(
  Command.withDescription("Install Effect skills for Claude Code"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      // Handle --list
      if (hasFlag("list")) {
        yield* Console.log("\n📚 Available Effect Skills:\n");
        yield* Console.log("⭐ = Recommended for starter set\n");

        for (const skill of skills) {
          const marker = skill.recommended ? "⭐" : "  ";
          yield* Console.log(`${marker} ${skill.id}`);
          yield* Console.log(`   ${skill.description}\n`);
        }

        yield* Console.log("\nUsage examples:");
        yield* Console.log("  bun x effect-claude-primitives                    # Install recommended starter set");
        yield* Console.log("  bun x effect-claude-primitives --starter          # Install recommended starter set");
        yield* Console.log("  bun x effect-claude-primitives --skills effect-core-concepts,effect-testing");
        yield* Console.log("  bun x effect-claude-primitives --all              # Install all skills\n");
        return;
      }

      yield* Console.log("Installing Effect skills for Claude Code...\n");

      // Determine which skills to install. `--categories` stays as a
      // deprecated alias for `--skills`.
      let selectedSkills: string[];

      if (hasFlag("all")) {
        selectedSkills = skills.map(s => s.id);
        yield* Console.log("📦 Installing ALL skills...\n");
      } else if (hasFlag("starter")) {
        selectedSkills = starterPreset;
        yield* Console.log("🚀 Installing recommended starter skills...\n");
        for (const id of selectedSkills) {
          const skill = skills.find(s => s.id === id);
          if (skill) {
            yield* Console.log(`   ⭐ ${skill.title}`);
          }
        }
        yield* Console.log("");
      } else if (getOptionValue("skills") ?? getOptionValue("categories")) {
        const skillsStr = (getOptionValue("skills") ?? getOptionValue("categories"))!;
        if (getOptionValue("skills") === undefined) {
          yield* Console.warn("⚠️  --categories is deprecated; use --skills instead.");
        }
        selectedSkills = skillsStr.split(",").map(s => s.trim());
        yield* Console.log(`📦 Installing selected skills: ${selectedSkills.join(", ")}\n`);
      } else {
        // Default behaviour: install the recommended starter set.
        yield* Console.log("💡 Installing the recommended starter set.");
        yield* Console.log("   To customize, use: --skills skill1,skill2");
        yield* Console.log("   To see all options, use: --list\n");
        selectedSkills = starterPreset;
      }

      // Validate selected skills
      const validSkills: string[] = [];
      for (const id of selectedSkills) {
        const skill = skills.find(s => s.id === id);
        if (skill) {
          validSkills.push(id);
        } else {
          yield* Console.warn(`⚠️  Skill not found: ${id}`);
        }
      }

      if (validSkills.length === 0) {
        yield* Console.error("❌ No valid skills selected.");
        return yield* Effect.fail(new Error("No valid skills selected"));
      }

      // Get paths
      const packageRoot = getPackageRoot();
      const targetDir = path.join(process.cwd(), ".claude", "skills");

      // Create target directory
      yield* Effect.tryPromise({
        try: () => fs.mkdir(targetDir, { recursive: true }),
        catch: (error) => new Error(`Failed to create directory: ${error}`),
      });

      // Copy each selected skill directory (SKILL.md + references/)
      let installedCount = 0;

      for (const skillId of validSkills) {
        const skill = skills.find(s => s.id === skillId);
        const sourceDir = path.join(packageRoot, "skills", skillId);
        const targetSkillDir = path.join(targetDir, skillId);

        const exists = yield* Effect.tryPromise({
          try: () => fs.stat(sourceDir).then(stat => stat.isDirectory()).catch(() => false),
          catch: () => false,
        });

        if (!exists) {
          yield* Console.warn(`⚠️  Source skill not found: ${skillId}`);
          continue;
        }

        yield* Effect.tryPromise({
          try: () => fs.cp(sourceDir, targetSkillDir, { recursive: true }),
          catch: (error) => new Error(`Failed to copy ${skillId}: ${error}`),
        });

        yield* Console.log(`   ✓ ${skill?.title || skillId}`);
        installedCount++;
      }

      // Success summary
      yield* Console.log(`\n✅ Installed ${installedCount} skills to ${targetDir}`);
      yield* Console.log(`\n📖 Claude Code will load these skills on demand – each skill's full content is only pulled into context when its description matches the task.`);
      yield* Console.log(`\nNext steps:`);
      yield* Console.log(`  1. Open your project in Claude Code`);
      yield* Console.log(`  2. Start coding with Effect – Claude will trigger the relevant skill automatically`);
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
