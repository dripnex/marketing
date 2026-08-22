'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowDownToLine,
  Blocks,
  BookOpen,
  BookText,
  Download,
  LogIn,
  Menu,
  PenLine,
  Puzzle,
  SquarePen,
  Tag,
  Tags,
  User,
  UserPlus,
  X,
} from 'lucide';
import { MorphIcon } from 'morphicons/react';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { MorphNavIcon } from '@/components/icons/MorphGlyph';
import { DOCS_URL } from '@/lib/config';

type NavLink = {
  label: string;
  href: string;
  external?: boolean;
  rest: typeof PenLine;
  active: typeof SquarePen;
};

const links: NavLink[] = [
  { label: 'Try', href: '/try', rest: PenLine, active: SquarePen },
  { label: 'Download', href: '/download', rest: Download, active: ArrowDownToLine },
  { label: 'Plugins', href: '/plugins', rest: Puzzle, active: Blocks },
  { label: 'Docs', href: DOCS_URL, external: true, rest: BookOpen, active: BookText },
  { label: 'Pricing', href: '/pricing', rest: Tag, active: Tags },
];

const navLinkClass =
  'inline-flex items-center gap-1.5 px-2.5 py-1 text-[13px] text-text-secondary transition-colors hover:text-text-primary';

function NavItem({
  link,
  onNavigate,
  className = navLinkClass,
}: {
  link: NavLink | { label: string; href: string; rest: typeof LogIn; active: typeof User };
  onNavigate?: () => void;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const icon = <MorphNavIcon rest={link.rest} active={link.active} engaged={hovered} />;

  if ('external' in link && link.external) {
    return (
      <a
        href={link.href}
        className={className}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onNavigate}
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onNavigate}
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
            <NavItem key={link.href} link={link} />
          ))}
          <NavItem link={{ label: 'Sign in', href: '/login', rest: LogIn, active: User }} />
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
                aria-label="Open navigation menu"
                aria-expanded={open}
              >
                <MorphIcon
                  icon={open ? X : Menu}
                  size={20}
                  strokeWidth={1.5}
                  reducedMotion="user"
                  spring="snappy"
                  data-morphicon=""
                />
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
                  { label: 'Sign in', href: '/login', rest: LogIn, active: User },
                  { label: 'Sign up', href: '/signup', rest: UserPlus, active: User },
                ].map(link => (
                  <li key={link.href}>
                    <NavItem
                      link={link}
                      onNavigate={() => setOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-3 text-sm text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
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
