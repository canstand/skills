---
name: takumi
description: Generate dynamic Open Graph images from Nitro routes with Takumi
---

# Dynamic Open Graph Images with Takumi

Use [Takumi](https://takumi.kane.tw) to render an image response directly from a Nitro route. It chooses native bindings on Node and WebAssembly on edge presets.

```ts [routes/og.png.ts]
import { defineHandler } from "nitro";
import { container, text } from "takumi-js/helpers";
import ImageResponse from "takumi-js/response";

export default defineHandler(async ({ url }) => {
  const title = url.searchParams.get("title") ?? "My site";
  const description = url.searchParams.get("description") ?? "Built with Nitro";

  const response = new ImageResponse(
    container({
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "64px",
        backgroundImage: "linear-gradient(to bottom right, #fff1f2, #fecdd3)",
      },
      children: [
        text(title, { fontSize: 72, fontWeight: 700, color: "#111827" }),
        text(description, { fontSize: 42, color: "#4b5563" }),
      ],
    }),
    { width: 1200, height: 630 },
  );

  await response.ready;
  return response;
});
```

Reference the endpoint from page metadata:

```html
<meta property="og:image" content="/og.png?title=Hello&description=From%20Nitro" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

Await `response.ready` before changing headers or returning. Use query parameters (or route data) to produce per-page images; avoid inlining large assets into the bundle.

<!--
Source references:
- https://nitro.build/examples/takumi
- https://takumi.kane.tw
-->
