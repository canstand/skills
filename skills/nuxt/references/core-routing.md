---
name: routing
description: Nuxt file-based routing, navigation, route middleware, validation, and layouts
---

# Routing

Nuxt generates vue-router routes from Vue files in `app/pages/`. Routes are code-split by default.

## Nuxt 5 routing defaults

- **Case-sensitive matching** (`router.options.sensitive: true`) — `/About` no longer matches `pages/about.vue`. Match link casing to file names, or set `router: { options: { sensitive: false } }`.
- **Typed pages on by default** (`experimental.typedPages`) — `useRoute`, `navigateTo`, `<NuxtLink :to>`, and `router.push` are type-checked against your real routes. Referencing a missing route is a type error; opt out with `experimental.typedPages: false`.
- **Normalized page component names** — a page is named after its route, not its filename (`pages/foo/index.vue` → `foo`, not `index`). Update `<KeepAlive :include>` filters to route names, or set `experimental.normalizePageNames: false`.
- **Serializable page meta extracted at build time** — every JSON-serializable `definePageMeta()` property is written into the generated route record; only non-serializable values (functions, refs, spreads) resolve at runtime.

```text
app/pages/
├── index.vue                 # /
├── about.vue                 # /about
├── posts/[id].vue            # /posts/:id
├── posts/[...slug].vue       # catch-all
└── (marketing)/pricing.vue   # /pricing; group omitted
```

## Navigation and typed routes

Use `<NuxtLink>` for links and `navigateTo`/`useRouter` for programmatic navigation. Nuxt prefetches linked components and extracted payloads when links are observed. Typed pages are on by default in Nuxt 5; see the routing defaults above.

```vue
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

async function openPost(id: string) {
  await navigateTo(`/posts/${id}`)
  // Or: await router.push({ name: 'posts-id', params: { id } })
}
</script>

<template>
  <NuxtLink to="/about">About</NuxtLink>
  <p>Post: {{ route.params.id }}</p>
</template>
```

## Route middleware

Route middleware runs in the Vue app during navigation, not for Nitro server routes. Use server middleware for `/api/*` and other server requests.

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/login' && !useAuth().isLoggedIn.value) {
    return navigateTo('/login')
  }
})
```

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
</script>
```

Use `.global.ts` for global middleware or an inline function in `definePageMeta` for a page-local guard. Middleware names are normalized to kebab-case.

## Validation and page metadata

Return `false` from `definePageMeta({ validate })` for a 404, or return `{ status, statusText }` for a custom validation error.

```vue
<script setup lang="ts">
definePageMeta({
  validate: (route) => typeof route.params.id === 'string'
    && /^\d+$/.test(route.params.id),
})
</script>
```

Use `definePageMeta` for layout, middleware, validation, aliases, and route metadata. With recent Nuxt versions, layout can be an object to pass typed props:

```vue
<script setup lang="ts">
definePageMeta({
  layout: { name: 'panel', props: { title: 'Dashboard' } },
})
</script>
```

## Layouts and named views

Layouts live in `app/layouts/` and render the page through `<slot />`. Select one with `layout: 'admin'`, disable it with `layout: false`, or switch at runtime with `setPageLayout('admin')`.

A route can render named views with `child@sidebar.vue` and `<NuxtPage name="sidebar" />`. Keep `definePageMeta` in the default route file.

<!--
Source references:
- https://nuxt.com/docs/getting-started/routing
- https://nuxt.com/docs/directory-structure/app/pages
- https://nuxt.com/docs/directory-structure/app/middleware
- https://nuxt.com/docs/api/utils/define-page-meta
- https://nuxt.com/docs/api/composables/use-layout
- https://nuxt.com/docs/getting-started/upgrade
-->
