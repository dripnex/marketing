export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dripnex.app';
export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://docs.dripnex.app';

export const URLS = {
  website: SITE_URL,
  docs: DOCS_URL,
  pricing: `${SITE_URL}/pricing`,
  download: `${SITE_URL}/download`,
  faq: `${SITE_URL}/faq`,
  changelog: `${SITE_URL}/changelog`,
  github: 'https://github.com/dripnex/readide',
  discussions: 'https://github.com/dripnex/readide/discussions',
  issues: 'https://github.com/dripnex/readide/issues',
  twitter: 'https://x.com/dripnex',
  support: 'hello@dripnex.app',
  api: 'https://api.dripnex.app',
} as const;

export type PlanId = 'free' | 'pro';
export type BillingInterval = 'monthly' | 'annual';
export type GuaranteeId = 'refund' | 'noLockIn' | 'freeTierForever' | 'cancelAnytime';

export interface PlanPricing {
  readonly label: string;
  readonly amountCents: number;
}

export interface PlanConfig {
  readonly name: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly pricing?: {
    readonly intervals: Record<BillingInterval, PlanPricing>;
    readonly annualSavings?: string;
  };
}

export interface ProductConfig {
  readonly trialDays: number;
  readonly trialDescription: string;
  readonly plans: Record<PlanId, PlanConfig>;
  readonly guarantees: Record<GuaranteeId, { readonly description: string }>;
}

export function getProductConfig(): ProductConfig {
  return {
    trialDays: 14,
    trialDescription: '14-day Pro trial, no credit card required',
    plans: {
      free: {
        name: 'Free',
        description: 'Perfect for personal note-taking',
        features: [
          'Unlimited local notes',
          'Full markdown editor',
          'Export to markdown',
          'Import from folder',
          'Basic search',
          '100% offline after sign-in',
          "Don't Sync — stay local",
        ],
      },
      pro: {
        name: 'Pro',
        description: "Optional sync and extras. Don't Sync stays valid.",
        features: [
          'Everything in Free',
          'Optional cloud sync across devices',
          'Automatic backlinks',
          'Custom themes',
          'Advanced search',
          'Import Obsidian vault',
          'Priority support',
        ],
        pricing: {
          intervals: {
            monthly: { label: '€2/mo', amountCents: 200 },
            annual: { label: '€20/year', amountCents: 2000 },
          },
          annualSavings: '17%',
        },
      },
    },
    guarantees: {
      refund: { description: '14-day money-back guarantee, no questions asked' },
      noLockIn: { description: 'Export anytime. Your notes are standard Markdown.' },
      freeTierForever: { description: 'Free tier works forever. No tricks, no time limits.' },
      cancelAnytime: { description: 'Cancel your Pro subscription anytime. Keep using Free.' },
    },
  };
}
