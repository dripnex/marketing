'use client';

import { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, highlightActiveLine, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting, defaultHighlightStyle, indentOnInput } from '@codemirror/language';
import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete';
import { filterFenceLanguages, filterSlashItems, matchFenceLang, matchSlashLine } from '@/lib/markdown/slash';

function isInsideFence(context: CompletionContext): boolean {
  const textBefore = context.state.doc.sliceString(0, context.pos);
  const fences = textBefore.match(/^```/gm) ?? [];
  return fences.length % 2 === 1;
}

function slashCompletions(context: CompletionContext): CompletionResult | null {
  if (isInsideFence(context)) return null;
  const line = context.state.doc.lineAt(context.pos);
  const prefix = line.text.slice(0, context.pos - line.from);
  const match = matchSlashLine(prefix);
  if (!match) return null;
  const items = filterSlashItems(match.query);
  if (items.length === 0) return null;
  const from = line.from + match.fromCol;
  return {
    from,
    to: context.pos,
    filter: false,
    options: items.map(item => ({
      label: item.label,
      detail: item.detail,
      section: item.section,
      type: 'keyword' as const,
      apply: (view: EditorView, _c: unknown, applyFrom: number, applyTo: number) => {
        view.dispatch({
          changes: { from: applyFrom, to: applyTo, insert: item.snippet },
          selection: { anchor: applyFrom + item.cursor },
        });
      },
    })),
  };
}

function fenceLanguageCompletions(context: CompletionContext): CompletionResult | null {
  const line = context.state.doc.lineAt(context.pos);
  const prefix = line.text.slice(0, context.pos - line.from);
  const match = matchFenceLang(prefix);
  if (!match) return null;
  const langs = filterFenceLanguages(match.query);
  if (langs.length === 0) return null;
  return {
    from: line.from + match.fromCol,
    to: context.pos,
    filter: false,
    options: langs.map(lang => ({ label: lang, type: 'keyword' as const, apply: lang })),
  };
}

const theme = EditorView.theme(
  {
    '&': {
      height: '100%',
      backgroundColor: 'transparent',
      color: 'var(--cm-text)',
      fontSize: '14px',
    },
    '.cm-content': {
      fontFamily: 'var(--font-mono)',
      padding: '12px 16px',
      lineHeight: '1.65',
      caretColor: 'var(--cm-cursor)',
    },
    '.cm-cursor': { borderLeftColor: 'var(--cm-cursor)', borderLeftWidth: '2px' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
      backgroundColor: 'var(--cm-selection)',
    },
    '.cm-activeLine': { backgroundColor: 'var(--cm-active-line)' },
    '.cm-gutters': { display: 'none' },
    '.cm-scroller': { overflow: 'auto', fontFamily: 'var(--font-mono)' },
    '.cm-tooltip-autocomplete': {
      backgroundColor: 'var(--cm-tooltip-bg)',
      border: '1px solid var(--cm-tooltip-border)',
      borderRadius: '8px',
      overflow: 'hidden',
    },
    '.cm-tooltip-autocomplete ul': { fontFamily: 'var(--font-sans)', fontSize: '13px' },
    '.cm-tooltip-autocomplete li': { padding: '4px 10px' },
    '.cm-tooltip-autocomplete li[aria-selected]': { backgroundColor: 'var(--bg-hover)' },
    '.cm-completionDetail': { color: 'var(--text-faint)', marginLeft: '8px' },
  },
  { dark: true },
);

interface Props {
  noteId: string;
  value: string;
  onChange: (value: string) => void;
  jumpToLine: number | null;
}

export default function CodeMirrorEditor({ noteId, value, onChange, jumpToLine }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!parentRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        history(),
        drawSelection(),
        highlightActiveLine(),
        indentOnInput(),
        markdown(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        autocompletion({ override: [slashCompletions, fenceLanguageCompletions] }),
        keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
        theme,
        EditorView.lineWrapping,
        EditorView.updateListener.of(update => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
      ],
    });
    const view = new EditorView({ state, parent: parentRef.current });
    viewRef.current = view;
    view.focus();
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Recreate only when switching notes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || jumpToLine == null) return;
    const line = view.state.doc.line(Math.min(jumpToLine, view.state.doc.lines));
    view.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: 'start' }),
    });
    view.focus();
  }, [jumpToLine]);

  return <div ref={parentRef} style={{ height: '100%', minHeight: 0 }} />;
}
