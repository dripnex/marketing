import type { EditorMode, FeatureId } from './scenes';

export interface DemoSlide {
  id: FeatureId;
  caption: string;
  seed: string;
  /** Typed after seed. `/` on an empty line opens the real slash menu. */
  type: string;
  applySlash?: boolean;
  after?: string;
  mode: EditorMode;
  outline: boolean;
  hold: number;
}

export const demoSlides: DemoSlide[] = [
  {
    id: 'write',
    caption: 'Type / on an empty line.',
    seed: '# Welcome\n\n',
    type: '/h2',
    applySlash: true,
    after: 'Slash commands\n\nSame table as the desktop app.\n',
    mode: 'editor',
    outline: false,
    hold: 1200,
  },
  {
    id: 'outline',
    caption: 'Headings become the outline.',
    seed: `# How a release goes out

Writing this down because I re-derive it every time.

## Land

Work lands on \`develop\`.

## Promote

Promote with a merge commit, never squash.

`,
    type: '## Tag\n\nThe signed build comes from the tag.\n',
    mode: 'editor',
    outline: true,
    hold: 1400,
  },
  {
    id: 'alerts',
    caption: 'GitHub alerts are just Markdown.',
    seed: '# Review notes\n\n',
    type: `> [!NOTE]
> Slash inserts these. They stay in the file.

> [!WARNING]
> Do not invent a format that only we can read.
`,
    mode: 'split',
    outline: false,
    hold: 1600,
  },
  {
    id: 'tasks',
    caption: 'A checkbox writes `- [x]` back into the file.',
    seed: `# Tuesday

Local files. Standard Markdown.

- [x] Write the note
- [ ] Download the app
`,
    type: '- [ ] Set up a passphrase if you want sync\n',
    mode: 'split',
    outline: false,
    hold: 1400,
  },
  {
    id: 'mermaid',
    caption: 'A mermaid fence is the diagram.',
    seed: `# Note path

The file is the source of truth.

`,
    type: `\`\`\`mermaid
flowchart LR
  file[".md on disk"] --> editor[Editor]
  editor --> file
\`\`\`
`,
    mode: 'split',
    outline: false,
    hold: 2000,
  },
  {
    id: 'notebooks',
    caption: 'A note lives in one notebook.',
    seed: `# Local search notes

SQLite is an index, not the source of truth.

See [[How a release goes out]] for the ship path.
`,
    type: '',
    mode: 'preview',
    outline: false,
    hold: 1600,
  },
];
