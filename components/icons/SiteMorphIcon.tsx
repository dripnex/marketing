'use client';

import { MorphIcon, type MorphIconProps } from 'morphicons/react';

/** MorphIcon that honors prefers-reduced-motion (instant swap). */
export function SiteMorphIcon({
  reducedMotion = 'user',
  spring = 'smooth',
  strokeWidth = 1.5,
  ...props
}: MorphIconProps) {
  return (
    <MorphIcon reducedMotion={reducedMotion} spring={spring} strokeWidth={strokeWidth} {...props} />
  );
}
