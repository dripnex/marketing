import { writeFileSync } from 'node:fs';

const docs = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.dripnex.app';
const body = `/docs ${docs} 301\n/docs/* ${docs}/:splat 301\n`;
writeFileSync(new URL('../public/_redirects', import.meta.url), body);
