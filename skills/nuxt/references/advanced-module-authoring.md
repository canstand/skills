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

## Templates and Vite/Nitro

Use `addTemplate`, `addTypeTemplate`, and `addServerTemplate` for generated virtual files. Declare `dependsOn` when a template depends on pages or other watched inputs, and import app templates through `#build`.

For Nitro plugins, explicitly import `definePlugin` from `nitro`; use `nitro/types` for type augmentation in the forward Nitro API. For Vite configuration, prefer `addVitePlugin` and `applyToEnvironment()` over deprecated client/server `extendViteConfig` options.

<!--
Source references:
- https://nuxt.com/docs/4.x/api/kit/modules
- https://nuxt.com/docs/4.x/api/kit/components
- https://nuxt.com/docs/4.x/api/kit/autoimports
- https://nuxt.com/docs/4.x/api/kit/plugins
- https://nuxt.com/docs/4.x/api/kit/templates
- https://nuxt.com/docs/4.x/api/kit/nitro
- https://nuxt.com/docs/4.x/api/kit/pages
- https://nuxt.com/docs/4.x/guide/modules/module-anatomy
- https://nuxt.com/docs/4.x/guide/modules/module-dependencies
-->
