import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | SparkLive",
  description: "SparkLive Privacy Policy — Learn how we collect, use, and protect your personal data.",
  openGraph: {
    title: "Privacy Policy | SparkLive",
    description: "Learn how SparkLive collects, uses, and protects your personal data.",
    type: "website",
    siteName: "SparkLive",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#07070d] text-white">
      {/* Header */}
      <div className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.08)_0%,_transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold">
              Spark<span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400">Live</span>
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-white/40">Last updated: July 17, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-invert prose-sm max-w-none">
          <div className="space-y-8 text-white/60 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>
              <p>
                SparkLive (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/80">Personal Information</h3>
                <p>We may collect personal information that you voluntarily provide when you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create an account (email, username, profile information)</li>
                  <li>Complete your profile (photos, bio, interests)</li>
                  <li>Contact our support team</li>
                  <li>Participate in live streams or community features</li>
                  <li>Make purchases or receive payments</li>
                </ul>

                <h3 className="text-lg font-semibold text-white/80">Automatically Collected Information</h3>
                <p>When you access our platform, we automatically collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information (browser type, operating system, IP address)</li>
                  <li>Usage data (pages visited, features used, time spent)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Providing and maintaining our services</li>
                <li>Personalizing your experience</li>
                <li>Processing transactions</li>
                <li>Sending notifications and updates</li>
                <li>Improving our platform</li>
                <li>Ensuring security and preventing fraud</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Data Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers who help us operate our platform</li>
                <li>Law enforcement when required by law</li>
                <li>Other users as part of platform features (profile information)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Data Security</h2>
              <p>
                We implement industry-standard security measures including encryption, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data</li>
                <li>Object to processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. Contact</h2>
              <p>
                For privacy-related inquiries, contact us at{" "}
                <a href="mailto:privacy@sparklive.app" className="text-pink-400 hover:text-pink-300 transition-colors">privacy@sparklive.app</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}