import type { EditorMode, FeatureId } from './scenes';

export type DemoAction =
  | { type: 'wait'; ms: number }
  | { type: 'type'; text: string }
  | { type: 'slash' }
  | { type: 'mode'; mode: EditorMode }
  | { type: 'outline'; open: boolean }
  | { type: 'jump'; line: number }
  | { type: 'check' };

export interface DemoSlide {
  id: FeatureId;
  caption: string;
  seed: string;
  actions: DemoAction[];
}

export const demoSlides: DemoSlide[] = [
  {
    id: 'write',
    caption: 'Type / on an empty line. Same slash table as the app.',
    seed: '# Welcome\n\n',
    actions: [
      { type: 'wait', ms: 900 },
      { type: 'type', text: '/h2' },
      { type: 'wait', ms: 1100 },
      { type: 'slash' },
      { type: 'wait', ms: 500 },
      { type: 'type', text: 'Slash commands\n\n' },
      { type: 'type', text: '/task' },
      { type: 'wait', ms: 1000 },
      { type: 'slash' },
      { type: 'type', text: 'Keep the note as a file\n' },
      { type: 'wait', ms: 3200 },
    ],
  },
  {
    id: 'outline',
    caption: 'Headings become the outline. Click one to jump.',
    seed: `# How a release goes out

Writing this down because I re-derive it every time.

## Land

Work lands on \`develop\`.

## Promote

Promote with a merge commit, never squash.

`,
    actions: [
      { type: 'outline', open: true },
      { type: 'wait', ms: 800 },
      { type: 'type', text: '## Tag\n\nThe signed build comes from the tag.\n' },
      { type: 'wait', ms: 700 },
      { type: 'jump', line: 5 },
      { type: 'wait', ms: 3600 },
    ],
  },
  {
    id: 'alerts',
    caption: 'GitHub alerts stay in the Markdown. Preview renders them.',
    seed: '# Review notes\n\n',
    actions: [
      { type: 'mode', mode: 'editor' },
      { type: 'wait', ms: 600 },
      { type: 'type', text: '/note' },
      { type: 'wait', ms: 1000 },
      { type: 'slash' },
      { type: 'type', text: 'Slash inserts these. They stay in the file.\n\n' },
      { type: 'type', text: '/warn' },
      { type: 'wait', ms: 1000 },
      { type: 'slash' },
      { type: 'type', text: 'Do not invent a format that only we can read.\n' },
      { type: 'wait', ms: 700 },
      { type: 'mode', mode: 'split' },
      { type: 'wait', ms: 4000 },
    ],
  },
  {
    id: 'tasks',
    caption: 'A checkbox writes `- [x]` back into the file.',
    seed: `# Tuesday

Local files. Standard Markdown.

- [x] Write the note
- [ ] Download the app
`,
    actions: [
      { type: 'mode', mode: 'split' },
      { type: 'wait', ms: 700 },
      { type: 'type', text: '- [ ] Set up a passphrase if you want sync\n' },
      { type: 'wait', ms: 900 },
      { type: 'check' },
      { type: 'wait', ms: 3800 },
    ],
  },
  {
    id: 'mermaid',
    caption: 'A mermaid fence is the diagram — not a screenshot.',
    seed: `# Note path

The file is the source of truth.

`,
    actions: [
      { type: 'mode', mode: 'editor' },
      { type: 'wait', ms: 700 },
      { type: 'type', text: '```mermaid\n' },
      { type: 'wait', ms: 400 },
      {
        type: 'type',
        text: `flowchart LR
  disk[".md on disk"] --> editor[Editor]
  editor --> disk
  disk --> index[SQLite]
  index --> search[Search]
`,
      },
      { type: 'type', text: '```\n' },
      { type: 'wait', ms: 800 },
      { type: 'mode', mode: 'split' },
      { type: 'wait', ms: 4800 },
    ],
  },
  {
    id: 'notebooks',
    caption: 'A note lives in one notebook. Wikilinks open another note.',
    seed: `# Local search notes

SQLite is an index, not the source of truth.

If the database goes away, rebuild it from the files.

See [[How a release goes out]] for the ship path.
`,
    actions: [
      { type: 'mode', mode: 'preview' },
      { type: 'wait', ms: 4200 },
    ],
  },
];
