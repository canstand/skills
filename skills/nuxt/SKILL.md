---
name: nuxt
description: Nuxt full-stack Vue framework with SSR, auto-imports, file-based routing, and Nitro server features. Use when working with Nuxt apps, server routes, data fetching, modules, islands, or hybrid rendering.
metadata:
  author: Anthony Fu, canstand
  version: "2026.9.25"
  source: Generated from https://github.com/nuxt/nuxt, customized in https://github.com/canstand/skills
---

Nuxt is a full-stack Vue framework for universal rendering, file-based routing, auto-imports, and server development. Nitro powers its server handlers, hybrid rendering, and deployment targets.

> The skill is based on Nuxt 5.x (`5.0.0-0`), generated at 2026-09-25.

> **Directory layout:** the default `srcDir` is `app/` — Vue app code (`app.vue`, `components/`, `composables/`, `pages/`, etc.) lives under `app/`, while `server/`, `shared/`, `public/`, `modules/`, `layers/` and `nuxt.config.ts` stay at the project root. The `~`/`@` aliases point at `app/`; use `~~`/`@@` for the root.

> **Nuxt 5 note:** Nuxt 5 makes many former experimental flags the default. The biggest shifts for agents: server code moves to **Nitro v3** (h3 v2, Web-standard `Request`/`Response`), server utilities import from **`nuxt/server`** and are no longer auto-imported by default, `$fetch`/`useFetch` are **typed from generated route types**, routing is **case-sensitive** and **typed** by default, and the bundler is **Vite 8 (Rolldown)**. Nuxt 5 requires Node `22.19`/`24.11`+. A Nitro v2 compatibility layer (`nitroLegacy`) keeps older server code building during migration. See individual references for details.

## Core

| Topic | Description | Reference |
|-------|-------------|-----------|
| Directory Structure | `app/`, root server code, `shared/`, aliases, and scanning rules | [core-directory-structure](references/core-directory-structure.md) |
| Configuration | `nuxt.config.ts`, runtime/app config, environments, Nuxt 5 defaults, jiti removal, and experimental flags | [core-config](references/core-config.md) |
| CLI Commands | Project commands, builds, prerendering, and the CLI source of truth | [core-cli](references/core-cli.md) |
| Routing | File-based routes, case-sensitive + typed routes, navigation, middleware, validation, and layouts | [core-routing](references/core-routing.md) |
| Data Fetching | `useFetch`, `useAsyncData`, `$fetch`, typed routes, caching, and abortable handlers | [core-data-fetching](references/core-data-fetching.md) |
| Modules | Using Nuxt modules and the Nuxt Kit module model | [core-modules](references/core-modules.md) |
| Deployment | Node, static, serverless, and edge deployment with Nitro | [core-deployment](references/core-deployment.md) |

## Features

| Topic | Description | Reference |
|-------|-------------|-----------|
| Composables Auto-imports | Vue/Nuxt APIs, project composables, server utilities, and `shared/` | [features-composables](references/features-composables.md) |
| Components Auto-imports | Naming, lazy loading, hydration, custom directories, and islands | [features-components-autoimport](references/features-components-autoimport.md) |
| Built-in Components | Navigation, layouts, client-only rendering, islands, and accessibility | [features-components](references/features-components.md) |
| State Management | SSR-safe `useState`, `callOnce`, clearing state, and Pinia | [features-state](references/features-state.md) |
| Server Routes | Nitro handlers, `nuxt/server` imports, Nitro v3 (h3 v2), sessions, middleware, and storage | [features-server](references/features-server.md) |
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
| Migration | Nuxt 5 defaults, Nitro 3, Vite, and runtime loading changes | [advanced-migration](references/advanced-migration.md) |
| Layers | Extending applications with reusable layers and priority rules | [advanced-layers](references/advanced-layers.md) |
| Lifecycle Hooks | Build-time, app-runtime, and Nitro hooks | [advanced-hooks](references/advanced-hooks.md) |
| Module Authoring | Nuxt Kit modules, dependencies, runtime assets, and templates | [advanced-module-authoring](references/advanced-module-authoring.md) |
