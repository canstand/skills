---
name: nuxt
description: Nuxt full-stack Vue framework with SSR, auto-imports, file-based routing, and Nitro server features. Use when working with Nuxt apps, server routes, data fetching, modules, islands, or hybrid rendering.
metadata:
  author: Anthony Fu
  version: "2026.8.30"
  source: Generated from https://github.com/nuxt/nuxt, scripts located at https://github.com/antfu/skills
---

Nuxt is a full-stack Vue framework for universal rendering, file-based routing, auto-imports, and server development. Nitro powers its server handlers, hybrid rendering, and deployment targets.

> The skill is based on the Nuxt documentation at source revision `fb02c57eb22da80201ab6857b0de7009aa517b98`, generated at 2026-08-30. The source docs use 4.x URLs while documenting current behavior and the forward migration path to Nuxt 5/Nitro 3; do not infer a stable major version from a URL.

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Directory Structure | `app/`, root server code, `shared/`, aliases, and scanning rules | [core-directory-structure](references/core-directory-structure.md) |
| Configuration | `nuxt.config.ts`, runtime/app config, environments, and experimental flags | [core-config](references/core-config.md) |
| CLI Commands | Project commands, builds, prerendering, and the CLI source of truth | [core-cli](references/core-cli.md) |
| Routing | File-based routes, navigation, middleware, validation, and layouts | [core-routing](references/core-routing.md) |
| Data Fetching | `useFetch`, `useAsyncData`, `$fetch`, caching, and abortable handlers | [core-data-fetching](references/core-data-fetching.md) |
| Modules | Using Nuxt modules and the Nuxt Kit module model | [core-modules](references/core-modules.md) |
| Deployment | Node, static, serverless, and edge deployment with Nitro | [core-deployment](references/core-deployment.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Composables Auto-imports | Vue/Nuxt APIs, project composables, server utilities, and `shared/` | [features-composables](references/features-composables.md) |
| Components Auto-imports | Naming, lazy loading, hydration, custom directories, and islands | [features-components-autoimport](references/features-components-autoimport.md) |
| Built-in Components | Navigation, layouts, client-only rendering, islands, and accessibility | [features-components](references/features-components.md) |
| State Management | SSR-safe `useState`, `callOnce`, clearing state, and Pinia | [features-state](references/features-state.md) |
| Server Routes | Nitro handlers, middleware, plugins, storage, and request APIs | [features-server](references/features-server.md) |
| Server Components | Islands, isolated context, selective hydration, and caching | [server-components](references/server-components.md) |

## Rendering

| Topic | Description | Reference |
|-------|-------------|-----------|
| Rendering Modes | Universal, client-only, hybrid route rules, prerendering, and edge rendering | [rendering-modes](references/rendering-modes.md) |

## Best Practices

| Topic | Description | Reference |
|-------|-------------|-----------|
| Data Fetching Patterns | Navigation behavior, stable keys, payload size, concurrency, and side effects | [best-practices-data-fetching](references/best-practices-data-fetching.md) |
| SSR & Hydration | Avoiding context leaks, hydration mismatches, and browser-only code | [best-practices-ssr](references/best-practices-ssr.md) |

## Advanced

| Topic | Description | Reference |
|-------|-------------|-----------|
| Migration | Compatibility-version changes, Nitro 3, Vite, and runtime loading changes | [advanced-migration](references/advanced-migration.md) |
| Layers | Extending applications with reusable layers and priority rules | [advanced-layers](references/advanced-layers.md) |
| Lifecycle Hooks | Build-time, app-runtime, and Nitro hooks | [advanced-hooks](references/advanced-hooks.md) |
| Module Authoring | Nuxt Kit modules, dependencies, runtime assets, and templates | [advanced-module-authoring](references/advanced-module-authoring.md) |
