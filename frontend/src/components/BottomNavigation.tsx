'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, MessageCircle, Video, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import SparkLiveLogo from '@/components/ui/SparkLiveLogo';

const navItems = [
  { href: '/discover', icon: Home, label: 'Home' },
  { href: '/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/live', icon: Video, label: 'Live' },
  { href: '/notification', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNavigation() {
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
    </nav>
  );
}