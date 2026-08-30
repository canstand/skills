---
name: nuxt-layers
description: Reusing Nuxt application code and configuration with local, package, and remote layers
---

# Nuxt Layers

A layer can contribute app files, server files, modules, and configuration. Its structure mirrors a Nuxt project:

```text
my-layer/
├── nuxt.config.ts
├── app/components/
├── app/composables/
├── app/pages/
├── app/app.config.ts
└── server/
```

## Extending layers

```ts
export default defineNuxtConfig({
  extends: [
    '../base-layer',
    '@acme/theme',
    'github:acme/theme#4a1b2c3',
  ],
})
```

Layers in the project `layers/` directory are auto-scanned. Local layers can also be listed explicitly with `~~/layers/name`; the first explicit `extends` entry has higher priority than later entries. Project files override layers, and auto-scanned layers are ordered alphabetically (later names have higher priority among them).

Use numeric directory prefixes when priority must be obvious:

```text
layers/
├── 1.base/
└── 2.theme/
```

Named aliases such as `#layers/theme` are available for layers. Use `$meta.name` in a layer config when you need to control its metadata/alias.

## Authoring and publishing

Prefer resolved paths for assets and use ESM. A published layer should ship compiled JavaScript for runtime-loaded config. Avoid relying on remote downloads for reproducibility: pin a remote layer as a package-manager git dependency and extend by package name. If you continue using a remote `extends` URL, install the optional `giget` dependency.

Keep a layer version-agnostic where possible and express compatibility in module metadata. A consuming project can disable inherited modules by setting the module's config key to `false`.

<!--
Source references:
- https://nuxt.com/docs/4.x/getting-started/layers
- https://nuxt.com/docs/4.x/guide/going-further/layers
- https://nuxt.com/docs/4.x/directory-structure/layers
- https://nuxt.com/docs/4.x/getting-started/upgrade#giget-is-now-optional-remote-layers
-->
