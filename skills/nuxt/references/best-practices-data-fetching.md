---
name: data-fetching-best-practices
description: Reliable and efficient Nuxt data fetching, caching, payload, concurrency, and side-effect patterns
---

# Data Fetching Best Practices

## Pick the right primitive

| Need | Use |
|---|---|
| SSR page/component data from an endpoint | `useFetch` |
| SSR data from a custom async function | `useAsyncData` |
| Form submission or click handler | `$fetch` |
| Shared API defaults | `createUseFetch` |
| Side effects or store actions | `callOnce` |

Do not use bare `$fetch` for initial data in setup: it can run once on the server and again during hydration.

## Choose navigation behavior deliberately

```vue
<script setup lang="ts">
// Critical data: await blocks client navigation and is available after the call.
const { data: article } = await useFetch('/api/article/1')

// Non-critical data: lazy navigation with explicit loading UI.
const { data: comments, status } = useLazyFetch('/api/article/1/comments')
</script>
```

SSR waits for `useFetch`/`useAsyncData` even without `await`. The keyword controls setup continuation and client-navigation blocking; `lazy` controls when the request runs and is the clearer choice for non-blocking data.

## Use stable, complete keys

Explicit keys make sharing and invalidation predictable, especially for dynamic pages:

```ts
const route = useRoute()
const { data } = await useAsyncData(
  `post:${route.params.slug}`,
  (_nuxtApp, { signal }) => $fetch(`/api/posts/${route.params.slug}`, { signal }),
)
```

`useFetch` keys include URL, options, and call-site location. Calls in different components with the same URL do not share data unless they use the same explicit key. Calls sharing a key must keep handler, `deep`, `transform`, `pick`, `getCachedData`, and `default` consistent.

## Keep handlers safe and cancellable

Handlers should be side-effect free and return a truthy value. Accept `{ signal }` and pass it to `$fetch` so navigation, `clear`, dedupe, or timeout can cancel stale work:

```ts
const { data } = await useAsyncData('dashboard', async (_app, { signal }) => {
  const [user, stats] = await Promise.all([
    $fetch('/api/user', { signal }),
    $fetch('/api/stats', { signal }),
  ])
  return { user, stats }
})
```

Use `callOnce` for Pinia actions, analytics, and other effects rather than putting them in an async-data handler.

## Reduce payload and refetches

Use `pick` for fields used by the template and `transform` for shaping results; these reduce serialized payload size, not upstream work. Use reactive URLs/options for dependent requests and `watch: false` when automatic refetching is undesirable. Use `enabled: false` to gate all executions without clearing existing data.

```ts
const query = ref('nuxt')
const { data, execute } = useFetch('/api/search', {
  query: { q: query },
  pick: ['id', 'title'],
  immediate: false,
})
```

Refresh with the returned `refresh`/`execute`, or globally with `refreshNuxtData` and `clearNuxtData`.

<!--
Source references:
- https://nuxt.com/docs/4.x/getting-started/data-fetching
- https://nuxt.com/docs/4.x/api/composables/use-fetch
- https://nuxt.com/docs/4.x/api/composables/use-async-data
- https://nuxt.com/docs/4.x/api/composables/create-use-fetch
- https://nuxt.com/docs/4.x/api/utils/call-once
-->
