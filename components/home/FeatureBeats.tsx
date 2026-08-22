'use client';

import { CloudOff, File, FileText, HardDrive, Package, Puzzle } from 'lucide';
import { CyclingMorphIcon } from '@/components/icons/CyclingMorphIcon';

const beats = [
  {
    kicker: '01',
    title: 'The file is the note',
    body: 'GitHub Flavored Markdown on disk. SQLite is an index, not a vault. If the app goes away, the notes do not.',
    from: FileText,
    to: File,
  },
  {
    kicker: '02',
    title: 'Offline is the default',
    body: "Don't Sync is a valid choice. Sync is optional, end-to-end, and never the source of truth. You write locally first.",
    from: CloudOff,
    to: HardDrive,
  },
  {
    kicker: '03',
    title: 'Hackable on purpose',
    body: 'Official packs — Mermaid, Vim, KaTeX, tables — not a marketplace. init.js, styles.css, keybindings.json when you want more.',
    from: Puzzle,
    to: Package,
  },
] as const;

export default function FeatureBeats() {
  return (
    <div className="grid gap-16 sm:grid-cols-3 sm:gap-10">
      {beats.map((item, index) => (
        <div key={item.title}>
          <div className="flex items-center gap-2.5 text-accent">
            <CyclingMorphIcon
              from={item.from}
              to={item.to}
              size={22}
              delayMs={index * 400}
              className="text-accent"
            />
            <p className="font-mono text-[11px]">{item.kicker}</p>
          </div>
          <h2 className="mt-3 font-serif text-[1.35rem] leading-snug text-text-primary">
            {item.title}
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-text-secondary">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
