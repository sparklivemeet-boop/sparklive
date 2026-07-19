'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Video, Bell, User, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/context';
const navTranslationKeys: Record<string, string> = {
  '/discover': 'nav.home',
  '/messages': 'nav.messages',
  '/live': 'nav.live',
  '/notification': 'nav.notifications',
  '/profile': 'nav.profile',
};

const navItems = [
  { href: '/discover', icon: Home },
  { href: '/messages', icon: MessageCircle },
  { href: '/live', icon: Video },
  { href: '/notification', icon: Bell },
  { href: '/profile', icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useI18n();
  const unreadTotal = 0;

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0e0e16]/90 backdrop-blur-2xl border-t border-white/[0.06] safe-area-pb"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around items-center h-[64px] max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          const isAlerts = item.href === '/notification';

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-14 h-14"
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className={cn(
                  'relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-br from-[#ff007f]/20 to-[#7a00cc]/20'
                    : 'text-gray-500'
                )}
                animate={isActive ? { scale: 1 } : { scale: 1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Icon
                  size={20}
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? 'text-white' : 'text-gray-500'
                  )}
                />

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    className="absolute -top-1 w-1 h-1 rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc]"
                    layoutId="bottomNavIndicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Unread badge */}
                {isAlerts && unreadTotal > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] rounded-full bg-gradient-to-r from-[#ff007f] to-[#ff3366] text-[8px] font-bold text-white shadow-[0_0_8px_rgba(255,0,127,0.4)]">
                    {unreadTotal > 9 ? '9+' : unreadTotal}
                  </span>
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                className="text-[9px] mt-0.5 font-semibold"
                animate={{
                  color: isActive ? '#ffffff' : '#6b7280',
                  opacity: 1,
                }}
              >
                {t(navTranslationKeys[item.href] || `nav.${item.href.slice(1)}`)}
              </motion.span>
            </Link>
          );
        })}
      </div>

      {/* Safe area spacer */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
}