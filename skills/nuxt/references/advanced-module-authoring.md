---
name: module-authoring
description: Authoring type-safe Nuxt modules with Nuxt Kit, runtime assets, dependencies, hooks, and templates
---

# Module Authoring

Use `@nuxt/kit` and object-syntax `defineNuxtModule` for local or publishable modules. Keep module setup focused on registration/configuration; defer slow work to hooks.

## Typed module definition

```ts
// src/module.ts
import { defineNuxtModule } from '@nuxt/kit'

interface ModuleOptions {
  enabled?: boolean
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>().with({
  meta: {
    name: 'my-module',
    configKey: 'myModule',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: { enabled: true, prefix: 'My' },
  setup(options) {
    if (!options.enabled) return
  },
})
```

`.with()` gives setup the correctly narrowed type after defaults are merged. Include `meta.version` when using `onInstall`/`onUpgrade` lifecycle callbacks.

## Register runtime assets

Resolve module-local files from `import.meta.url` and use Kit helpers:

```ts
import {
  addComponent, addComponentsDir, addImports, addPlugin,
  addServerHandler, createResolver, defineNuxtModule,
} from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'my-module' },
  setup() {
    const { resolve } = createResolver(import.meta.url)
    addComponent({ name: 'MyButton', filePath: resolve('./runtime/MyButton.vue') })
    addComponentsDir({ path: resolve('./runtime/components'), prefix: 'My' })
    addImports({ name: 'useMyFeature', from: resolve('./runtime/useMyFeature') })
    addPlugin({ src: resolve('./runtime/plugin'), mode: 'client' })
    addServerHandler({ route: '/api/_my-module/status', handler: resolve('./runtime/status') })
  },
})
```

Prefix exposed components, composables, and server routes to prevent collisions. Published module runtime files cannot rely on project auto-imports; import from `#imports` or use explicit imports.

## Dependencies and hooks

Declare module dependencies with `moduleDependencies`, including `version`, `defaults`, `overrides`, and `optional`. It replaces the deprecated `installModule` pattern and ensures dependency setup order.

```ts
export default defineNuxtModule({
  meta: { name: 'my-module' },
  moduleDependencies: {
    '@nuxtjs/tailwindcss': {
      version: '>=6',
      defaults: { exposeConfig: true },
      optional: false,
    },
  },
  hooks: {
    'pages:extend'(pages) { /* modify pages in place */ },
  },
})
```

Use `addRouteMiddleware`, `extendPages`, and `extendRouteRules` for route integration. Use `addServerScanDir`/`addServerImportsDir` for module server assets and imports.

## Nuxt 5 / Nitro v3 for module authors

- **Portable server code:** import from `nuxt/server` (ships in Nuxt 4.6+) so one file runs under `nitropack` v2, Nitro v3, and other builders with no h3/Nitro peer dependency. Leave `nuxt/server` external when bundling.
- **Type augmentation moved** from `nitropack/types` to `nitro/types`. Route rule types are declared on `h3/rules` (`RouteRuleConfig` for config, `RouteRules` for runtime), not `NitroRouteConfig`/`NitroRouteRules`:

  ```ts
  declare module 'h3/rules' {
    interface RouteRuleConfig { myModule?: { enabled: boolean } }
    interface RouteRules { myModule?: { enabled: boolean } }
  }
  ```

- **Compatibility layer:** a module whose server files still import `h3`/`nitropack`/`#internal/nitro`/`#imports` keeps running via an automatic Nitro v2 compatibility layer (`NUXT_B9003` warning names it). To support Nuxt <4.6 and Nitro v3 at once, register both handler files:

  ```ts
  addServerHandler({
    route: '/api/my-module/status',
    handler: {
      nuxt: resolve('./runtime/server/status'),          // nuxt/server only
      nitro2: resolve('./runtime/server/status.legacy'), // h3 / nitropack
    },
  })
  ```

- Declare all real dependencies in `package.json` — Nitro v3 no longer hoists `nitropack` v2's own deps into the server bundle.

## Templates and Vite/Nitro

Use `addTemplate`, `addTypeTemplate`, and `addServerTemplate` for generated virtual files. Declare `dependsOn` when a template depends on pages or other watched inputs, and import app templates through `#build`.

For Nitro plugins, explicitly import `definePlugin` from `nitro`; use `nitro/types` for type augmentation in the Nitro v3 API. For Vite configuration, prefer `addVitePlugin` and `applyToEnvironment()` over deprecated client/server `extendViteConfig` options.

<!--
Source references:
- https://nuxt.com/docs/api/kit/modules
- https://nuxt.com/docs/api/kit/components
- https://nuxt.com/docs/api/kit/autoimports
- https://nuxt.com/docs/api/kit/plugins
- https://nuxt.com/docs/api/kit/templates
- https://nuxt.com/docs/api/kit/nitro
- https://nuxt.com/docs/api/kit/pages
- https://nuxt.com/docs/guide/modules/module-anatomy
- https://nuxt.com/docs/guide/modules/module-dependencies
- https://nuxt.com/docs/guide/modules/server-compatibility
-->
