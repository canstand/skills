---
name: directory-structure
description: Nuxt project directories, file conventions, aliases, and app/server boundaries
---

# Directory Structure

Nuxt uses the directory containing `nuxt.config.ts` as the project root. The default Vue source directory is `app/`; server and shared code live at the root so Nuxt can build the app and Nitro contexts separately.

```text
my-app/
├── app/
│   ├── app.vue
│   ├── app.config.ts
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── middleware/
│   ├── pages/
│   ├── plugins/
│   └── utils/
├── server/
│   ├── api/
│   ├── routes/
│   ├── middleware/
│   ├── plugins/
│   ├── types/
│   └── utils/
├── shared/
│   ├── types/
│   └── utils/
├── public/
├── layers/
├── modules/
├── nuxt.config.ts
└── tsconfig.json
```

`app/pages/` is optional. If it is absent, Nuxt does not include vue-router or `NuxtPage` routes.

## App directories

Files in `app/components`, `app/composables`, and `app/utils` are auto-imported according to their scanners. Only top-level composables/utils are scanned by default; re-export nested files or configure `imports.dirs`.

- `app/pages/`: file-based routes.
- `app/layouts/`: wrappers selected with `definePageMeta` or `setPageLayout`.
- `app/middleware/`: Vue route middleware; `.global` runs on every route change.
- `app/plugins/`: auto-registered plugins; `.client` and `.server` restrict execution.
- `app/assets/`: assets processed by Vite/webpack.
- `public/`: files served unchanged from the site root.
- `app/app.config.ts`: public build-time app configuration.

## Server and shared boundaries

`server/` is Nitro code. API files are prefixed with `/api`, while `server/routes` creates routes without that prefix. Middleware runs for every server request and should inspect/extend the event or throw, not return a response.

```ts
// server/api/hello.get.ts
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler(() => ({ hello: 'world' }))
```

**Nuxt 5 server imports:** Nitro/h3 helpers (`defineEventHandler`, `getQuery`, `createError`…) are **no longer auto-imported by default** — import them from `nuxt/server`. Your own `server/utils/` and `server/types/` exports are still auto-imported. Inside server code, import shared Nuxt composables from `#imports/server` (not `#imports`). Re-enable Nitro auto-imports with `experimental.nitroAutoImports: true`.

`shared/` is safe in both bundles and must not import Vue or Nitro runtime code. Top-level files in `shared/utils` and `shared/types` are auto-imported; use `#shared/...` for other files. Put app-only types in `app/types/` and server-only types in `server/types/`.

```ts
// shared/utils/capitalize.ts
export const capitalize = (value: string) => value[0]
  ? value[0].toUpperCase() + value.slice(1)
  : ''
```

Use `#server/...` only within server code for stable imports across server directories. Do not import app composables/components into Nitro handlers, or server utilities into app code.

## Naming conventions

| Pattern | Result |
|---|---|
| `pages/[id].vue` | Dynamic route parameter |
| `pages/[[id]].vue` | Optional parameter |
| `pages/[...slug].vue` | Catch-all route |
| `components/base/Button.vue` | `<BaseButton>` |
| `components/(group)/Button.vue` | Parenthesized group is omitted from the name |
| `*.client.vue` | Client-only auto-imported component |
| `*.server.vue` | Server component/island |
| `*.global.vue` | Globally registered component |
| `*.global.ts` | Global route middleware |

For details about component scanning, including `pathPrefix`, `pattern`, and `ignore`, see the components reference.

<!--
Source references:
- https://nuxt.com/docs/directory-structure
- https://nuxt.com/docs/directory-structure/app
- https://nuxt.com/docs/directory-structure/server
- https://nuxt.com/docs/directory-structure/shared
- https://nuxt.com/docs/guide/going-further/server-imports
- https://nuxt.com/docs/directory-structure/tsconfig
-->
