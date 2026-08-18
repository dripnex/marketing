export type DemoNotebook = 'work' | 'personal';
export type EditorMode = 'editor' | 'split' | 'preview';
export type FeatureId = 'write' | 'outline' | 'alerts' | 'tasks' | 'mermaid' | 'notebooks';

export type NoteStatus = 'active' | 'on_hold' | 'completed' | 'dropped';

export interface DemoNote {
  id: string;
  title: string;
  notebook: DemoNotebook;
  updated: string;
  status: NoteStatus;
  tags: string[];
  content: string;
}

export interface FeatureScene {
  id: FeatureId;
  label: string;
  hint: string;
  noteId: string;
  mode: EditorMode;
  outline: boolean;
}

export const features: FeatureScene[] = [
  {
    id: 'write',
    label: 'Slash',
    hint: 'Type / on an empty line. Same slash table as the desktop app.',
    noteId: 'welcome',
    mode: 'editor',
    outline: false,
  },
  {
    id: 'outline',
    label: 'Outline',
    hint: 'Headings come from the file. Click one to jump.',
    noteId: 'outline',
    mode: 'editor',
    outline: true,
  },
  {
    id: 'alerts',
    label: 'Alerts',
    hint: 'GitHub alerts are Markdown. Preview renders them.',
    noteId: 'alerts',
    mode: 'editor',
    outline: false,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    hint: 'Check a box — it writes `- [x]` back into the file.',
    noteId: 'tasks',
    mode: 'split',
    outline: false,
  },
  {
    id: 'mermaid',
    label: 'Mermaid',
    hint: 'A mermaid fence is the diagram — not a screenshot.',
    noteId: 'mermaid',
    mode: 'editor',
    outline: false,
  },
  {
    id: 'notebooks',
    label: 'Notebooks',
    hint: 'A note lives in one notebook. Filter the list.',
    noteId: 'search',
    mode: 'preview',
    outline: false,
  },
];

export const notebooks: { id: DemoNotebook | 'all'; label: string }[] = [
  { id: 'all', label: 'All Notes' },
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
];

export const seedNotes: DemoNote[] = [
  {
    id: 'welcome',
    title: 'Welcome',
    notebook: 'personal',
    updated: 'just now',
    status: 'active',
    tags: ['welcome'],
    content: `# Welcome

This is the same Markdown editor. Type \`/\` on the next line.

`,
  },
  {
    id: 'outline',
    title: 'How a release goes out',
    notebook: 'work',
    updated: '2d ago',
    status: 'active',
    tags: ['release', 'ship'],
    content: `# How a release goes out

Writing this down because I re-derive it every time.

## Land

Work lands on \`develop\`. Feature PRs never target staging or main.

## Promote

Promote with a merge commit, never squash. Squashing detaches the branches.

## Tag

The signed build comes from the tag. The notes stay \`.md\` either way.

## After

- Write What’s New before the promotion PR
- Desktop is the product
- This site is a window onto the same Markdown
`,
  },
  {
    id: 'alerts',
    title: 'Review notes',
    notebook: 'work',
    updated: '3d ago',
    status: 'on_hold',
    tags: ['review'],
    content: `# Review notes

> [!NOTE]
> Slash inserts these. They are GitHub-flavored Markdown, not a custom format.

> [!TIP]
> Select a heading in the outline to jump. The file is the source of truth.

> [!WARNING]
> Do not invent a format that only we can read.

> [!CAUTION]
> Sync is optional. Without a passphrase nothing is uploaded.
`,
  },
  {
    id: 'tasks',
    title: 'Tuesday',
    notebook: 'personal',
    updated: '5d ago',
    status: 'active',
    tags: ['daily'],
    content: `# Tuesday

Local files. Standard Markdown.

- [x] Write the note
- [x] Leave it on disk
- [ ] Download the app
- [ ] Set up a passphrase if you want sync

If the app disappears, the files do not.
`,
  },
  {
    id: 'mermaid',
    title: 'Note path',
    notebook: 'work',
    updated: '1d ago',
    status: 'active',
    tags: ['architecture'],
    content: `# Note path

The file is the source of truth. SQLite is an index.

\`\`\`mermaid
flowchart LR
  disk[".md on disk"] --> editor[Editor]
  editor --> disk
  disk --> index[SQLite]
  index --> search[Search]
\`\`\`

Rebuild the index from the files. Never the other way around.
`,
  },
  {
    id: 'search',
    title: 'Local search notes',
    notebook: 'work',
    updated: '1w ago',
    status: 'completed',
    tags: ['search', 'sqlite'],
    content: `# Local search notes

SQLite is an index, not the source of truth.

If the database goes away, rebuild it from the files.
Do not invent a format that only we can read.

See [[How a release goes out]] for the ship path.
`,
  },
];
