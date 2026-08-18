import type { ReactNode } from 'react';

export default function TryLayout({ children }: { children: ReactNode }) {
  return <div className="h-dvh bg-[#0a0b0d]">{children}</div>;
}
