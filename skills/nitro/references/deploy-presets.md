---
name: deploy-presets
description: Deployment presets for runtimes and providers, compatibility dates, and platform integration in Nitro
---

# Deployment Presets

Nitro builds the same code into different output formats via **presets**. Most providers are auto-detected in CI; otherwise set the preset explicitly.

```bash
nitro build --preset cloudflare_module
# or env var:
NITRO_PRESET=vercel nitro build
```

```ts [nitro.config.ts]
import { defineConfig } from "nitro";

export default defineConfig({
  preset: "cloudflare_pages",
  defaultPreset: "node_cluster", // fallback when nothing is detected
});
```

The default production preset is `node_server`; dev always uses the isolated `nitro_dev` preset.

## Runtime presets

| Preset | Runtime / Notes |
|---|---|
| `node_server` | Default. `node .output/server/index.mjs` starts a ready server. |
| `node_cluster` | Multi-core via `node:cluster` (`NITRO_CLUSTER_WORKERS`). |
| `node_middleware` | Exports a `(req, res)` middleware/`listener` for custom servers. |
| `bun` | Optimized [Bun](https://bun.sh) output: `bun run ./.output/server/index.mjs`. |
| `deno_server` | [Deno](https://deno.com) server output. |

Node server env vars: `NITRO_PORT`/`PORT` (3000), `NITRO_HOST`/`HOST`, `NITRO_UNIX_SOCKET`, `NITRO_SSL_CERT`/`NITRO_SSL_KEY`, and graceful-shutdown controls (`NITRO_SHUTDOWN_*`).

## Provider presets

| Provider | Preset(s) | Auto-detect |
|---|---|---|
| Cloudflare | `cloudflare_module` (recommended), `cloudflare_pages` | ✅ |
| Vercel | `vercel` (Fluid compute) | ✅ |
| Netlify | `netlify`, `netlify_edge` | ✅ |
| AWS | `aws_amplify`, `aws_lambda` | Amplify ✅ |
| Azure | `azure_swa` | ✅ |
| Deno Deploy | `deno_deploy` | — |
| Firebase | `firebase_app_hosting` | ✅ |
| Others | GitHub/GitLab Pages, DigitalOcean, Heroku, Render, Zeabur, Stormkit, Koyeb, ... | varies |

## Compatibility dates

Providers evolve; Nitro uses a compatibility date to lock behavior at project creation and opt into updates deliberately.

```ts [nitro.config.ts]
export default defineConfig({
  compatibilityDate: "2025-01-01",
});
```

## Platform integration highlights

**Cloudflare** (`cloudflare_module`): access bindings via `event.req.runtime.cloudflare.env`:

```ts
import { defineHandler } from "nitro";

export default defineHandler(async (event) => {
  const { env } = event.req.runtime.cloudflare;
  const { results } = await env.MY_D1.prepare("SELECT id FROM t").all();
  return results;
});
```

Dev uses Miniflare to emulate bindings (define them in `wrangler.json`/`.toml` or inline via `cloudflare.wrangler`). Nitro resolves `miniflare` from your project and offers to install it on first use. `scheduledTasks` auto-generate Cron Triggers. Platform hooks: `cloudflare:scheduled`, `cloudflare:email`, `cloudflare:queue`, `cloudflare:tail`.

Experimental tracing is available with `tracingChannel: true`; it reports Nitro events as Cloudflare custom spans without an OpenTelemetry SDK. Enable Worker tracing too:

```ts
export default defineConfig({ preset: "cloudflare_module", tracingChannel: true });
```

```jsonc
// wrangler.jsonc
{ "observability": { "traces": { "enabled": true } } }
```

**Vercel** (`vercel`): use `routes/api/` (not `api/`). `scheduledTasks` → Vercel Cron Jobs (secure with `CRON_SECRET`); `isr` route rules → ISR; external `proxy` route rules become CDN rewrites. Per-route function config via `vercel.functionRules`; Bun runtime via `vercel.functions.runtime`.

Vercel Queues are configured in Nitro and consumed in a plugin:

```ts [nitro.config.ts]
export default defineConfig({
  serverDir: "./server",
  vercel: { queues: { triggers: [{ topic: "orders", retryAfterSeconds: 60 }] } },
});
```

```ts [server/plugins/queues.ts]
import { definePlugin } from "nitro";

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("vercel:queue", ({ message, metadata }) => {
    console.log(metadata.topicName, message);
  });
});
```

Send messages with `@vercel/queue` from a `defineHandler`. Vercel's local SDK delivers them directly to the hook.

Vercel immutable static files are opt-in via `vercel.immutableStaticFiles: true` (or `NITRO_VERCEL_IMMUTABLE_STATIC_FILES_ENABLED`). They are emitted under the reserved `/_vercel/immutable/` path and require a root `baseURL`; the `VERCEL_HASH_SALT` variable can rotate paths. Nitro + Vite wires `buildAssetsDir` automatically, while custom client builds must use `nitro.options.buildAssetsDir` as their asset output directory.

> Prefer Nitro's portable abstractions ([storage](core-storage.md), [database](features-database.md)) over low-level platform bindings for stability across targets.

**Zerops** (`zerops`): configure Node.js 22 or static services with `zerops.yaml`. Set `NITRO_PRESET=zerops` for a server deployment or `zerops-static` for static output:

```yaml [zerops.yaml]
zerops:
  - setup: app
    build:
      base: nodejs@22
      envVariables:
        NITRO_PRESET: zerops
      buildCommands: [pnpm i, pnpm run build]
      deployFiles: [.output, package.json, node_modules]
    run:
      base: nodejs@22
      ports: [{ port: 3000, httpSupport: true }]
      start: node .output/server/index.mjs
```

## Key Points

- One codebase → many targets; switch with `preset` / `NITRO_PRESET` / `--preset`.
- `node_server` is the default; `bun` and `deno_server` optimize for those runtimes.
- Cloudflare/Vercel/Netlify are zero-config in their CI; set the preset explicitly elsewhere.
- Set `compatibilityDate` and update it deliberately (test after each bump).
- v2→v3 renamed many presets (e.g. `cloudflare*` → `cloudflare_module`, `vercel-edge` → `vercel`, `azure*` → `azure_swa`).

<!--
Source references:
- https://nitro.build/deploy
- https://nitro.build/deploy/runtimes/node
- https://nitro.build/deploy/providers/cloudflare
- https://nitro.build/deploy/providers/vercel
- https://nitro.build/deploy/providers/zerops
- https://developers.cloudflare.com/workers/observability/traces/custom-spans/
- https://vercel.com/docs/skew-protection
-->
