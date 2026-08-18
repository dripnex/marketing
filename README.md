# Dripnex marketing

Public site for [dripnex.app](https://dripnex.app). Next.js static export on Cloudflare Pages.

Docs live in [`dripnex/docs-site`](https://github.com/dripnex/docs-site).

## Develop

```bash
pnpm install
pnpm dev
```

What’s New files live in `content/releases/vX.Y.Z.md`.

## Deploy

```bash
NEXT_PUBLIC_SITE_URL=https://dripnex-marketing.pages.dev \
NEXT_PUBLIC_DOCS_URL=https://dripnex-docs.pages.dev \
pnpm deploy
```

Pages project: `dripnex-marketing` → https://dripnex-marketing.pages.dev

`/docs` redirects to the docs site. When apex DNS is ready, CNAME `@` and `www` to this project (or keep them on `dripnex-web` and deploy here instead).
