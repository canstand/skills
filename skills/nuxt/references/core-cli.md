---
name: cli-commands
description: Nuxt CLI commands for development, building, prerendering, and project maintenance
---

# CLI Commands

Use the Nuxt CLI through a package script or `npx nuxt <command>`. The command reference is now maintained in the separate [`nuxt/cli`](https://github.com/nuxt/cli) repository; the Nuxt framework docs only point to it.

## Daily commands

```bash
# Start development (add -o/--open to open a browser)
npx nuxt dev

# Generate Nuxt types and aliases
npx nuxt prepare

# Check types
npx nuxt typecheck

# Build the production server
npx nuxt build

# Run a built app locally
NODE_ENV=production npx nuxt preview
```

`nuxt dev` supports `--port`, `--host`, `--open`, `--https`, and `--tunnel`. `PORT`/`HOST` (or their `NUXT_` equivalents) can provide development defaults.

## Static and environment-specific builds

```bash
# Prerender routes for static hosting
npx nuxt generate

# Equivalent build flag
npx nuxt build --prerender

# Select a named configuration environment
npx nuxt build --envName staging

# Select a Nitro deployment preset
npx nuxt build --preset node-server
```

`generate` produces static files and does not include a running server. Use `build` when server routes or hybrid rendering must remain available.

## Project utilities

```bash
npx nuxt module add @nuxt/ui
npx nuxt devtools enable
npx nuxt analyze
npx nuxt cleanup
npx nuxt info
npx nuxt upgrade
```

For a reproducible project, prefer package-manager scripts:

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "typecheck": "nuxt typecheck"
  }
}
```

## Module author commands

```bash
npx nuxt build-module
npx nuxt test
```

Check the installed CLI's `--help` output for command-specific options; avoid relying on undocumented flags in automation.

<!--
Source references:
- https://github.com/nuxt/cli
- https://nuxt.com/docs/api/commands
- https://nuxt.com/docs/getting-started/prerendering
- https://nuxt.com/docs/getting-started/deployment
-->
