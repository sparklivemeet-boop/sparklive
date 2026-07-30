'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Compass, Film, Bell, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onCreateClick?: () => void;
}

const navItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/notification', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNavigation({ onCreateClick }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className="flex items-center justify-around h-16 bg-[#0e0e16]/95 backdrop-blur-2xl border-t border-white/[0.06] safe-area-bottom"
      role="navigation"
      aria-label="Bottom navigation"
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[64px]',
              isActive
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className={cn(
              'relative flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200',
              isActive && 'bg-gradient-to-br from-[#ff007f] to-[#7a00cc] shadow-[0_0_12px_rgba(255,0,127,0.2)]'
            )}>
              <Icon size={16} className={cn(isActive ? 'text-white' : 'text-gray-500')} />
            </div>
            <span className={cn('text-[10px] font-medium', isActive ? 'text-white/80' : 'text-gray-500')}>
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Create FAB */}
      <button
        onClick={onCreateClick}
        className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/30 hover:shadow-[#ff007f]/40 hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Create"
      >
        <Plus size={20} className="text-white" />
      </button>
    </nav>
  );
}