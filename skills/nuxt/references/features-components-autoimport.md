---
name: components-auto-imports
description: Nuxt component scanning, naming, lazy loading, hydration strategies, and registration
---

# Component Auto-imports

Nuxt scans `app/components/` and registers components only when used. Component names include path segments, except parenthesized grouping directories.

```text
app/components/
├── Button.vue                  # <Button>
├── base/Button.vue             # <BaseButton>
├── base/(legacy)/Button.vue    # <BaseButton>
└── form/Input.vue              # <FormInput>
```

Use `pathPrefix: false` when component names should come only from filenames:

```ts
export default defineNuxtConfig({
  components: [{ path: '~/components', pathPrefix: false }],
})
```

## Lazy loading and hydration

Prefix a component with `Lazy` to split its code and load it on demand. Lazy components also support one hydration strategy: `hydrate-on-visible`, `hydrate-on-idle`, `hydrate-on-interaction`, `hydrate-on-media-query`, `hydrate-after`, `hydrate-when`, or `hydrate-never`.

```vue
<script setup lang="ts">
const show = ref(false)
</script>

<template>
  <LazyChart v-if="show" hydrate-on-visible @hydrated="onReady" />
  <button @click="show = true">Show chart</button>
</template>
```

Delayed hydration is for non-critical interactivity, not content that must work immediately. Built-in strategies currently apply to SFC usage: explicitly declared template props are required, and direct `#components` imports bypass the transform. A prop change can trigger hydration immediately.

## Custom and global directories

Register nested or domain-oriented directories explicitly. Scan order matters: put specific directories before a broad catch-all.

```ts
export default defineNuxtConfig({
  components: [
    { path: '~/domains', pattern: '*/components/**', pathPrefix: false },
    { path: '~/components/ui', prefix: 'Ui' },
    '~/components',
  ],
})
```

Each entry accepts `pattern` and `ignore`; when `pattern` is set, ensure it matches the desired extensions. Use `global: true` or a `global/` directory/`.global.vue` suffix sparingly because global components create separate async chunks.

Parenthesized directory names group files without affecting the component name: `components/base/(foo)/Button.vue` → `<BaseButton />`.

## Direct and dynamic imports

Use `#components` for an explicit import. `resolveComponent` requires a literal component name so the compiler can analyze it:

```vue
<script setup lang="ts">
import { SomeComponent } from '#components'
const button = resolveComponent('MyButton')
</script>

<template>
  <component :is="button" />
  <component :is="SomeComponent" />
</template>
```

## Client and server components

`.client.vue` components render only after mounting. `.server.vue` components are server islands and keep their dependencies out of the client bundle; pair matching `.server.vue` and `.client.vue` files when separate implementations should hydrate normally. See [server components](server-components.md) for isolation, props, selective hydration, and caching.

Modules can register package components with `addComponent` or `addComponentsDir`; prefix package exports to avoid collisions.

<!--
Source references:
- https://nuxt.com/docs/4.x/directory-structure/app/components
- https://nuxt.com/docs/4.x/guide/concepts/auto-imports#auto-imported-components
- https://nuxt.com/docs/4.x/api/kit/components
-->
