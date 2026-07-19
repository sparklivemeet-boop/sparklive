"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Hash, Image, Lightbulb, Languages, Shield, Copy, Check } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { apiGet } from '@/lib/apiClient';

export default function AIPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try { const d = await apiGet('/api/creator/ai/tools'); setData(d); }
      catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-pink-400" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">AI Tools</span>
        </div>
        <h1 className="text-2xl font-bold text-white">AI Content Studio</h1>
        <p className="text-sm text-gray-400 mt-1">Generate captions, hashtags, thumbnails, and translations with AI.</p>
      </div>

      <GlassCard>
        <div className="text-center py-8">
          <Sparkles size={32} className="mx-auto mb-3 text-pink-400" />
          <p className="text-sm text-gray-400">AI tools are being configured.</p>
          <p className="text-xs text-gray-600 mt-1">Generate content ideas and optimize your posts.</p>
        </div>
      </GlassCard>
    </div>
  );
}