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

Hybrid rendering is not available with `nuxt generate`; deploy a server build for runtime route rules.

## Prerendering and static fallbacks

```bash
nuxt generate
# or: nuxt build --prerender
```

These commands write `.output/public/`, including `_payload.json` files when payload extraction is enabled, plus `200.html` and `404.html` fallbacks. A host may need explicit rewrite configuration. To server-render `error.vue` into the 404 fallback:

```ts
export default defineNuxtConfig({
  experimental: { prerenderErrorPages: true },
})
```

For dynamic routes, add paths in the `prerender:routes` hook or call `prerenderRoutes(['/posts/1'])` from server code. Use `import.meta.prerender` when request-specific data must be deferred to the client during generation.

## Edge rendering

Edge-side rendering is a Nitro deployment target, not a separate rendering model. Select a current provider preset such as `vercel`, `netlify_edge`, or `cloudflare_module`, and verify that dependencies use APIs available in that runtime.

<!--
Source references:
- https://nuxt.com/docs/4.x/guide/concepts/rendering
- https://nuxt.com/docs/4.x/getting-started/prerendering
- https://nuxt.com/docs/4.x/getting-started/deployment
- https://nuxt.com/docs/4.x/api/nuxt-config#routerules
-->
