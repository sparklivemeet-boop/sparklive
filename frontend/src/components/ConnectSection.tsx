'use client';

import { motion, type Variants } from 'framer-motion';
import {
  FaTelegram,
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
} from 'react-icons/fa6';
import { MdEmail } from 'react-icons/md';
import { useState, type MouseEvent } from 'react';

type ViewKey = 'desktop' | 'web' | 'phone';

const ConnectSection = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeView, setActiveView] = useState<ViewKey>('desktop');
  const emailAddress = 'sparklivemeet@gmail.com';

  const viewOptions: Array<{ id: ViewKey; label: string; description: string; accent: string }> = [
    {
      id: 'desktop',
      label: 'Desktop',
      description: 'Full desktop experience with a premium social dashboard and large-screen layout.',
      accent: 'Expert controls, spacious cards, and immersive glow visuals.',
    },
    {
      id: 'web',
      label: 'Web',
      description: 'Fast browser access for SparkLive on the go or at work.',
      accent: 'Instant web delivery with seamless connectivity.',
    },
    {
      id: 'phone',
      label: 'Phone',
      description: 'Touch-friendly mobile version built for swipe-first social discovery.',
      accent: 'Smooth gestures, compact layout, and fast response.',
    },
  ];

  const selectedView = viewOptions.find((view) => view.id === activeView);

  const viewCardText = {
    desktop: 'Open on desktop',
    web: 'Open in browser',
    phone: 'Tap on phone',
  } as const;

  const viewCardHeight = {
    desktop: 'min-h-[300px]',
    web: 'min-h-[280px]',
    phone: 'min-h-[240px]',
  } as const;

  const socialLinks = [
    {
      name: 'Telegram',
      icon: FaTelegram,
      url: 'https://t.me/SPK_Live',
      brandColor: '#0088cc',
      glowColor: 'rgba(0, 136, 204, 0.5)',
      ariaLabel: 'Join SparkLive on Telegram - opens in new tab',
    },
    {
      name: 'X',
      icon: FaXTwitter,
      url: 'https://x.com/SparkLive_',
      brandColor: '#000000',
      glowColor: 'rgba(0, 0, 0, 0.5)',
      ariaLabel: 'Follow SparkLive on X - opens in new tab',
    },
    {
      name: 'Facebook',
      icon: FaFacebookF,
      url: 'https://www.facebook.com/profile.php?id=61590276750167',
      brandColor: '#1877f2',
      glowColor: 'rgba(24, 119, 242, 0.5)',
      ariaLabel: 'Like SparkLive on Facebook - opens in new tab',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://www.instagram.com/spar.klive',
      brandColor: '#E4405F',
      glowColor: 'rgba(228, 64, 95, 0.5)',
      ariaLabel: 'Follow SparkLive on Instagram - opens in new tab',
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: 'https://tiktok.com/@spar_klive',
      brandColor: '#000000',
      glowColor: 'rgba(255, 0, 127, 0.5)',
      ariaLabel: 'Follow SparkLive on TikTok - opens in new tab',
    },
  ];

  const handleCopyEmail = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
          }}
          className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-bl from-pink-500 via-purple-500 to-transparent blur-3xl rounded-full -z-10"
        />
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500 via-purple-500 to-transparent blur-3xl rounded-full -z-10"
        />
      </div>

      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full glass-soft px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.25em] text-white/80 mb-6 border border-white/10"
          >
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-pulse" />
            Join The SparkLive Movement ✨
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-6xl font-black tracking-tight leading-tight text-white mb-4"
          >
            Connect With <span className="text-gradient">SparkLive</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg text-gray-300 leading-relaxed"
          >
            Join our growing community, stay updated, and connect with us across all platforms.
          </motion.p>
        </div>

        {/* Platform Version Selector */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="flex flex-col gap-4 sm:flex-row items-center justify-center text-center sm:text-left">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-gray-400 mb-2">View version</p>
              <h3 className="text-2xl md:text-3xl font-bold text-white">Desktop, Web, Phone</h3>
              <p className="max-w-2xl text-gray-400 mt-2">Choose the SparkLive experience that matches your device, then use the social cards below to connect instantly.</p>
            </div>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
              {viewOptions.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveView(view.id)}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${activeView === view.id ? 'bg-gradient-spark text-white shadow-[0_0_30px_rgba(255,0,127,0.3)]' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-soft rounded-[32px] border border-white/10 p-6 mt-8 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
            <p className="text-white text-lg font-semibold">{selectedView?.label} Version</p>
            <p className="text-gray-400 mt-2">{selectedView?.description}</p>
            <p className="text-pink-300 mt-1">{selectedView?.accent}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
                {viewCardText[activeView]}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                {activeView === 'desktop' ? 'Workspace-ready cards' : activeView === 'web' ? 'Browser-first speed' : 'Touch-optimized design'}
              </span>
            </div>
          </div>
        </div>

        {/* Social Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={social.ariaLabel}
                className="group relative h-full"
              >
                <div className={`relative h-full ${viewCardHeight[activeView]} rounded-[32px] overflow-hidden glass-soft border border-white/10 p-8 transition-all duration-300 hover:border-white/30 hover:shadow-[0_30px_65px_rgba(255,0,127,0.18)] cursor-pointer flex flex-col items-center justify-between gap-6`}>
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at top center, ${social.glowColor}, transparent 55%)`,
                    }}
                  />

                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 18 }}
                    className="relative z-10 p-5 rounded-[24px] transition-all duration-300"
                    style={{
                      backgroundColor: `${social.brandColor}20`,
                      boxShadow: `0 0 25px ${social.glowColor}, inset 0 0 18px ${social.glowColor}`,
                      border: `1px solid ${social.brandColor}30`,
                    }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <div className="relative z-10 text-center">
                    <p className="font-semibold text-white text-lg">{social.name}</p>
                    <p className="text-sm text-gray-400 mt-2">{viewCardText[activeView]}</p>
                    <span className="mt-4 inline-flex rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                      {activeView === 'desktop' ? 'Desktop Preview' : activeView === 'web' ? 'Web Access' : 'Phone Friendly'}
                    </span>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Email Section - Primary CTA */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col gap-4 items-stretch sm:flex-row sm:justify-center sm:items-center mb-12"
        >
          <motion.a
            href={`mailto:${emailAddress}`}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Send email to SparkLive support"
            className="group relative w-full sm:w-auto"
          >
            <div className="relative overflow-hidden rounded-[28px] glass-soft border border-white/10 px-8 py-5 flex items-center gap-4 transition-all duration-300 hover:border-white/30 hover:shadow-[0_30px_70px_rgba(255,0,127,0.16)] cursor-pointer">
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(circle at center, rgba(255, 77, 148, 0.24), transparent 55%)',
                }}
              />
              <div className="relative z-10 p-4 rounded-2xl border border-pink-400/20 bg-pink-500/10 shadow-[0_0_24px_rgba(255,112,164,0.18)]">
                <MdEmail className="w-7 h-7 text-pink-400" />
              </div>
              <div className="relative z-10 text-left">
                <p className="text-white font-semibold text-lg">Email SparkLive</p>
                <p className="text-sm text-gray-400">{emailAddress}</p>
              </div>
            </div>
          </motion.a>

          <motion.button
            onClick={handleCopyEmail}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            aria-label="Copy SparkLive email address to clipboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[28px] bg-gradient-spark px-8 py-5 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_50px_rgba(255,0,127,0.35)] border border-white/20 cursor-pointer"
          >
            <span className="text-sm uppercase tracking-[0.2em]">{copiedEmail ? 'Copied!' : 'Copy Email'}</span>
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12"
        />

        {/* Community Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { label: 'Active Users', value: '10K+' },
            { label: 'Daily Connections', value: '2.5K' },
            { label: 'Global Community', value: '50+' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className="glass-soft rounded-2xl border border-white/10 p-8 text-center hover:border-white/30 transition-colors cursor-default"
            >
              <p className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-3 font-semibold">
                {stat.label}
              </p>
              <p className="text-3xl md:text-4xl font-black text-gradient">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ConnectSection;
