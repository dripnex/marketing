'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  BookOpen,
  CircleDollarSign,
  Download,
  FileText,
  HardDrive,
  LogIn,
  Menu,
  Package,
  PenLine,
  Puzzle,
  SquarePen,
  User,
  Wallet,
  X,
} from 'lucide';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SiteMorphIcon } from '@/components/icons/SiteMorphIcon';
import { DOCS_URL } from '@/lib/config';
import type { IconInput } from 'morphicons/react';

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
  from: IconInput;
  to: IconInput;
};

const links: NavLink[] = [
  { label: 'Try', href: '/try', from: PenLine, to: SquarePen },
  { label: 'Download', href: '/download', from: Download, to: HardDrive },
  { label: 'Plugins', href: '/plugins', from: Puzzle, to: Package },
  { label: 'Docs', href: DOCS_URL, external: true, from: BookOpen, to: FileText },
  { label: 'Pricing', href: '/pricing', from: CircleDollarSign, to: Wallet },
];

const navLinkClass =
  'inline-flex items-center gap-1.5 px-2.5 py-1 text-[13px] text-text-secondary transition-colors hover:text-text-primary';

function MorphNavLink({
  link,
  className,
  onClick,
}: {
  link: NavLink;
  className: string;
  onClick?: () => void;
}) {
  const [hot, setHot] = useState(false);
  const icon = (
    <SiteMorphIcon icon={hot ? link.to : link.from} size={14} className="text-current" />
  );

  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        onClick={onClick}
        onMouseEnter={() => setHot(true)}
        onMouseLeave={() => setHot(false)}
      >
        {icon}
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setHot(true)}
      onMouseLeave={() => setHot(false)}
    >
      {icon}
      {link.label}
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-md">
      <nav
        className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-5"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
          <span className="font-mono text-[15px] font-medium tracking-tight text-text-primary">
            dripnex.
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map(link => (
            <MorphNavLink key={link.href} link={link} className={navLinkClass} />
          ))}
          <MorphNavLink
            link={{ label: 'Sign in', href: '/login', from: LogIn, to: User }}
            className={navLinkClass}
          />
          <Link
            href="/signup"
            className="ml-1 rounded-md bg-text-primary px-2.5 py-1 text-[13px] font-medium text-background hover:opacity-80"
          >
            Sign up
          </Link>
        </div>

        <div className="flex md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-md text-text-secondary hover:text-text-primary"
                aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={open}
              >
                <SiteMorphIcon icon={open ? X : Menu} size={20} label={open ? 'Close' : 'Menu'} />
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2 font-mono text-base font-medium tracking-tight">
                  <img src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
                  <span>dripnex.</span>
                </SheetTitle>
              </SheetHeader>
              <ul className="mt-8 space-y-1">
                {[
                  ...links,
                  { label: 'Sign in', href: '/login', from: LogIn, to: User },
                  { label: 'Sign up', href: '/signup', from: User, to: User },
                ].map(link => (
                  <li key={link.href}>
                    <MorphNavLink
                      link={link}
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-3 text-sm text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                    />
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
