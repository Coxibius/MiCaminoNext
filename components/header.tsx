'use client';

import { Leaf, MessageCircleHeart, ListChecks, BarChart3, Calendar } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { StockDialog } from '@/components/stock-dialog';

const navItems = [
  { href: '/', label: 'Inicio', icon: Leaf },
  { href: '/registrar', label: 'Registrar', icon: ListChecks },
  { href: '/historial', label: 'Historial', icon: BarChart3 },
  { href: '/calendario', label: 'Calendario', icon: Calendar },
  { href: '/apoyo', label: 'Apoyo IA', icon: MessageCircleHeart },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-4xl items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">Mi Camino</span>
        </Link>
        
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
          <StockDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
