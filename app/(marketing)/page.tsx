import Link from 'next/link';
import { CloudOff, Code, File, FileText, HardDrive, PenLine } from 'lucide';
import ProductEmbed from '@/components/product/ProductEmbed';
import { MorphGlyph } from '@/components/icons/MorphGlyph';
import { DOCS_URL } from '@/lib/config';

const decisions = [
  {
    kicker: '01',
    title: 'The file is the note',
    body: 'GitHub Flavored Markdown on disk. The editor is a window, not a silo. SQLite is an index — the files are the source of truth.',
    rest: FileText,
    active: File,
  },
  {
    kicker: '02',
    title: 'Offline is the default',
    body: "Sign in first. After that, the editor works offline. Don't Sync is valid: stay local. Sync is optional, end-to-end, and never the source of truth.",
    rest: HardDrive,
    active: CloudOff,
  },
  {
    kicker: '03',
    title: 'The editor is the product',
    body: 'Write Markdown. That is the point. Hack the rest if you want — init.js, styles.css, keybindings.json.',
    rest: PenLine,
    active: Code,
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto max-w-3xl px-5 pt-32 pb-16 sm:pt-40 sm:pb-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          Desktop · local-first Markdown
        </p>
        <h1 className="mt-5 font-serif text-[clamp(2.6rem,7vw,4.4rem)] font-medium leading-[1.05] tracking-[-0.03em] text-text-primary">
          Your notes remain files.
        </h1>
        <p className="mt-6 max-w-[38ch] text-[17px] leading-relaxed text-text-secondary">
          A local-first Markdown editor. Files and SQLite on disk. GFM in the pane. Offline after
          you sign in. Don&apos;t Sync is a valid choice — the editor is the product.
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
        <div className="grid gap-16 sm:grid-cols-3 sm:gap-10">
          {decisions.map(item => (
            <div key={item.title}>
              <div className="flex items-center gap-2.5">
                <MorphGlyph
                  rest={item.rest}
                  active={item.active}
                  size={16}
                  className="text-accent"
                />
                <p className="font-mono text-[11px] text-accent">{item.kicker}</p>
              </div>
              <h2 className="mt-3 font-serif text-[1.35rem] leading-snug text-text-primary">
                {item.title}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl border-t border-white/[0.06] px-5 py-24">
        <h2 className="max-w-[16ch] font-serif text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.15] tracking-[-0.02em] text-text-primary">
          Same editor. Then it lives on your machine.
        </h2>
        <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-text-secondary">
          The window above is Dripnex. Download when you want the files next to everything else you
          already keep. Don&apos;t Sync stays a first-class choice.
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
