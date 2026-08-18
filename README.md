# Dripnex marketing

Public marketing site for [dripnex.app](https://dripnex.app). Next.js static export on Cloudflare Pages.

Docs live in [`dripnex/docs-site`](https://github.com/dripnex/docs-site).

## Develop

```bash
pnpm install
pnpm dev
```

## Deploy

```bash
NEXT_PUBLIC_SITE_URL=https://dripnex-marketing.pages.dev \
NEXT_PUBLIC_DOCS_URL=https://dripnex-docs.pages.dev \
pnpm deploy
```

Production Pages project: `dripnex-marketing` → `https://dripnex-marketing.pages.dev`.

When apex DNS is ready, CNAME `@` and `www` to `dripnex-marketing.pages.dev` (or keep them on `dripnex-web` and deploy this project there).
