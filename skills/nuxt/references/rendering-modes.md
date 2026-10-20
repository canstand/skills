---
name: rendering-modes
description: Nuxt universal, client-only, hybrid, prerendered, and edge rendering
---

# Rendering Modes

## Universal rendering

Universal rendering is the default: the server renders HTML, then the browser hydrates it with the same Vue code.

```ts
// nuxt.config.ts
export default defineNuxtConfig({ ssr: true })
```

Code in setup can run on server and client; event handlers run in the browser. Use `import.meta.server`, `import.meta.client`, or `<ClientOnly>` around browser-only code. Universal rendering is generally the best default for indexable content.

## Client-side rendering

Set `ssr: false` for a browser-rendered SPA:

```ts
export default defineNuxtConfig({ ssr: false })
```

Add `app/spa-loading-template.html` when a loading screen is needed before hydration. This is suitable for highly interactive, non-indexed apps, but it increases time to content and loses SSR SEO benefits.

## Hybrid rendering

Route rules can mix prerendering, caching, redirects, CORS, and client-only sections:

```ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/products/**': { swr: 3600 },
    '/blog/**': { isr: true },
    '/admin/**': { ssr: false },
    '/api/**': { cors: true },
    '/old': { redirect: '/new' },
  },
})
```

- `prerender` emits static assets at build time.
- `swr` caches and regenerates on the server/reverse proxy.
- `isr` enables CDN caching on supported providers.
- `ssr: false` makes matched pages browser-only and can exclude them from the server bundle when the rule covers every path.
- `noScripts` emits HTML/CSS without Nuxt scripts; it is useful for mostly-static pages but makes them non-interactive.
- `appMiddleware` controls Vue route middleware for matching page paths.

> **Nitro v3 changes:**
> - Redirect rules use `status` (not `statusCode`): `redirect: { to: '/new', status: 302 }`.
> - Cached routes (`cache`/`swr`/`isr`) key on **path only** — the query string is dropped. Keep it with `allowQuery: true` or a list: `cache: { swr: true, maxAge: 60, allowQuery: ['page'] }`.

Hybrid rendering is not available with `nuxt generate`; deploy a server build for runtime route rules.

## Prerendering and static fallbacks

```bash
nuxt generate
# or: nuxt build --prerender
```

These commands write `.output/public/`, including `200.html` and `404.html` fallbacks; a host may need explicit rewrite configuration.

**Nuxt 5 payload extraction:** `experimental.payloadExtraction` defaults to `'client'` — a prerendered/cached page's payload is inlined in the HTML for the initial render, and `_payload.json` is only fetched during client-side navigation (forced to `false` when `ssr: false`). `nuxt generate` / `nuxt build --prerender` emit `200.html` (the client router handles unmatched paths) and `404.html` (keeps the 404 status); a plain `nuxt build` does not.

To server-render `error.vue` into the 404 fallback:

```ts
export default defineNuxtConfig({
  experimental: { prerenderErrorPages: true },
})
```

Because one file serves every missing path, guard request-specific data with `import.meta.prerender` and wrap request-specific markup in `<ClientOnly>`. For dynamic routes, add paths in the `prerender:routes` hook or call `prerenderRoutes(['/posts/1'])` from server code.

## Edge rendering

Edge-side rendering is a Nitro deployment target, not a separate rendering model. Select a current provider preset such as `vercel`, `netlify_edge`, or `cloudflare_module`, and verify that dependencies use APIs available in that runtime.

<!--
Source references:
- https://nuxt.com/docs/guide/concepts/rendering
- https://nuxt.com/docs/getting-started/prerendering
- https://nuxt.com/docs/getting-started/deployment
- https://nuxt.com/docs/api/nuxt-config#routerules
- https://nuxt.com/docs/getting-started/upgrade
-->
