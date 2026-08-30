---
name: server-routes
description: Nitro API routes, server middleware, plugins, request handling, and storage in Nuxt
---

# Server Routes

Nuxt scans root-level `server/` directories and registers Nitro handlers with HMR.

```text
server/
├── api/hello.get.ts       # GET /api/hello
├── routes/sitemap.xml.ts  # /sitemap.xml
├── middleware/auth.ts     # every request
├── plugins/db.ts
└── utils/db.ts
```

A handler should export `defineEventHandler` (auto-imported, or explicitly from `nitro/h3`). HTTP method suffixes (`.get`, `.post`, `.put`, etc.) and bracket parameters are supported.

```ts
// server/api/users/[id].get.ts
import { defineEventHandler, getRouterParam } from 'nitro/h3'

export default defineEventHandler((event) => {
  const user = findUser(getRouterParam(event, 'id'))
  if (!user) throw createError({ status: 404, statusText: 'User not found' })
  return user
})
```

Read input with `getQuery`, `readBody`, and `getRouterParam`; use validated variants with a schema library for untrusted input. Handlers may return JSON, a promise, or a `Response`/stream. Use `event.$fetch` in server routes when forwarding request context/headers, and `event.waitUntil(promise)` for work that should finish after sending the response.

## Middleware, plugins, and utilities

Server middleware runs before routes, should not return a response, and can extend `event.context`:

```ts
// server/middleware/auth.ts
export default defineEventHandler((event) => {
  event.context.user = getCookie(event, 'session')
})
```

Server plugins use Nitro's current explicit API:

```ts
// server/plugins/log.ts
import { definePlugin } from 'nitro'

export default definePlugin((nitro) => {
  nitro.hooks.hook('request', (event) => {
    console.log(event.req.method, event.req.url)
  })
})
```

Put server-only helpers in `server/utils/`; they are auto-imported in the server context. Keep app and server code separate. `#server/...` provides stable server-local imports.

## Runtime config, cookies, and storage

Use `useRuntimeConfig()` without an event argument in server handlers. Read cookies with `parseCookies`/`getCookie`, and set them with `setCookie`. Keep secrets in private runtime config keys.

Nitro's cross-platform storage layer is available through `useStorage()`:

```ts
// server/api/cache.get.ts
export default defineEventHandler(async () => {
  const storage = useStorage('redis')
  await storage.setItem('answer', 42)
  return storage.getItem('answer')
})
```

Configure mounts in `nuxt.config.ts` under `nitro.storage`, or mount a driver from a server plugin.

<!--
Source references:
- https://nuxt.com/docs/4.x/getting-started/server
- https://nuxt.com/docs/4.x/directory-structure/server
- https://nuxt.com/docs/4.x/directory-structure/shared
- https://nitro.build/guide
- https://nitro.build/guide/storage
-->
