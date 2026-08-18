'use client';

import { MeshGradient } from '@paper-design/shaders-react';

export default function AnimatedBackdrop() {
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <MeshGradient
        colors={['#07080a', '#0d1a18', '#12110e', '#0a0b0d']}
        distortion={0.42}
        swirl={0.2}
        speed={reduceMotion ? 0 : 0.12}
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute inset-0 bg-[#0a0b0d]/50" />
    </div>
  );
}
