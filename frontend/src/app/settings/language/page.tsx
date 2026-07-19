'use client';

import { useState } from 'react';
import { ArrowLeft, Globe, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function LanguageSettingsPage() {
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => { setSuccess('Language preference saved'); setTimeout(() => setSuccess(null), 3000); setSaving(false); }, 500);
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Language & Region</h1>
            <p className="text-sm text-gray-400">Set your content language and regional preferences.</p>
          </div>
        </div>
        {success && <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm p-4 rounded-2xl">{success}</div>}

        <div className="glass rounded-[28px] p-6 shadow-card space-y-5">
          <label className="space-y-2 text-sm text-gray-300">
            <span className="font-medium">Display language</span>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[var(--color-spark-pink)]">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="pt">Português</option>
              <option value="ar">العربية</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
            </select>
          </label>
          <Button variant="primary" onClick={handleSave} loading={saving} icon={<Save size={14} />}>Save preference</Button>
        </div>
      </div>
    </div>
  );
}