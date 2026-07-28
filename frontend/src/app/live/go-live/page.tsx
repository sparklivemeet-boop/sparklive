"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function GoLivePage() {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      router.replace('/live/studio');
    } else {
      router.replace('/login');
    }
  }, [token, router]);

  return null;
}