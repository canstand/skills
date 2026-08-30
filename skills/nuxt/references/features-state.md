---
name: state-management
description: SSR-safe shared state with useState, callOnce, state clearing, and Pinia
---

# State Management

`useState` is an SSR-friendly `ref` whose value is serialized across hydration and shared by a unique key.

```vue
<script setup lang="ts">
const count = useState('counter', () => 0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

Define typed reusable state in an auto-imported composable:

```ts
// app/composables/useUser.ts
export const useUser = () => useState<User | null>('user', () => null)
```

Never create a module-level `ref` for request state: it can leak values between SSR requests. `useState` values must be serializable; avoid functions, classes, symbols, and circular references.

## Async initialization and clearing

Use `callOnce` for initialization or store actions rather than using a side-effectful `useAsyncData` handler:

```vue
<script setup lang="ts">
const config = useState<SiteConfig | null>('site-config', () => null)
await callOnce(async () => {
  config.value = await $fetch('/api/config')
})
</script>
```

`clearNuxtState('key')` clears selected state; pass an array or no argument to clear multiple/all keys. With the forward compatibility defaults, `useState` can reset to its initializer when cleared; do not rely on cleared state being permanently `undefined`.

## Pinia

Nuxt is not tied to one state library. For complex stores, install the Pinia Nuxt module (`npx nuxt module add pinia`) and initialize server-sensitive actions with `callOnce`:

```ts
// app/stores/counter.ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
})
```

<!--
Source references:
- https://nuxt.com/docs/4.x/getting-started/state-management
- https://nuxt.com/docs/4.x/api/composables/use-state
- https://nuxt.com/docs/4.x/api/utils/call-once
- https://nuxt.com/docs/4.x/api/utils/clear-nuxt-state
-->
