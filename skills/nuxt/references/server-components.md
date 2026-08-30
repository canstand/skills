---
name: server-components
description: Nuxt server components and islands, including isolation, selective hydration, caching, and safe props
---

# Server Components and Islands

A `.server.vue` component renders on the server and does not ship its component JavaScript or heavy dependencies to the browser. This is useful for markdown, syntax highlighting, CMS output, and other content that does not need client interactivity.

```vue
<!-- app/components/HighlightedMarkdown.server.vue -->
<script setup lang="ts">
const props = defineProps<{ markdown: string }>()
const html = renderMarkdown(props.markdown) // server-only dependency
</script>

<template><article v-html="html" /></template>
```

```vue
<!-- app/pages/article.vue -->
<template><HighlightedMarkdown markdown="# Server rendered" /></template>
```

Server components are experimental. `experimental.componentIslands` defaults to automatic detection; configure it explicitly for selective client hydration or remote islands:

```ts
export default defineNuxtConfig({
  experimental: {
    componentIslands: { selectiveClient: true },
  },
})
```

## Isolation and props

Nuxt implements server components with `<NuxtIsland>`. Each island gets a new Vue app and an isolated context. It cannot share `provide`/`inject`, Pinia, or `useState` with the page; route middleware does not run there, and `useRoute()` reflects the island request rather than the containing page. Pass required route data explicitly.

Island props/context are serialized into GET query parameters to make responses cacheable. Pass only JSON-serializable, non-sensitive, reasonably small data, and treat it as untrusted input. Do not feed arbitrary prop strings into `<component :is>`; map discriminators through an allowlist:

```vue
<script setup lang="ts">
import type { Component } from 'vue'
import CardA from './CardA.vue'
import CardB from './CardB.vue'

const { variant } = defineProps<{ variant: string }>()
const components: Record<string, Component> = { a: CardA, b: CardB }
const selected = components[variant] ?? CardA
</script>

<template><component :is="selected" /></template>
```

An island must have one root element. Props changing causes a server request and in-place HTML update. Matching `.server.vue` and `.client.vue` files are paired implementations rather than standalone islands; the client half hydrates normally.

## Selective hydration and navigation

With `selectiveClient: true`, add `nuxt-client` to a local SFC inside an island. Only that component's chunk is sent and hydrated. `'deep'` also allows slots, but slot content rendered on the server is not interactive. Built-ins such as `<NuxtLink>` do not pass through this transform; wrap them in a local SFC.

On the initial SSR request, islands render inline. During client-side navigation, each destination island is fetched separately, so use `lazy` and `#fallback` for non-blocking islands and avoid many islands on one page.

## Caching and limitations

Prerendering and cached rendering reuse identical islands by name, props, and context. Islands work well with `prerender` and `noScripts` for mostly-static sites. Interactive slots and `nuxt-client` require an inline relocation script and therefore do not hydrate on `noScripts` routes.

Server components remain experimental. Expect limitations around SFC-only features, nested-island overhead, template refs, `useId`, and some webpack/Rspack scoped-slot styles. Use `<NuxtIsland>` directly when you need its `error` event or `refresh()` method.

<!--
Source references:
- https://nuxt.com/docs/4.x/guide/concepts/server-components
- https://nuxt.com/docs/4.x/directory-structure/app/components#server-components
- https://nuxt.com/docs/4.x/api/components/nuxt-island
- https://nuxt.com/docs/4.x/guide/going-further/experimental-features#componentislands
-->
