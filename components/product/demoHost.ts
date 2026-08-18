import type { EditorView } from '@codemirror/view';
import { filterSlashItems, matchSlashLine } from '@/lib/markdown/slash';
import type { FeatureId } from './scenes';
import type { DemoSlide } from './demoSlides';

export const demoHost = {
  getView: (): EditorView | null => null,
  applyFeature: (_id: FeatureId) => {},
  resetNotes: () => {},
};

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const id = window.setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

async function typeInto(view: EditorView, text: string, signal: AbortSignal) {
  const delay = prefersReducedMotion() ? 0 : 28;
  for (const char of text) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const pos = view.state.selection.main.head;
    view.dispatch({
      changes: { from: pos, insert: char },
      selection: { anchor: pos + char.length },
      scrollIntoView: true,
    });
    await wait(char === '\n' ? delay * 3 : delay, signal);
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

async function waitForView(signal: AbortSignal): Promise<EditorView | null> {
  for (let i = 0; i < 24; i++) {
    const view = demoHost.getView();
    if (view) return view;
    await wait(50, signal);
  }
  return demoHost.getView();
}

export async function runDemoSlide(slide: DemoSlide, signal: AbortSignal): Promise<void> {
  demoHost.applyFeature(slide.id);
  const view = await waitForView(signal);
  if (signal.aborted) return;
  if (!view) return;

  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: slide.seed },
    selection: { anchor: slide.seed.length },
  });
  if (slide.type) await typeInto(view, slide.type, signal);
  if (slide.applySlash) {
    await wait(380, signal);
    applySlashAtCursor(view);
    await wait(280, signal);
  }
  if (slide.after) await typeInto(view, slide.after, signal);
  await wait(slide.hold, signal);
}
