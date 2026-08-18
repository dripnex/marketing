'use client';

import { useFlow } from 'cairn-react';
import { demoHost } from './demoHost';

export default function DemoOverlay() {
  const { state, reset, start } = useFlow();
  const active = state.status === 'active';
  const done = state.status === 'completed';
  if (!active && !done) return null;

  const title =
    done
      ? 'That’s every feature in this window.'
      : String(state.currentStep?.meta?.title ?? '');

  return (
    <div className="demo-hud" onPointerDown={event => event.stopPropagation()}>
      <div className="demo-hud__copy">
        <p className="demo-hud__caption">{title}</p>
        <p className="demo-hud__dots" aria-hidden="true">
          {Array.from({ length: state.totalSteps }, (_, index) => (
            <span key={index} data-on={active && index === state.stepIndex} />
          ))}
        </p>
      </div>
      {done ? (
        <button
          type="button"
          className="demo-hud__retry"
          onClick={() => {
            demoHost.resetNotes();
            reset();
            start();
          }}
        >
          Retry
        </button>
      ) : (
        <span className="demo-hud__step">
          {state.stepIndex + 1} / {state.totalSteps}
        </span>
      )}
    </div>
  );
}
