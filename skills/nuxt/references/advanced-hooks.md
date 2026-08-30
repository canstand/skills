---
name: lifecycle-hooks
description: Nuxt build hooks, app runtime hooks, and Nitro server hooks
---

# Lifecycle Hooks

Use Nuxt hooks for build/configuration work, app hooks for browser/runtime behavior, and Nitro hooks for server requests. Prefer documented hook names and keep hook callbacks small.

## Build-time Nuxt hooks

Configure hooks in `nuxt.config.ts` or register them from a module:

```ts
// modules/routes.ts
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  hooks: {
    'pages:extend'(pages) {
      pages.push({
        name: 'health',
        path: '/health',
        file: './runtime/pages/health.vue',
      })
    },
    'imports:extend'(imports) {
      imports.push({ name: 'useFeature', from: '#my-module' })
    },
  },
})
```

Useful hooks include `ready`, `close`, `modules:before`, `modules:done`, `module:before`, `module:done`, `app:resolve`, `app:templates`, `build:before`, `build:done`, `pages:extend`, `pages:resolved`, `components:dirs`, `components:extend`, `imports:extend`, `nitro:config`, `nitro:init`, `prerender:routes`, `prepare:types`, and `builder:watch`.

`vite:extendConfig` and `vite:configResolved` are deprecated for the forward Nuxt 5/Vite Environment API model and should not be the basis of new integrations; use a Vite plugin with `applyToEnvironment()` instead.

## Runtime app hooks

Register hooks in a plugin or composable:

```ts
// app/plugins/analytics.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:finish', () => {
    analytics.track('pageview', { path: useRoute().path })
  })
})
```

Common hooks: `app:created`, `app:error`, `app:mounted`, `app:data:refresh`, `link:prefetch`, `page:start`, `page:finish`, `page:loading:start`, and `page:loading:end`. `useRuntimeHook` is useful when a component needs to register a runtime hook directly.

## Nitro hooks

Use a Nitro plugin with the current explicit import:

```ts
// server/plugins/hooks.ts
import { definePlugin } from 'nitro'

export default definePlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    console.log(event.req.method, event.req.url)
  })
  nitro.hooks.hook('render:html', (html) => {
    html.head.push('<meta name="x-app" content="nuxt">')
  })
})
```

Important hooks include `request`, `response`, `render:html`, `render:response`, `render:island`, `error`, and `close`. Check the Nitro version's hook types when writing server integrations because request/response arguments follow its Web API model.

## Custom hook types

Augment `@nuxt/schema` for build hooks and `#app` for runtime hooks. Use `nitro/types` for Nitro type augmentation.

<!--
Source references:
- https://nuxt.com/docs/4.x/guide/going-further/hooks
- https://nuxt.com/docs/4.x/api/advanced/hooks
- https://nuxt.com/docs/4.x/api/kit/modules
- https://nuxt.com/docs/4.x/api/kit/nitro
- https://vite.dev/guide/api-environment
-->
