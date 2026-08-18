'use client';

import { CairnPopover, CairnSpotlight } from 'cairn-ui';
import { useFlow } from 'cairn-react';
import type { DemoMeta } from './demoFlow';
import { demoHost } from './demoHost';

export default function DemoOverlay() {
  const { state, reset, start } = useFlow();

  return (
    <>
      <CairnSpotlight padding={6} radius={8} overlayColor="rgba(0, 0, 0, 0.45)" />
      <CairnPopover
        placement="top"
        trapFocus={false}
        dismissOnInteractOutside={false}
        className="demo-popover"
      >
        {step => {
          const meta = step.meta as DemoMeta | undefined;
          return (
            <>
              <p className="demo-popover__title">{meta?.title ?? step.id}</p>
              <p className="demo-popover__step">
                {state.stepIndex + 1} / {state.totalSteps}
              </p>
            </>
          );
        }}
      </CairnPopover>
      {state.status === 'completed' ? (
        <div className="demo-hud">
          <div className="demo-hud__copy">
            <p className="demo-hud__caption">That’s every feature in this window.</p>
          </div>
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
        </div>
      ) : null}
    </>
  );
}
