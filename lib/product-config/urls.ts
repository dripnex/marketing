/**
 * Product URLs and links
 */

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dripnex.app';
const DOCS = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.dripnex.app';

export const URLS = {
  website: SITE,
  docs: DOCS,
  pricing: `${SITE}/pricing`,
  download: `${SITE}/download`,
  faq: `${SITE}/faq`,
  changelog: `${SITE}/changelog`,
  github: 'https://github.com/dripnex/readide',
  discussions: 'https://github.com/dripnex/readide/discussions',
  issues: 'https://github.com/dripnex/readide/issues',
  twitter: 'https://x.com/dripnex',
  support: 'hello@dripnex.app',
  /** Canonical API host. Requires the Worker custom domain in wrangler.toml. */
  api: 'https://api.dripnex.app',
  /** Live workers.dev until api.dripnex.app DNS is attached. */
  apiFallback: 'https://readied-api-production.readied.workers.dev',
} as const;

export type UrlsConfig = typeof URLS;
