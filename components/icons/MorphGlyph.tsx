'use client';

import { useState } from 'react';
import { MorphIcon, type IconInput } from 'morphicons/react';

/**
 * Marketing-only morphicon. Hover or `engaged` swaps Lucide data through
 * morphicons. `reducedMotion="user"` keeps a static frame when the OS asks
 * for reduced motion — no animation, no extra chrome.
 */
export function MorphGlyph({
  rest,
  active,
  engaged = false,
  size = 16,
  strokeWidth = 1.75,
  className,
}: {
  rest: IconInput;
  active: IconInput;
  engaged?: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className={className}
      aria-hidden="true"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MorphIcon
        icon={engaged || hovered ? active : rest}
        size={size}
        strokeWidth={strokeWidth}
        reducedMotion="user"
        spring="smooth"
      />
    </span>
  );
}

export function MorphNavIcon({
  rest,
  active,
  engaged = false,
  size = 14,
}: {
  rest: IconInput;
  active: IconInput;
  engaged?: boolean;
  size?: number;
}) {
  return (
    <MorphIcon
      icon={engaged ? active : rest}
      size={size}
      strokeWidth={1.75}
      reducedMotion="user"
      spring="smooth"
    />
  );
}
