'use client';

import { FileQuestionMark, FileText, Search, SquarePen } from 'lucide';
import { CyclingMorphIcon } from '@/components/icons/CyclingMorphIcon';

export function NotFoundMark() {
  return (
    <CyclingMorphIcon
      from={FileQuestionMark}
      to={Search}
      size={56}
      intervalMs={3600}
      className="text-[#71717a]"
    />
  );
}

export function EditorEmptyMark() {
  return (
    <CyclingMorphIcon
      from={FileText}
      to={SquarePen}
      size={40}
      intervalMs={3400}
      className="text-current"
    />
  );
}

export function ListEmptyMark() {
  return (
    <CyclingMorphIcon
      from={Search}
      to={FileText}
      size={28}
      intervalMs={3000}
      className="text-current"
    />
  );
}
