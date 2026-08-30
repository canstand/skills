---
name: built-in-components
description: NuxtLink, NuxtPage, NuxtLayout, client-only rendering, islands, and accessibility components
---

# Built-in Components

## App shell

```vue
<!-- app/app.vue -->
<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- `<NuxtLink>` renders optimized internal links, prefetching components/payload when observed. Use `external`, `replace`, `prefetch="false"`, or route-object props as needed.
- `<NuxtPage>` renders the current page and accepts `page-key`, page props, and transition options.
- `<NuxtLayout>` selects a layout and accepts transition options or a layout name.
- `<NuxtLoadingIndicator>` shows navigation progress.
- `<NuxtErrorBoundary>` catches descendant errors and exposes an error slot with `clearError`.

## Client-only content

Use `<ClientOnly>` for browser APIs or components that cannot render on the server. Provide a stable fallback for layout/SEO:

```vue
<template>
  <ClientOnly>
    <BrowserChart :data="points" />
    <template #fallback><div class="chart-placeholder" /></template>
  </ClientOnly>
</template>
```

`<DevOnly>` renders its slot only during development. `<Teleport>` may need `<ClientOnly>` and a stable target when used with SSR.

## Islands

`<NuxtIsland>` renders an island without shipping its component JavaScript to the browser. Props trigger a server refetch and must be serializable; they are sent as GET query parameters, so do not pass secrets or large values. The island has its own route/context and cannot share `useState`, Pinia, or provide/inject with the page. See [server components](server-components.md).

## Accessibility

`<NuxtRouteAnnouncer>` announces page-title changes after navigation. Its default `atomic` is `false`; it accepts `politeness` and a slot for custom output. For in-page updates, add `<NuxtAnnouncer>` once and use `useAnnouncer()`:

```vue
<script setup lang="ts">
const { polite, assertive } = useAnnouncer()

async function save() {
  try {
    await $fetch('/api/profile', { method: 'POST' })
    polite('Profile saved')
  } catch {
    assertive('Profile could not be saved')
  }
}
</script>
```

Use the route announcer for navigation and the regular announcer for messages such as validation, toasts, and loading states.

`<NuxtImg>` and `<NuxtPicture>` are provided by `@nuxt/image`, not Nuxt core.

<!--
Source references:
- https://nuxt.com/docs/4.x/api/components/nuxt-link
- https://nuxt.com/docs/4.x/api/components/nuxt-page
- https://nuxt.com/docs/4.x/api/components/nuxt-layout
- https://nuxt.com/docs/4.x/api/components/client-only
- https://nuxt.com/docs/4.x/api/components/nuxt-island
- https://nuxt.com/docs/4.x/api/components/nuxt-route-announcer
- https://nuxt.com/docs/4.x/api/components/nuxt-announcer
-->
