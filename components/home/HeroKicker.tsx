'use client';

import { FileText, HardDrive } from 'lucide';
import { CyclingMorphIcon } from '@/components/icons/CyclingMorphIcon';

export function HeroKicker() {
  return (
    <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
      <CyclingMorphIcon from={FileText} to={HardDrive} size={14} className="text-accent" />
      Desktop · local Markdown
    </p>
  );
}
