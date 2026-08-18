'use client';

import { useEffect, useId, useState } from 'react';

export default function MermaidBlock({ source }: { source: string }) {
  const reactId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSvg(null);
    setError(null);
    void import('mermaid').then(mod => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'strict',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      });
      return mermaid.render(`dripnex-mmd-${reactId}`, source);
    }).then(result => {
      if (!cancelled) setSvg(result.svg);
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof Error ? err.message : 'Invalid mermaid syntax');
    });
    return () => {
      cancelled = true;
    };
  }, [reactId, source]);

  if (error) {
    return (
      <pre className="gh-code">
        <code>{source}</code>
        {'\n'}
        <span style={{ color: '#f87171' }}>{error}</span>
      </pre>
    );
  }
  if (!svg) {
    return <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Rendering diagram…</p>;
  }
  return <div className="mermaid-wrap" dangerouslySetInnerHTML={{ __html: svg }} />;
}
