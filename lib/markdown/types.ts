export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface MarkdownHeading {
  level: HeadingLevel;
  text: string;
  line: number;
  slug: string;
}

export interface MarkdownScan {
  headings: MarkdownHeading[];
  tasks: { total: number; completed: number };
}
