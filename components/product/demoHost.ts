import type { EditorView } from '@codemirror/view';
import { filterSlashItems, matchSlashLine } from '@/lib/markdown/slash';
import type { EditorMode, FeatureId } from './scenes';
import type { DemoAction, DemoSlide } from './demoSlides';

export const demoHost = {
  getView: (): EditorView | null => null,
  applyFeature: (_id: FeatureId) => {},
  resetNotes: () => {},
  setMode: (_mode: EditorMode) => {},
  setOutline: (_open: boolean) => {},
  jumpToLine: (_line: number) => {},
  checkNextTask: () => {},
  announceStep: (_id: FeatureId) => {},
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
  const delay = prefersReducedMotion() ? 0 : 62;
  for (const char of text) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const pos = view.state.selection.main.head;
    view.dispatch({
      changes: { from: pos, insert: char },
      selection: { anchor: pos + char.length },
      scrollIntoView: true,
    });
    await wait(char === '\n' ? delay * 3.2 : delay, signal);
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
  for (let i = 0; i < 30; i++) {
    const view = demoHost.getView();
    if (view) return view;
    await wait(60, signal);
  }
  return demoHost.getView();
}

async function runAction(action: DemoAction, signal: AbortSignal) {
  switch (action.type) {
    case 'wait':
      await wait(action.ms, signal);
      return;
    case 'type': {
      const view = demoHost.getView();
      if (view) await typeInto(view, action.text, signal);
      return;
    }
    case 'slash': {
      const view = demoHost.getView();
      if (view) applySlashAtCursor(view);
      return;
    }
    case 'mode':
      demoHost.setMode(action.mode);
      await wait(450, signal);
      return;
    case 'outline':
      demoHost.setOutline(action.open);
      await wait(350, signal);
      return;
    case 'jump':
      demoHost.jumpToLine(action.line);
      return;
    case 'check':
      demoHost.checkNextTask();
      return;
  }
}

export async function runDemoSlide(slide: DemoSlide, signal: AbortSignal): Promise<void> {
  demoHost.announceStep(slide.id);
  demoHost.applyFeature(slide.id);
  const needsEditor = slide.actions.some(action => action.type === 'type' || action.type === 'slash');
  if (needsEditor) {
    await waitForView(signal);
  } else {
    await wait(400, signal);
  }
  if (signal.aborted) return;

  const view = demoHost.getView();
  if (view) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: slide.seed },
      selection: { anchor: slide.seed.length },
    });
  }

  for (const action of slide.actions) {
    if (signal.aborted) return;
    await runAction(action, signal);
  }
}
