import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { EditorView } from '@codemirror/view';
import { filterSlashItems, matchSlashLine } from '@/lib/markdown/slash';
import { demoSlides } from './demoSlides';
import { seedNotes, type DemoNote, type FeatureId } from './scenes';

function wait(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

async function typeInto(view: EditorView, text: string, cancelled: () => boolean) {
  const delay = prefersReducedMotion() ? 0 : 28;
  for (const char of text) {
    if (cancelled()) return;
    const pos = view.state.selection.main.head;
    view.dispatch({
      changes: { from: pos, insert: char },
      selection: { anchor: pos + char.length },
      scrollIntoView: true,
    });
    await wait(char === '\n' ? delay * 3 : delay);
  }
}

function applySlashAtCursor(view: EditorView) {
  const pos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(pos);
  const prefix = line.text.slice(0, pos - line.from);
  const match = matchSlashLine(prefix);
  if (!match) return;
  const item = filterSlashItems(match.query)[0];
  if (!item) return;
  const from = line.from + match.fromCol;
  view.dispatch({
    changes: { from, to: pos, insert: item.snippet },
    selection: { anchor: from + item.cursor },
    scrollIntoView: true,
  });
}

export type TourStatus = 'idle' | 'running' | 'done';

export function useDemoTour({
  enabled,
  view,
  applyFeature,
  setNotes,
}: {
  enabled: boolean;
  view: EditorView | null;
  applyFeature: (id: FeatureId) => void;
  setNotes: Dispatch<SetStateAction<DemoNote[]>>;
}) {
  const [status, setStatus] = useState<TourStatus>('idle');
  const [slide, setSlide] = useState(0);
  const cancelled = useRef(false);
  const viewRef = useRef(view);
  viewRef.current = view;
  const applyRef = useRef(applyFeature);
  applyRef.current = applyFeature;
  const runId = useRef(0);

  const stop = useCallback(() => {
    cancelled.current = true;
    runId.current += 1;
    setStatus(current => (current === 'running' ? 'idle' : current));
  }, []);

  const start = useCallback(() => {
    cancelled.current = false;
    const id = ++runId.current;
    setStatus('running');
    setSlide(0);
    setNotes(seedNotes.map(note => ({ ...note })));

    void (async () => {
      for (let i = 0; i < demoSlides.length; i++) {
        if (cancelled.current || runId.current !== id) return;
        const next = demoSlides[i]!;
        setSlide(i);
        applyRef.current(next.id);
        let editor = viewRef.current;
        for (let n = 0; n < 20 && !editor; n++) {
          await wait(50);
          editor = viewRef.current;
        }
        if (cancelled.current || runId.current !== id) return;
        if (editor) {
          editor.dispatch({
            changes: { from: 0, to: editor.state.doc.length, insert: next.seed },
            selection: { anchor: next.seed.length },
          });
          if (next.type) await typeInto(editor, next.type, () => cancelled.current || runId.current !== id);
          if (next.applySlash) {
            await wait(380);
            if (cancelled.current || runId.current !== id) return;
            applySlashAtCursor(editor);
            await wait(280);
          }
          if (next.after) await typeInto(editor, next.after, () => cancelled.current || runId.current !== id);
        }

        await wait(next.hold);
      }
      if (cancelled.current || runId.current !== id) return;
      setStatus('done');
    })();
  }, [setNotes]);

  useEffect(() => {
    if (!enabled) return;
    start();
    return () => {
      cancelled.current = true;
    };
  }, [enabled, start]);

  return {
    status,
    slide,
    caption: demoSlides[slide]?.caption ?? '',
    total: demoSlides.length,
    start,
    stop,
  };
}
