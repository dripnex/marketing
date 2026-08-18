'use client';

import { useMemo } from 'react';
import { scanMarkdown, type MarkdownHeading } from '@/lib/markdown/scan';

export default function OutlineNav({
  content,
  onJump,
}: {
  content: string;
  onJump: (heading: MarkdownHeading) => void;
}) {
  const headings = useMemo(() => scanMarkdown(content).headings, [content]);

  return (
    <aside className="outline" aria-label="Note outline">
      <p className="outline-label">Outline</p>
      {headings.length === 0 ? (
        <p className="outline-empty">No headings</p>
      ) : (
        <nav>
          {headings.map(heading => (
            <button
              key={`${heading.line}-${heading.text}`}
              type="button"
              className={`outline-item outline-l${heading.level}`}
              onClick={() => onJump(heading)}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      )}
    </aside>
  );
}
