import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductPlayground from '@/components/product/ProductPlayground';

export const metadata: Metadata = {
  title: 'Try Dripnex',
  description:
    'The Dripnex editor, in the browser. GitHub Flavored Markdown. Download to keep files on disk.',
};

export default function TryPage() {
  return (
    <Suspense fallback={<div className="h-dvh bg-[#0a0b0d]" />}>
      <ProductPlayground fill />
    </Suspense>
  );
}
