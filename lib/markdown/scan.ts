import type { HeadingLevel, MarkdownHeading, MarkdownScan } from './types';

export type { MarkdownHeading };

const FENCE = /^(\s{0,3})(`{3,}|~{3,})/;
const ATX = /^(#{1,6})[ \t]+(.+?)(?:[ \t]+#+[ \t]*)?$/;
const TASK = /^[ \t]*[-*]\s+\[(.)\]/;

export function headingToSlug(heading: string): string {
  return heading
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Same fence-aware walk as @dripnex/markdown — headings + GFM tasks. */
export function scanMarkdown(content: string): MarkdownScan {
  const headings: MarkdownHeading[] = [];
  let tasksTotal = 0;
  let tasksDone = 0;
  const lines = content.split(/\r?\n/);
  let fence: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const fenceMatch = line.match(FENCE);
    if (fenceMatch) {
      const marker = fenceMatch[2] ?? '';
      if (!fence) {
        fence = marker;
        continue;
      }
      if (marker[0] === fence[0] && marker.length >= fence.length) {
        fence = null;
      }
      continue;
    }
    if (fence) continue;

    const atx = line.match(ATX);
    if (atx) {
      const text = (atx[2] ?? '').trim();
      if (text) {
        const level = (atx[1] ?? '#').length as HeadingLevel;
        headings.push({ level, text, line: i + 1, slug: headingToSlug(text) });
      }
    }

    const task = line.match(TASK);
    if (task) {
      tasksTotal += 1;
      if (task[1] === 'x' || task[1] === 'X') tasksDone += 1;
    }
  }

  return { headings, tasks: { total: tasksTotal, completed: tasksDone } };
}
