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

Experimental options can change or disappear. Current high-value options include `payloadExtraction`, `sharedPrerenderData`, `ssrStreaming`, `typedPages`, `inlineRouteRules`, `lazyHydration`, and component islands. `componentIslands` defaults to automatic detection; use an object when enabling selective client hydration or remote islands.

`future.compatibilityVersion: 5` is a forward-compatibility switch, not a generic feature toggle. It opts into documented Nuxt 5 defaults such as the Vite Environment API, typed pages, normalized page names, comment placeholders for client-only components, and non-async `callHook` behavior. Review the migration reference before enabling it.

<!--
Source references:
- https://nuxt.com/docs/4.x/getting-started/configuration
- https://nuxt.com/docs/4.x/directory-structure/nuxt-config
- https://nuxt.com/docs/4.x/guide/going-further/runtime-config
- https://nuxt.com/docs/4.x/guide/going-further/experimental-features
- https://nuxt.com/docs/4.x/guide/going-further/features
-->
