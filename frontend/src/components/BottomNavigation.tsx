'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, Video, User, Bell } from 'lucide-react';

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/discover', icon: Home, label: 'Discover' },
    { href: '/messages', icon: MessageCircle, label: 'Chat' },
    { href: '/notification', icon: Bell, label: 'Alerts' },
    { href: '/live', icon: Video, label: 'Live' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/10 backdrop-blur-xl">
      <div className="flex justify-around items-center h-20 max-w-full mx-auto px-1 md:max-w-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all ${
                isActive ? 'bg-gradient-spark shadow-[0_0_20px_rgba(255,0,127,0.35)]' : 'bg-white/5'
              }`}>
                <Icon size={isActive ? 18 : 20} className={isActive ? 'text-white' : 'text-gray-300'} />
              </div>
              <span className={`text-[9px] mt-1 font-semibold transition-all ${isActive ? 'text-white opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
