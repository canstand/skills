---
name: deployment
description: Deploying Nuxt with Nitro to Node, static hosts, serverless platforms, and edge runtimes
---

# Deployment

Nitro builds Nuxt for a selected runtime. Run `nuxt build` for a server deployment or `nuxt generate`/`nuxt build --prerender` for static output.

## Node server

```bash
nuxt build
NODE_ENV=production node .output/server/index.mjs
```

The server listens on port `3000` by default. `NITRO_PORT`/`PORT`, `NITRO_HOST`/`HOST`, and (for testing) `NITRO_SSL_CERT`/`NITRO_SSL_KEY` configure the generated server. Put TLS termination in a reverse proxy in normal deployments.

For a subpath deployment, set `app.baseURL` or `NUXT_APP_BASE_URL`. The generated output is self-contained, so copy `.output/` to the runtime image:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY .output .output
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

## Static hosting

```bash
nuxt generate
# deploy .output/public/
```

Static generation emits prerendered HTML and `_payload.json` files when payload extraction is enabled. It also emits `200.html` and `404.html` fallbacks; configure the host to use the appropriate fallback. A plain `nuxt build` does not create static output.

For a client-only static app:

```ts
// nuxt.config.ts
export default defineNuxtConfig({ ssr: false })
```

Consider `app/spa-loading-template.html` for the loading screen. Pure client rendering gives up most SSR SEO benefits. `nuxt generate`/prerendered output does not include a server, so use `nuxt build` when server routes are needed.

## Presets and hybrid deployment

Choose a Nitro preset in config or the environment:

```ts
export default defineNuxtConfig({
  nitro: { preset: 'vercel' },
})
```

```bash
NITRO_PRESET=cloudflare_pages nuxt build
```

See the [Nitro deployment presets](https://nitro.build/deploy) for the current provider list. Route rules such as `prerender`, `swr`, and `isr` require a server/CDN deployment and are not available with `nuxt generate` as hybrid rendering.

<!--
Source references:
- https://nuxt.com/docs/4.x/getting-started/deployment
- https://nuxt.com/docs/4.x/getting-started/prerendering
- https://nuxt.com/docs/4.x/guide/concepts/rendering#hybrid-rendering
- https://nitro.build/deploy
-->
