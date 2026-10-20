---
name: server-routes
description: Nitro API routes, server middleware, plugins, sessions, and request handling in Nuxt
---

# Server Routes

Nuxt includes the Nitro server engine for building full-stack applications with API routes and server middleware. Nuxt 5 runs on **Nitro v3** (h3 v2 and srvx, Web-standard `Request`/`Response`).

Nuxt scans root-level `server/` directories and registers Nitro handlers with HMR.

```text
server/
├── api/hello.get.ts       # GET /api/hello
├── routes/sitemap.xml.ts  # /sitemap.xml
├── middleware/auth.ts     # every request
├── plugins/db.ts
└── utils/db.ts
```

## Nuxt 5: `nuxt/server` imports

In Nuxt 5, Nitro's server helpers (`defineEventHandler`, `getQuery`, `readBody`, cookie/header helpers, `createError`, `sendRedirect`, `getRouteRules`, `useRuntimeConfig`, sessions, ...) are **no longer auto-imported by default**. Import them from **`nuxt/server`** — the runtime-agnostic surface that resolves to the configured server builder and survives h3/Nitro majors:

```ts
// server/api/hello.ts
import { defineEventHandler, getQuery } from 'nuxt/server'

export default defineEventHandler((event) => {
  const { name } = getQuery<{ name?: string }>(event)
  return { message: `Hello, ${name ?? 'world'}!` }
})
```

- Your own exports from `server/utils/` and `shared/utils/` are still auto-imported.
- Server code imports shared Nuxt composables from `#imports/server` (not `#imports`).
- Re-enable Nitro auto-imports while migrating with `experimental.nitroAutoImports: true`.
- `defineEventHandler` preserves the handler's return type — this is what types `$fetch`/`useFetch` calls to the route. Annotate the returned value, not the handler.
- Helpers not in the `nuxt/server` surface (e.g. `readMultipartFormData`, `lazyEventHandler`, `useStorage`, `defineCachedHandler`) still come from `nitro/h3`, `nitro/storage`, `nitro/cache`, etc.

## API routes

A handler exports `defineEventHandler`. HTTP method suffixes (`.get`, `.post`, `.put`, etc.) and bracket parameters are supported.

```ts
// server/api/users/[id].get.ts
import { defineEventHandler, createError, getRouterParam } from 'nuxt/server'

export default defineEventHandler((event) => {
  const user = findUser(getRouterParam(event, 'id'))
  if (!user) throw createError({ status: 404, statusText: 'User not found' })
  return user
})
```

Read input with `getQuery`, `readBody`, and `getRouterParam`; use validated variants with a schema library for untrusted input. Handlers may return JSON, a promise, or a `Response`/stream. Use `event.$fetch` in server routes when forwarding request context/headers, and `event.waitUntil(promise)` for work that should finish after sending the response.

> The examples below omit `import` lines for brevity; add them from `nuxt/server` (or enable `nitroAutoImports`).

## Middleware, plugins, and utilities

Server middleware runs before routes, should not return a response, and can extend `event.context`:

```ts
// server/middleware/auth.ts
import { defineEventHandler, getCookie } from 'nuxt/server'

export default defineEventHandler((event) => {
  event.context.user = getCookie(event, 'session')
})
```

Server plugins use Nitro's explicit API (`definePlugin` from `nitro`):

```ts
// server/plugins/log.ts
import { definePlugin } from 'nitro'

export default definePlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    console.log(event.req.method, event.url.pathname)
  })
})
```

> Nitro v3 replaces the `beforeResponse`/`afterResponse` hooks with a single `response` hook.

Put server-only helpers in `server/utils/`; they are auto-imported in the server context. Keep app and server code separate. `#server/...` provides stable server-local imports.

## Runtime config, cookies, and storage

Use `useRuntimeConfig()` without an event argument in server handlers. Read request headers with `getRequestHeader`, cookies with `getCookie`, and set response headers via `event.res.headers.set(...)` (Web `Headers`). Set cookies with `setCookie`. Keep secrets in private runtime config keys.

Nitro's cross-platform storage layer is available through `useStorage()` from `nitro/storage`:

```ts
// server/api/cache.get.ts
import { defineEventHandler } from 'nuxt/server'
import { useStorage } from 'nitro/storage'

export default defineEventHandler(async () => {
  const storage = useStorage('redis')
  await storage.setItem('answer', 42)
  return storage.getItem('answer')
})
```

Configure mounts in `nuxt.config.ts` under `nitro.storage`, or mount a driver from a server plugin.

## Request validation

`readValidatedBody` / `getValidatedQuery` accept any [Standard Schema](https://standardschema.dev) (Zod, Valibot, ArkType). Validated shapes also type the matching `$fetch`/`useFetch` request:

```ts
// server/api/users.post.ts
import { defineEventHandler, readValidatedBody } from 'nuxt/server'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const user = await readValidatedBody(event, z.object({ name: z.string() }))
  return { created: user.name }
})
```

Invalid input is rejected with a `400` whose `data.issues` lists the failures.

## Sessions

`useSession` (with `getSession`/`updateSession`/`clearSession`) comes from `nuxt/server` and seals a cookie session with `iron-webcrypto`, so it works under any server builder. Without a `password`, it derives a secret from `appSecret` (`NUXT_APP_SECRET`); pass a `password` of at least 32 characters to override. The cookie defaults to `nuxt-session`.

```ts
// server/api/visits.ts
import { defineEventHandler, useSession } from 'nuxt/server'

export default defineEventHandler(async (event) => {
  const session = await useSession<{ visits: number }>(event)
  await session.update(data => ({ visits: (data.visits ?? 0) + 1 }))
  return { visits: session.data.visits }
})
```

> h3 ships separate, non-interchangeable session helpers (`useSession` from `nitro/h3`, cookie name `h3`).

## Error handling

Nitro v3 / h3 v2 use Web-standard error names: `status`/`statusText` (was `statusCode`/`statusMessage`). The server error class is `HTTPError` from `nitro/h3`; `createError` from `nuxt/server` builds a `NuxtError`. `NuxtError` is not an `HTTPError` subclass, so narrow with `HTTPError.isError(error)` or `isNuxtError(error)` rather than `instanceof`.

The event uses Web APIs: `event.url.pathname` (not `event.path`), `event.req.method`/`event.req.headers`, and `event.res.status`/`event.res.headers.set(...)` (not `event.node.res`).

<!--
Source references:
- https://nuxt.com/docs/getting-started/server
- https://nuxt.com/docs/directory-structure/server
- https://nuxt.com/docs/directory-structure/shared
- https://nuxt.com/docs/guide/going-further/server-imports
- https://nuxt.com/docs/getting-started/upgrade#migration-to-nitro-v3
- https://nuxt.com/docs/getting-started/state-management
- https://nitro.build/blog/v3-beta
- https://nitro.build/guide/storage
-->
