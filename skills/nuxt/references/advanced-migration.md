---
name: migration
description: Nuxt forward-compatibility and Nuxt 5/Nitro 3 migration points for apps and modules
---

# Migration and Compatibility

The current Nuxt upgrade documentation describes Nuxt 5 as in development. Treat `future.compatibilityVersion: 5` as an opt-in compatibility mode and review the upgrade guide before enabling it; do not assume all Nuxt 5 changes are stable.

```ts
export default defineNuxtConfig({
  future: { compatibilityVersion: 5 },
})
```

Notable defaults in this mode include the Vite Environment API, typed pages, case-sensitive routes, normalized page names, comment placeholders for client-only components, reset-to-default state clearing, non-async `callHook`, and removal of `compilerOptions.baseUrl` from generated configs.

## Runtime-loaded config and modules

Nuxt 5 no longer bundles `jiti`. With the required Node 22.19+ runtime, Node loads `nuxt.config.ts`, layer configs, and local module files natively. Add explicit extensions to relative imports and use erasable TypeScript syntax. Published modules/layers should ship compiled JavaScript; install `jiti` only when a project still needs transform-based loading (a `nuxt.schema` file always needs it).

```ts
// nuxt.config.ts or a local module
import { createResolver } from '@nuxt/kit'
import { defineNuxtModule } from '@nuxt/kit'

const resolver = createResolver(import.meta.url)
// Use resolver.resolve('./runtime/plugin.ts'), not an extensionless path.
```

Remote layers also no longer pull in `giget` by default. Prefer pinning a git layer as a package-manager dependency, or install `giget` explicitly when using a remote `extends` URL.

## Nitro 3 server API changes

The forward migration replaces `nitropack` imports with `nitro`, and server utilities previously imported from `h3` with `nitro/h3`:

```diff
- import { defineEventHandler, getQuery } from 'h3'
+ import { defineEventHandler, getQuery } from 'nitro/h3'
```

Use `definePlugin` from `nitro` for explicit Nitro plugins. Server event access moves toward Web APIs (`event.req.method`, `event.req.headers`, `event.url.pathname`, `event.res.headers`). `useRuntimeConfig()` no longer accepts an event argument. Nitro route-rule redirects use `status`, not `statusCode`.

For errors in the Nitro 3 API, use the current `HTTPError`/`status`/`statusText` form where explicit h3 v2 APIs are required. Nuxt app errors created with `createError` are distinct; use the documented predicates rather than relying on `instanceof HTTPError`.

## Other upgrade checks

- Migrate `extendViteConfig` and old client/server-specific Vite hooks to Vite plugins and `applyToEnvironment()`.
- Install `@vitejs/plugin-vue-jsx` explicitly when the app contains JSX/TSX.
- Remove deprecated `experimental.externalVue` and `parseErrorData` settings where applicable.
- Use `import.meta.server`/`import.meta.client` instead of TypeScript `process.*` flags.

<!--
Source references:
- https://nuxt.com/docs/4.x/getting-started/upgrade
- https://nuxt.com/docs/4.x/guide/going-further/features#compatibilityversion
- https://nuxt.com/docs/4.x/guide/going-further/experimental-features
- https://nitro.build/blog/v3-beta
- https://nitro.build/docs/migration
-->
