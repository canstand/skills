---
name: data-fetching
description: SSR-safe useFetch, useAsyncData, $fetch, caching, and abortable data handlers
---

# Data Fetching

Use `useFetch` for an API URL, `useAsyncData` for arbitrary async work, and `$fetch` for event-driven requests. The first two forward server results through the Nuxt payload so hydration does not repeat the request.

## Choosing the API

```vue
<script setup lang="ts">
// Initial page data: SSR-safe and typed from server routes
const { data: posts, status, error } = await useFetch('/api/posts')

async function submit() {
  // Browser event: do not put this in setup for initial data
  await $fetch('/api/posts', { method: 'POST', body: { title: 'New post' } })
}
</script>
```

`useFetch` and `useAsyncData` can be called without `await`. SSR still waits for the result, but `await` pauses the rest of setup and blocks client navigation. Without it, render loading/error states yourself. `lazy: true` or `useLazyFetch` explicitly makes navigation non-blocking; awaiting a lazy call does not make client navigation wait.

## `useFetch`

```vue
<script setup lang="ts">
const page = ref(1)
const { data, refresh } = await useFetch('/api/posts', {
  query: { page }, // reactive options trigger refetches
  pick: ['id', 'title'],
  default: () => [],
  key: 'posts',
})

const id = ref('1')
const { data: post } = await useFetch(() => `/api/posts/${id.value}`)
</script>
```

The URL may be a string, `Request`, ref, or getter. Reactive URL/options refetch automatically unless `watch: false`. `server: false` defers the first request until hydration completes. `immediate: false` requires `execute()`/`refresh()`.

Important options include `server`, `lazy`, `immediate`, `enabled`, `dedupe: 'cancel' | 'defer'`, `timeout`, `cache`, `pick`, `transform`, `serialize`, and `getCachedData`. `data`, `error`, and `status` are refs; status is `idle | pending | success | error`.

## `useAsyncData`

Use a stable key and accept the abort signal in handlers:

```vue
<script setup lang="ts">
const { data } = await useAsyncData(
  'dashboard',
  (_nuxtApp, { signal }) => Promise.all([
    $fetch('/api/user', { signal }),
    $fetch('/api/stats', { signal }),
  ]).then(([user, stats]) => ({ user, stats })),
)
</script>
```

Handlers must be side-effect free and should return a truthy value. Use `callOnce` for side effects such as Pinia actions. The same key shares `data`, `error`, and `status`; keep handler, `deep`, `transform`, `pick`, `getCachedData`, and `default` consistent across calls. Use a different key for independent data.

## Typed routes (Nuxt 5)

`$fetch` and `useFetch` are typed from the routes the server builder reports. The response type comes from the matching handler's return type, keyed by HTTP method:

```ts
// server/api/todos.get.ts
export default defineEventHandler(() => [{ id: '1', title: 'Buy milk' }])

// app code
const todos = await $fetch('/api/todos')
//    ^? { id: string, title: string }[]
```

- Validated input (`readValidatedBody` / `getValidatedQuery`) also types `body`/`query`, and a method the route doesn't handle is rejected.
- The **`params` option was removed** from `$fetch`/`useFetch` (it was an alias for `query`) — use `query`.
- A `baseURL` is resolved into the path before matching, so don't pass an already-prefixed path.
- A runtime path, absolute URL, or `Request` object resolves to `unknown`; provide an explicit type: `` $fetch<{ id: string }>(`/api/${x}`) ``.
- Unknown paths are `unknown` by default; set `experimental.strictRouteTypes: true` (or `'isomorphic'`) to make them errors.
- Declare routes Nuxt can't see by augmenting `ServerRoutes` from `@nuxt/schema`, e.g. `'/api/hello': { [Endpoint]: { GET: { response: { message: string } } } }`.

## Caching and refresh

`useFetch` generates its key from the URL **plus** the fetch options and the call's source location — two `useFetch('/api/user')` calls in different components have **different** keys and each run their own request. To share data, pass the **same explicit `key`**:

```ts
const { data } = await useFetch('/api/user', { key: 'current-user' })
const cached = useNuxtData('current-user')
await refreshNuxtData('current-user')
clearNuxtData('current-user')
```

Use `pick`/`transform` to keep unused fields out of the payload (they do not reduce the upstream response). Relative `useFetch` calls on the server proxy appropriate request headers/cookies. For raw `$fetch`, use `useRequestFetch()` or explicitly forward only safe headers.

## Custom fetch composables

Use the compiler macro rather than hand-written async wrappers:

```ts
// app/composables/useAPI.ts
export const useAPI = createUseFetch({
  baseURL: 'https://api.example.com',
  onResponseError({ response }) {
    if (response.status === 401) return navigateTo('/login')
  },
})
```

A plain object supplies defaults; a function can enforce overrides or access `useNuxtApp()` at call time. The declaration must be exported and live in a scanned composables directory.

<!--
Source references:
- https://nuxt.com/docs/getting-started/data-fetching
- https://nuxt.com/docs/api/composables/use-fetch
- https://nuxt.com/docs/api/composables/use-async-data
- https://nuxt.com/docs/api/composables/create-use-fetch
- https://nuxt.com/docs/api/composables/create-use-async-data
- https://nuxt.com/docs/api/composables/use-request-fetch
- https://nuxt.com/docs/getting-started/upgrade
-->
