import Link from 'next/link';
import ProductEmbed from '@/components/product/ProductEmbed';
import FeatureBeats from '@/components/home/FeatureBeats';
import { HeroKicker } from '@/components/home/HeroKicker';
import { DOCS_URL } from '@/lib/config';

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-16 sm:pt-40 sm:pb-20">
        <HeroKicker />
        <h1 className="mt-5 font-serif text-[clamp(2.6rem,7vw,4.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-text-primary">
          Your Markdown, on your machine.
        </h1>
        <p className="mt-6 max-w-[38ch] text-[17px] leading-relaxed text-text-secondary">
          A desktop editor for notes that stay files. GitHub Flavored Markdown, local-first, offline
          by default. The editor is the product — not a cloud notebook you have to keep.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
          <Link
            href="/download"
            className="rounded-md bg-text-primary px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-80"
          >
            Download
          </Link>
          <Link
            href="/try"
            className="text-[13px] text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
          >
            Open the editor
          </Link>
          <a
            href={DOCS_URL}
            className="text-[13px] text-text-muted underline-offset-4 hover:text-text-secondary hover:underline"
          >
            Docs
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-5 pb-24">
        <ProductEmbed />
      </section>

      <section className="mx-auto max-w-3xl border-t border-white/[0.06] px-5 py-24">
        <FeatureBeats />
      </section>

      <section className="mx-auto max-w-3xl border-t border-white/[0.06] px-5 py-24">
        <h2 className="max-w-[16ch] font-serif text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] text-text-primary">
          Same editor. Then it lives on your machine.
        </h2>
        <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-text-secondary">
          The window above is Dripnex. Download the desktop app when you want the files next to
          everything else you already keep. Sync if you want it. Don&apos;t if you don&apos;t.
        </p>
        <Link
          href="/download"
          className="mt-8 inline-flex rounded-md bg-text-primary px-4 py-2 text-[13px] font-medium text-background hover:opacity-80"
        >
          Get the app
        </Link>
      </section>
    </div>
  );
}
