---
name: migration
description: Nuxt forward-compatibility and Nuxt 5/Nitro 3 migration points for apps and modules
---

# Migration and Compatibility

Nuxt 5 is the current major. On Nuxt 4 projects, `future.compatibilityVersion: 5` opts into the Nuxt 5 defaults:

```ts
export default defineNuxtConfig({
  future: { compatibilityVersion: 5 },
})
```

Notable defaults include case-sensitive and typed routes, normalized page names, serializable page meta extraction, payload extraction, reset-to-default state clearing, no Nitro server auto-imports, non-async `callHook`, comment placeholders for client-only components, and removal of `compilerOptions.baseUrl` from generated configs.

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

## Nuxt 5 server imports

Nitro helpers (`defineEventHandler`, `getQuery`, `createError`, sessions, ...) are **no longer auto-imported** by default. Import them from the runtime-agnostic **`nuxt/server`** surface; export your own helpers from `server/utils/` as before. Re-enable Nitro auto-imports with `experimental.nitroAutoImports: true`.

```diff
- import { defineEventHandler, getQuery } from 'h3'
+ import { defineEventHandler, getQuery } from 'nuxt/server'
```

Inside server code, import shared Nuxt composables from `#imports/server` (not `#imports`). Helpers outside the `nuxt/server` surface (e.g. `readMultipartFormData`, `lazyEventHandler`, `useStorage`, `defineCachedHandler`) still come from `nitro/h3`, `nitro/storage`, `nitro/cache`, etc.

## Nitro 3 API changes

The migration replaces `nitropack` imports with `nitro` and h3 v1 utilities with `nitro/h3` (or `nuxt/server` for the portable surface). Use `definePlugin` from `nitro` for explicit Nitro plugins. Server event access uses Web APIs (`event.req.method`, `event.req.headers`, `event.url.pathname`, `event.res.headers`). `useRuntimeConfig()` no longer accepts an event argument. Nitro route-rule redirects use `status`, not `statusCode`.

For errors in the Nitro 3 API, use the current `HTTPError`/`status`/`statusText` form where explicit h3 v2 APIs are required. Nuxt app errors created with `createError` are distinct; narrow with `HTTPError.isError(error)` or `isNuxtError(error)`, not `instanceof HTTPError`.

## Other upgrade checks

- `callHook` may return `void` (not always a Promise) in Nuxt 5 — always `await` it instead of chaining `.then()`/`.catch()`. Restore the always-Promise behavior with `experimental.asyncCallHook: true`.
- Type augmentation moved from `nitropack/types` to `nitro/types`; route-rule types live on `h3/rules` (`RouteRuleConfig`/`RouteRules`).
- Module server files that still import `h3`/`nitropack`/`#internal/nitro`/`#imports` run through an automatic Nitro v2 compatibility layer (`nitroLegacy`). Declare real dependencies in `package.json` — Nitro v3 no longer hoists `nitropack` v2's deps into the server bundle.
- Migrate `extendViteConfig` and old client/server-specific Vite hooks to Vite plugins and `applyToEnvironment()`.
- Install `@vitejs/plugin-vue-jsx` explicitly when the app contains JSX/TSX.
- Remove deprecated `experimental.externalVue` and `parseErrorData` settings where applicable.
- Use `import.meta.server`/`import.meta.client` instead of TypeScript `process.*` flags.

<!--
Source references:
- https://nuxt.com/docs/getting-started/upgrade
- https://nuxt.com/docs/guide/going-further/experimental-features
- https://nuxt.com/docs/guide/going-further/server-imports
- https://nitro.build/blog/v3-beta
- https://nitro.build/docs/migration
-->
