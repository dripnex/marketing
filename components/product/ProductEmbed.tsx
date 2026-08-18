'use client';

import { useState } from 'react';
import { features, type FeatureId } from './scenes';

export default function ProductEmbed() {
  const [feature, setFeature] = useState<FeatureId>('write');
  const current = features.find(item => item.id === feature) ?? features[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Try a feature">
          {features.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={feature === item.id}
              onClick={() => setFeature(item.id)}
              className={`rounded-md px-2.5 py-1 text-[13px] transition-colors ${
                feature === item.id
                  ? 'bg-white/[0.08] text-text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <a
          href={`/try?f=${feature}`}
          className="text-[12px] text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
        >
          Open full window
        </a>
      </div>
      <p className="mt-3 mb-4 max-w-[48ch] text-[13px] leading-relaxed text-text-muted">
        {current.hint}
      </p>
      <div className="overflow-hidden rounded-[10px] border border-white/[0.08] shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)]">
        <iframe
          title="Dripnex"
          src={`/try?f=${feature}`}
          className="block h-[min(72vh,680px)] min-h-[520px] w-full bg-[#0a0b0d]"
        />
      </div>
    </div>
  );
}
