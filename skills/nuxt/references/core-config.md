---
name: configuration
description: Nuxt configuration, runtime config, app config, environments, and experimental features
---

# Nuxt Configuration

Keep the main configuration in root-level `nuxt.config.ts`. `defineNuxtConfig` is globally available, or can be imported from `nuxt/config`.

```ts
// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
})
```

## Source directory and aliases

The default Vue source directory is `app/`; server, shared, public, modules, layers, and the config remain at the project root. Change it with `srcDir` when needed:

```ts
export default defineNuxtConfig({
  srcDir: 'src/',
  alias: {
    '#shared': './shared',
  },
})
```

Nuxt aliases are context-aware: `~`/`@` target the source directory, `~~`/`@@` target the project root, `#shared` targets `shared/`, and `#server` targets `server/` (the latter only from server code).

## `nuxt.config` loading (Nuxt 5: no more `jiti`)

Nuxt 5 no longer bundles `jiti`. `nuxt.config.ts`, files in `modules/`, and layer configs are loaded by the Node runtime directly (requires Node `22.19`/`24.11`+, which strip types natively). Two consequences:

- **Relative imports in these files need an explicit extension** — write `./build/plugin.ts`, not `./build/plugin` (TS reports `TS2835`). Bare package imports are unaffected.
- **Use erasable TypeScript only** in config/module files — no `enum`, `namespace`, constructor parameter properties, or decorators (TS reports `TS1294`).

App and `shared/` code go through Vite and are unaffected. Published layers/modules must ship compiled JS (a shipped config as `nuxt.config.mjs`). Install `jiti` (`-D`) to restore the old fallback behavior; a `nuxt.schema` file always needs it.

## Environment overrides

Use `$production`, `$development`, and named `$env` blocks. Select one with `--envName`:

```ts
export default defineNuxtConfig({
  $production: {
    routeRules: { '/**': { isr: true } },
  },
  $env: {
    staging: {
      runtimeConfig: { public: { apiBase: 'https://staging.example.test' } },
    },
  },
})
```

## Runtime config and app config

Use `runtimeConfig` for values supplied after build, especially secrets. Only `public` and internal `app` keys reach the client, and environment variables must follow the `NUXT_` naming structure.

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    apiSecret: '',
    public: { apiBase: '/api' },
  },
})
```

```vue
<script setup lang="ts">
const config = useRuntimeConfig()
if (import.meta.server) console.log(config.apiSecret)
console.log(config.public.apiBase)
</script>
```

Use `app/app.config.ts` for public values known at build time, such as theme settings. Unlike runtime config, it can contain non-primitive values and supports HMR.

```ts
// app/app.config.ts
export default defineAppConfig({
  title: 'My app',
  theme: { dark: true },
})
```

Do not put functions, secrets, or other non-serializable values in runtime config. The built server does not read `.env`; provide runtime variables through the deployment environment.

## External tools and experimental flags

Configure Nitro, Vite, PostCSS, and webpack under their keys in `nuxt.config.ts`; do not add parallel config files unless a tool specifically requires one.

```ts
export default defineNuxtConfig({
  nitro: { preset: 'node-server' },
  vite: { vue: { customElement: true } },
  experimental: {
    payloadExtraction: 'client',
    ssrStreaming: true,
    componentIslands: { selectiveClient: true },
  },
})
```

Experimental options can change or disappear. Notable opt-ins include `ssrStreaming`, `strictRouteTypes` (`true` or `'isomorphic'`), `early404`, `prerenderErrorPages`, `sharedPrerenderData`, `inlineRouteRules`, `lazyHydration`, and component islands. `componentIslands` defaults to automatic detection; use an object when enabling selective client hydration or remote islands.

## Nuxt 5 defaults

Many former experimental flags are now on by default. Each can be reverted via the named option:

| Behavior | Now default | Restore Nuxt 4 with |
|----------|-------------|---------------------|
| Case-sensitive page routing | `router.options.sensitive: true` | `router.options.sensitive: false` |
| Typed pages (`useRoute`/`navigateTo`/`<NuxtLink>` type-checked) | on | `experimental.typedPages: false` |
| Page component name = route name | on | `experimental.normalizePageNames: false` |
| All serializable `definePageMeta` written to route record | on | `experimental.extractSerializablePageMeta: false` |
| Payload inlined in HTML, `_payload.json` only for SPA nav | `experimental.payloadExtraction: 'client'` | `payloadExtraction: true` |
| `clearNuxtState` resets to `useState` init value | on | `experimental.defaults.useState.resetOnClear: false` |
| `await navigateTo()` early-returns from `setup()` | on | `experimental.navigateToEarlyReturn: false` |
| `callHook` may return `void` (not always a Promise) | on | `experimental.asyncCallHook: true` |
| Client-only SSR placeholder is a comment node, not `<div>` | on | `experimental.clientNodePlaceholder: false` |
| Reuse builder's file watcher | `experimental.watcher: 'builder'` | `watcher: 'chokidar'` |
| Server auto-imports (Nitro helpers) | off | `experimental.nitroAutoImports: true` |
| `error.data` parsed (never stringified) | forced on | — (`parseErrorData` no longer configurable) |
| Vue Options API compiled out of client bundle | on | `vue: { optionsApi: true }` |
| `noUncheckedSideEffectImports` in generated tsconfig | on | `typescript.tsConfig.compilerOptions.noUncheckedSideEffectImports: false` |

**Removed options** (behavior now unconditional): `experimental.viteEnvironmentApi`, `experimental.routeTypedFetch`, `experimental.renderJsonPayloads`, `experimental.externalVue`. Delete them from config.

`future.compatibilityVersion` is mostly historical — Nuxt 4 code paths that were opt-in are now unconditional; restore individual behaviors via the options above. `unhead.legacy` is ignored (setting it warns); Capo title sorting is always on.

<!--
Source references:
- https://nuxt.com/docs/getting-started/configuration
- https://nuxt.com/docs/directory-structure/nuxt-config
- https://nuxt.com/docs/guide/going-further/runtime-config
- https://nuxt.com/docs/guide/going-further/experimental-features
- https://nuxt.com/docs/getting-started/upgrade
-->
