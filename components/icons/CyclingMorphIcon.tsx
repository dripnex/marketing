'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import type { IconInput } from 'morphicons/react';
import { SiteMorphIcon } from './SiteMorphIcon';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

type Props = {
  from: IconInput;
  to: IconInput;
  intervalMs?: number;
  delayMs?: number;
} & Omit<ComponentProps<typeof SiteMorphIcon>, 'icon'>;

export function CyclingMorphIcon({
  from,
  to,
  intervalMs = 3200,
  delayMs = 0,
  ...rest
}: Props) {
  const reduce = usePrefersReducedMotion();
  const [alt, setAlt] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => setAlt(value => !value), intervalMs);
    }, delayMs);
    return () => {
      window.clearTimeout(start);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [reduce, intervalMs, delayMs]);

  return (
    <span
      className="inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SiteMorphIcon icon={hovered || alt ? to : from} {...rest} />
    </span>
  );
}
