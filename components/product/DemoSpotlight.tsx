'use client';

import type { CSSProperties } from 'react';
import { useFlow } from 'cairn-react';
import { useElementRect, useTargetElement } from 'cairn-ui';

const PAD = 8;

export default function DemoSpotlight() {
  const { state } = useFlow();
  const selector = typeof state.currentStep?.meta?.target === 'string' ? state.currentStep.meta.target : null;
  const target = useTargetElement(selector);
  const rect = useElementRect(target);

  if (state.status !== 'active' || !rect) return null;

  const top = Math.max(0, rect.top - PAD);
  const left = Math.max(0, rect.left - PAD);
  const width = rect.width + PAD * 2;
  const height = rect.height + PAD * 2;
  const bottom = top + height;
  const right = left + width;

  const pane: CSSProperties = {
    position: 'fixed',
    zIndex: 14,
    pointerEvents: 'none',
    background: 'rgba(6, 7, 8, 0.42)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  return (
    <div aria-hidden="true">
      <div style={{ ...pane, top: 0, left: 0, right: 0, height: top }} />
      <div style={{ ...pane, top: bottom, left: 0, right: 0, bottom: 0 }} />
      <div style={{ ...pane, top, left: 0, width: left, height }} />
      <div style={{ ...pane, top, left: right, right: 0, height }} />
      <div
        style={{
          position: 'fixed',
          top,
          left,
          width,
          height,
          zIndex: 15,
          pointerEvents: 'none',
          borderRadius: 10,
          boxShadow: '0 0 0 1px rgba(94, 234, 212, 0.35)',
        }}
      />
    </div>
  );
}
