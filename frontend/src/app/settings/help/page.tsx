'use client';

import { ArrowLeft, HelpCircle, ExternalLink, Mail } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/settings"><Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>Back</Button></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Help Center</h1>
            <p className="text-sm text-gray-400">Guides, FAQs, and support resources.</p>
          </div>
        </div>

        <div className="glass rounded-[28px] p-6 shadow-card space-y-4">
          {[
            { q: 'How do I create a post?', a: 'Navigate to your profile and use the create post form to share content with your followers.' },
            { q: 'How do I start streaming?', a: 'Go to the Live page and click "Go Live" to start broadcasting to your audience.' },
            { q: 'How do I earn coins?', a: 'You can earn coins through gifts, subscriptions, and completing achievements on the platform.' },
            { q: 'How do I report an issue?', a: 'Use the contact form below or email our support team for assistance.' },
          ].map((faq, i) => (
            <details key={i} className="group rounded-2xl border border-white/10 bg-black/40">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-white">
                {faq.q}
                <ChevronDown size={16} className="text-gray-500 transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-white/10 px-5 py-4 text-sm text-gray-400">{faq.a}</div>
            </details>
          ))}
        </div>

        <div className="glass rounded-[28px] p-6 shadow-card text-center">
          <Mail size={32} className="mx-auto mb-3 text-gray-500" />
          <p className="text-sm text-gray-400 mb-3">Need more help? Contact our support team.</p>
          <Button variant="primary">Contact Support</Button>
        </div>
      </div>
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}