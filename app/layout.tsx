import './globals.css';
import '@fontsource-variable/source-serif-4/wght.css';
import '@fontsource-variable/source-sans-3/wght.css';
import '@fontsource-variable/jetbrains-mono';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Dripnex — Your Markdown, on your machine.',
    template: '%s | Dripnex',
  },
  description:
    'A desktop editor for GitHub Flavored Markdown on your machine. Local-first, offline by default.',
  applicationName: 'Dripnex',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Dripnex',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Dripnex' }],
  },
  twitter: {
    card: 'summary',
    images: ['/icon.png'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className="bg-background text-text-primary antialiased">{children}</body>
    </html>
  );
}
