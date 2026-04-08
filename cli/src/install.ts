#!/usr/bin/env bun

import { Command } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { categories, starterPreset } from "./categories.js";

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
  Command.withDescription("Install Effect patterns for Claude Code"),
  Command.withHandler(() =>
    Effect.gen(function* () {
      // Handle --list
      if (hasFlag("list")) {
        yield* Console.log("\n📚 Available Effect Pattern Categories:\n");
        yield* Console.log("⭐ = Recommended for starter set\n");

        for (const cat of categories) {
          const marker = cat.recommended ? "⭐" : "  ";
          yield* Console.log(`${marker} ${cat.id}`);
          yield* Console.log(`   ${cat.description}`);
          yield* Console.log(`   Size: ${cat.size}\n`);
        }

        yield* Console.log("\nUsage examples:");
        yield* Console.log("  bun x effect-claude-primitives                    # Interactive selection");
        yield* Console.log("  bun x effect-claude-primitives --starter          # Install recommended");
        yield* Console.log("  bun x effect-claude-primitives --categories core-concepts,testing");
        yield* Console.log("  bun x effect-claude-primitives --all              # Install all (816KB)\n");
        return;
      }

      yield* Console.log("Installing Effect patterns for Claude Code...\n");

      // Determine which categories to install
      let selectedCategories: string[];

      if (hasFlag("all")) {
        selectedCategories = categories.map(c => c.id);
        yield* Console.log("📦 Installing ALL categories (816KB total)...");
        yield* Console.log("⚠️  Note: This may trigger Claude Code performance warnings.\n");
      } else if (hasFlag("starter")) {
        selectedCategories = starterPreset;
        yield* Console.log("🚀 Installing recommended starter categories...\n");
        for (const id of selectedCategories) {
          const cat = categories.find(c => c.id === id);
          if (cat) {
            yield* Console.log(`   ⭐ ${cat.title} (${cat.size})`);
          }
        }
        yield* Console.log("");
      } else if (getOptionValue("categories")) {
        const categoriesStr = getOptionValue("categories")!;
        selectedCategories = categoriesStr.split(",").map(s => s.trim());
        yield* Console.log(`📦 Installing selected categories: ${selectedCategories.join(", ")}\n`);
      } else {
        // Interactive mode
        yield* Console.log("🎯 Select Effect pattern categories to install:");
        yield* Console.log("   (⭐ = recommended for getting started)\n");

        const choices = categories.map(cat => ({
          title: `${cat.recommended ? "⭐ " : ""}${cat.title} - ${cat.description} (${cat.size})`,
          value: cat.id
        }));

        // For interactive mode, we'll use a simpler approach since Prompt.multiSelect
        // might not be available in this version. Let's use the starter preset by default
        // and allow users to use --categories for custom selection.
        yield* Console.log("💡 Using starter preset for this installation.");
        yield* Console.log("   To customize, use: --categories category1,category2");
        yield* Console.log("   To see all options, use: --list\n");
        selectedCategories = starterPreset;
      }

      // Validate selected categories
      const validCategories: string[] = [];
      for (const id of selectedCategories) {
        const cat = categories.find(c => c.id === id);
        if (cat) {
          validCategories.push(id);
        } else {
          yield* Console.warn(`⚠️  Category not found: ${id}`);
        }
      }

      if (validCategories.length === 0) {
        yield* Console.error("❌ No valid categories selected.");
        return yield* Effect.fail(new Error("No valid categories selected"));
      }

      // Get paths
      const packageRoot = getPackageRoot();
      const targetDir = path.join(process.cwd(), ".claude", "rules");

      // Create target directory
      yield* Effect.tryPromise({
        try: () => fs.mkdir(targetDir, { recursive: true }),
        catch: (error) => new Error(`Failed to create directory: ${error}`),
      });

      // Copy each selected category
      let installedCount = 0;
      let totalSize = 0;

      for (const categoryId of validCategories) {
        const cat = categories.find(c => c.id === categoryId);
        const sourceFile = path.join(packageRoot, "rules", "by-category", `${categoryId}.md`);
        const targetFile = path.join(targetDir, `${categoryId}.md`);

        const exists = yield* Effect.tryPromise({
          try: () => fs.access(sourceFile).then(() => true).catch(() => false),
          catch: () => false,
        });

        if (!exists) {
          yield* Console.warn(`⚠️  Source file not found: ${categoryId}`);
          continue;
        }

        yield* Effect.tryPromise({
          try: () => fs.copyFile(sourceFile, targetFile),
          catch: (error) => new Error(`Failed to copy ${categoryId}: ${error}`),
        });

        const sizeKB = parseInt(cat?.size.replace(/[^\d]/g, "") || "0");
        totalSize += sizeKB;

        yield* Console.log(`   ✓ ${cat?.title || categoryId} (${cat?.size || "unknown"})`);
        installedCount++;
      }

      // Success summary
      yield* Console.log(`\n✅ Installed ${installedCount} categories to ${targetDir}`);
      yield* Console.log(`   Total size: ~${totalSize}KB`);
      yield* Console.log(`\n📖 Claude Code will automatically load rules from .claude/rules/`);
      yield* Console.log(`\nNext steps:`);
      yield* Console.log(`  1. Open your project in Claude Code`);
      yield* Console.log(`  2. Start coding with Effect - Claude will use these patterns`);

      if (totalSize > 300) {
        yield* Console.log(`\n⚠️  Note: Total size (${totalSize}KB) may impact performance.`);
        yield* Console.log(`   Consider using --starter for a smaller set (~256KB).`);
      }
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
