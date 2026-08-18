import { defineFlow } from 'cairn-react';
import { demoSlides } from './demoSlides';
import { runDemoSlide } from './demoHost';

export type DemoMeta = {
  target: string;
  title: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
};

const targets: Record<string, DemoMeta['target']> = {
  write: '[data-demo="editor"]',
  outline: '[data-demo="outline"]',
  alerts: '[data-demo="preview"]',
  tasks: '[data-demo="preview"]',
  mermaid: '[data-demo="preview"]',
  notebooks: '[data-demo="list"]',
};

const placements: Record<string, DemoMeta['placement']> = {
  write: 'top',
  outline: 'left',
  alerts: 'left',
  tasks: 'left',
  mermaid: 'left',
  notebooks: 'right',
};

export const dripnexDemoFlow = defineFlow({
  id: 'dripnex-editor-demo',
  steps: demoSlides.map((slide, index, all) => ({
    id: slide.id,
    next: all[index + 1]?.id ?? null,
    meta: {
      target: targets[slide.id] ?? '[data-demo="editor"]',
      title: slide.caption,
      placement: placements[slide.id] ?? 'top',
    } satisfies DemoMeta,
    run: async (_ctx, signal) => {
      try {
        await runDemoSlide(slide, signal);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        throw error;
      }
    },
  })),
});
