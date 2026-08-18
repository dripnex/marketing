'use client';

import type { ComponentProps } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import MermaidBlock from './MermaidBlock';

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'mark'],
  attributes: {
    ...defaultSchema.attributes,
    div: [...((defaultSchema.attributes?.div ?? []) as string[]), 'className', 'class'],
    a: [...((defaultSchema.attributes?.a ?? []) as string[]), 'href'],
    input: ['type', 'checked', 'disabled'],
  },
};

function toggleTaskAt(content: string, index: number): string {
  let seen = -1;
  return content
    .split('\n')
    .map(line => {
      if (!/^[ \t]*[-*]\s+\[[ xX]\]/.test(line)) return line;
      seen += 1;
      if (seen !== index) return line;
      return line.replace(/\[[ xX]\]/, match => (match === '[ ]' ? '[x]' : '[ ]'));
    })
    .join('\n');
}

/** Turn `[[Title]]` into markdown links. Demo notes have no fences around wikilinks. */
function linkWikilinks(source: string): string {
  return source.replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g, (_all, target: string, label?: string) => {
    const t = target.trim();
    const l = (label ?? t).trim();
    return `[${l}](#wiki:${encodeURIComponent(t)})`;
  });
}

interface Props {
  content: string;
  notesByTitle: Map<string, string>;
  onOpenNote: (id: string) => void;
  onChange: (content: string) => void;
}

export default function MarkdownView({ content, notesByTitle, onOpenNote, onChange }: Props) {
  let taskIndex = -1;

  const components: ComponentProps<typeof Markdown>['components'] = {
    code({ className, children }) {
      const text = String(children).replace(/\n$/, '');
      const lang = /language-(\w+)/.exec(className ?? '')?.[1];
      if (lang === 'mermaid') return <MermaidBlock source={text} />;
      return <code className={className}>{text}</code>;
    },
    pre({ children }) {
      return <pre className="gh-code">{children}</pre>;
    },
    input({ type, checked }) {
      if (type !== 'checkbox') return <input type={type} checked={checked} readOnly />;
      taskIndex += 1;
      const index = taskIndex;
      return (
        <input
          type="checkbox"
          checked={Boolean(checked)}
          onChange={() => onChange(toggleTaskAt(content, index))}
        />
      );
    },
    a({ href, children }) {
      if (href?.startsWith('#wiki:')) {
        const title = decodeURIComponent(href.slice(6));
        const id = notesByTitle.get(title.toLowerCase());
        if (!id) return <span>{children}</span>;
        return (
          <button type="button" className="wiki" onClick={() => onOpenNote(id)}>
            {children}
          </button>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  };

  return (
    <div className="md-preview">
      <Markdown
        remarkPlugins={[remarkGfm, remarkGithubAlerts]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={components}
      >
        {linkWikilinks(content)}
      </Markdown>
    </div>
  );
}

function remarkGithubAlerts() {
  return (tree: { children?: unknown[] }) => {
    const visit = (node: {
      type?: string;
      children?: unknown[];
      data?: Record<string, unknown>;
    }) => {
      if (node.type === 'blockquote' && Array.isArray(node.children)) {
        const first = node.children[0] as { children?: { value?: string }[] } | undefined;
        const raw = first?.children?.[0]?.value ?? '';
        const match = raw.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/i);
        if (match) {
          const kind = match[1]!.toLowerCase();
          const rest = match[2] ?? '';
          node.data = {
            ...node.data,
            hName: 'div',
            hProperties: { className: `gh-alert gh-alert-${kind}` },
          };
          if (first?.children?.[0]) first.children[0].value = rest;
        }
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) visit(child as typeof node);
      }
    };
    visit(tree);
  };
}
