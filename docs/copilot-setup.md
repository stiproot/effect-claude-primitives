# GitHub Copilot Setup Guide

This guide shows how to configure Effect patterns for GitHub Copilot.

GitHub Copilot does not consume Claude Code skills. The CLI installs skills for Claude
Code under `.claude/skills/`; for Copilot, build a single `.github/copilot-instructions.md`
from the pattern content in the skill `references/` directories.

## Quick Start

```bash
# Install package
npm install -D effect-claude-primitives

# Create directory
mkdir -p .github

# Build copilot-instructions.md from the skills you want
cat node_modules/effect-claude-primitives/skills/effect-getting-started/references/*.md \
    node_modules/effect-claude-primitives/skills/effect-core-concepts/references/*.md \
    node_modules/effect-claude-primitives/skills/effect-error-handling/references/*.md \
   > .github/copilot-instructions.md
```

## GitHub Copilot Configuration

GitHub Copilot reads instructions from `.github/copilot-instructions.md`.

### File Structure

```
my-project/
├── .github/
│   └── copilot-instructions.md  ← Copilot reads this
└── package.json
```

## Installation Options

Pick the skills relevant to your work and concatenate their `references/` content into
`.github/copilot-instructions.md`. Each skill covers one topic – see
[README.md](../README.md#available-skills) for the full list.

```bash
# A focused set
cat node_modules/effect-claude-primitives/skills/effect-error-handling/references/*.md \
    node_modules/effect-claude-primitives/skills/effect-concurrency/references/*.md \
   > .github/copilot-instructions.md

# Or everything (comprehensive but large)
cat node_modules/effect-claude-primitives/skills/*/references/*.md \
   > .github/copilot-instructions.md
```

Each rebuild replaces the previous `.github/copilot-instructions.md`.

## Verifying Installation

1. Check `.github/copilot-instructions.md` exists
2. Open a TypeScript file in VS Code
3. Start typing Effect code
4. Copilot suggestions should follow the patterns

Example - type `const effect = Effect.gen` and Copilot should suggest:
```typescript
const effect = Effect.gen(function* () {
  // Copilot will suggest Effect patterns here
})
```

## Customization

Edit `.github/copilot-instructions.md` to add project-specific instructions:

```markdown
# Effect Patterns

[Generated patterns...]

# Project-Specific Patterns

## Our Architecture

- Always use Effect.Service for services
- Layer composition in src/layers/index.ts
- Error types in src/errors.ts

## Testing

- Use TestContext for all tests
- Mock layers in tests/mocks/
```

## Tips

- **Start Small**: Begin with a few skills, add more as needed
- **Combine**: Add project-specific instructions to the generated file
- **Update Regularly**: Rebuild when you upgrade Effect or learn new patterns

## Troubleshooting

### Copilot not following patterns

1. Verify `.github/copilot-instructions.md` exists and has content
2. Reload VS Code window
3. Check Copilot is enabled and working
4. Try more specific code context (type hints, comments)

### File too large

If the combined file is too large:
- Include only the skills relevant to your current work
- Split into multiple projects if needed

## Next Steps

- Explore [available skills](../README.md#available-skills)
- See [customization guide](../README.md#customization)
