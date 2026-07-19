"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Sparkles, Gift, ArrowLeft, Coins, Loader2, Search, Zap, Crown, Star, Flame, TrendingUp, Calendar, Shield, Heart, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/lib/apiClient';

// Types
interface GiftItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
  description: string;
  glowColor?: string;
  particleColor?: string;
  isLegendary?: boolean;
  isLimited?: boolean;
  animationDuration?: number;
  sortOrder?: number;
  comboEnabled?: boolean;
}

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonusCoins: number;
  isPopular: boolean;
}

// Gift categories
const CATEGORIES = [
  { id: 'all', label: 'All Gifts', icon: Gift },
  { id: 'everyday', label: 'Everyday', icon: Heart },
  { id: 'premium', label: 'Premium', icon: Crown },
  { id: 'legendary', label: 'Legendary', icon: Star },
  { id: 'limited', label: 'Limited', icon: Flame },
];

// Emoji fallbacks per gift ID
const EMOJI_FALLBACK: Record<string, string> = {
  heart: '❤️', rose: '🌹', teddy_bear: '🧸', diamond: '💎', crown: '👑', yacht: '🛥️',
  spark: '✨', butterfly_swarm: '🦋', shooting_star: '⭐', rainbow: '🌈',
  gift_box: '🎁', birthday_cake: '🎂', balloons: '🎈', fireworks: '🎆',
  trophy: '🏆', rocket: '🚀', diamond_ring: '💍', golden_lion: '🦁',
  dragon: '🐉', private_jet: '✈️', castle: '🏰', supercar: '🏎️',
  ufo: '🛸', planet: '🌍', moon: '🌕', sun: '☀️', helicopter: '🚁',
  private_island: '🏝️', palace: '🏛️', cruise_ship: '🚢', treasure_chest: '💰',
  spark_storm: '⚡', cosmic_supernova: '🌌', galaxy_portal: '🌀',
  golden_dragon: '🐲', unicorn: '🦄', kings_throne: '👑',
  spark_planet: '🌎', meteor_shower: '☄️', spark_universe: '🌠',
};

// Animated background particles for legendary gifts
const LegendaryBackground = ({ gift, visible }: { gift: GiftItem; visible: boolean }) => {
  if (!visible) return null;
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[28px]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size + 'px',
            height: p.size + 'px',
            background: gift.glowColor || '#FFD700',
            boxShadow: `0 0 ${p.size * 2}px ${gift.glowColor || '#FFD700'}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0.6,
          }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${gift.glowColor || '#FFD700'}11 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

// Glow effect for gifts
const GiftGlow = ({ color, isLegendary }: { color?: string; isLegendary?: boolean }) => (
  <div
    className={`absolute inset-0 rounded-[28px] transition-opacity duration-500 ${isLegendary ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
    style={{
      background: `radial-gradient(circle at 50% 50%, ${color || '#ff007f'}22 0%, transparent 70%)`,
      boxShadow: `inset 0 0 60px ${color || '#ff007f'}22`,
    }}
  />
);

// Particle burst animation on hover
const ParticleBurst = ({ color }: { color?: string }) => {
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      angle: (i / 8) * 360,
      distance: Math.random() * 30 + 20,
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
          style={{
            background: color || '#ff007f',
            boxShadow: `0 0 6px ${color || '#ff007f'}`,
            transform: `rotate(${p.angle}deg) translateY(-${p.distance}px)`,
            animation: `float ${Math.random() * 2 + 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
};

// SparkCoin purchase modal
function PurchaseModal({ packages, balance, onClose, onPurchase }: {
  packages: CoinPackage[];
  balance: number;
  onClose: () => void;
  onPurchase: (pkg: CoinPackage) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass-strong rounded-[32px] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Buy SparkCoins</h2>
            <p className="text-sm text-gray-400 mt-1">Your balance: <span className="text-yellow-300 font-bold">{balance.toLocaleString()}</span> 🪙</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => onPurchase(pkg)}
              className={`w-full glass rounded-[20px] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 border relative overflow-hidden group ${pkg.isPopular ? 'border-pink-500/40' : 'border-white/10'}`}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-500 to-purple-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-[16px] uppercase tracking-wider">
                  Best Value
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <span className="text-2xl font-bold text-white">
                      {pkg.coins.toLocaleString()}
                    </span>
                    {pkg.bonusCoins > 0 && (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                        +{pkg.bonusCoins} FREE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{pkg.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-white">${pkg.price.toFixed(2)}</span>
                  {pkg.bonusCoins > 0 && (
                    <p className="text-[10px] text-green-400">
                      {(pkg.bonusCoins / pkg.coins * 100).toFixed(0)}% bonus
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Secured by Stripe 🔒 • Instant delivery • No hidden fees
        </p>
      </div>
    </div>
  );
}

// Gift send confirmation modal
function SendGiftModal({ gift, balance, onClose, onSend }: {
  gift: GiftItem;
  balance: number;
  onClose: () => void;
  onSend: (isAnon: boolean, isSuper: boolean) => void;
}) {
  const [isAnon, setIsAnon] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const canAfford = balance >= gift.price;
  const superPrice = gift.price * 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass-strong rounded-[32px] p-8 max-w-sm w-full shadow-elevated border border-white/10 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div
            className="text-7xl mb-4 mx-auto w-24 h-24 flex items-center justify-center rounded-2xl bg-white/5 animate-float"
            style={{ textShadow: gift.glowColor ? `0 0 30px ${gift.glowColor}` : undefined }}
          >
            {gift.emoji}
          </div>
          <h3 className="text-2xl font-bold text-white">Send {gift.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{gift.description}</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
            <Coins size={16} className="text-yellow-300" />
            <span className="font-bold text-white text-lg">{gift.price.toLocaleString()}</span>
          </div>
          {!canAfford && (
            <p className="text-xs text-red-400 mt-2">Insufficient balance. You need {gift.price - balance} more coins.</p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 glass rounded-[16px] p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <input type="checkbox" checked={isAnon} onChange={e => setIsAnon(e.target.checked)} className="w-4 h-4 accent-pink-500" />
            <div>
              <p className="text-sm font-medium text-white">Send anonymously</p>
              <p className="text-xs text-gray-400">Your name won't be shown</p>
            </div>
          </label>
          <label className="flex items-center gap-3 glass rounded-[16px] p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <input type="checkbox" checked={isSuper} onChange={e => setIsSuper(e.target.checked)} className="w-4 h-4 accent-pink-500" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">Super Gift ⚡</p>
                <span className="text-[10px] bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-0.5 rounded-full">x2 Highlight</span>
              </div>
              <p className="text-xs text-gray-400">Double the price for extra effects</p>
            </div>
            <span className="text-sm font-bold text-white">{superPrice.toLocaleString()}</span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button
            variant="primary"
            disabled={!canAfford}
            onClick={() => onSend(isAnon, isSuper)}
            className="flex-1"
            icon={<Gift size={16} />}
          >
            Send {isSuper ? 'Super ' : ''}{gift.name}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Success animation overlay
function GiftSentAnimation({ gift, onComplete }: { gift: GiftItem; onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 80,
      y: 50 + (Math.random() - 0.5) * 80,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.5,
      driftX: (Math.random() - 0.5) * 100,
      driftY: -(Math.random() * 100 + 50),
    })), []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40" />
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size + 'px',
            height: p.size + 'px',
            background: gift.glowColor || '#ff007f',
            boxShadow: `0 0 ${p.size * 3}px ${gift.glowColor || '#ff007f'}`,
            animation: `particleBurst 2s ease-out forwards`,
            animationDelay: `${p.delay}s`,
            '--drift-x': `${p.driftX}px`,
            '--drift-y': `${p.driftY}px`,
          } as React.CSSProperties}
        />
      ))}
      <div className="relative text-center animate-scale-in">
        <div
          className="text-8xl mb-4 animate-bounce"
          style={{ textShadow: gift.glowColor ? `0 0 60px ${gift.glowColor}` : undefined }}
        >
          {gift.emoji}
        </div>
        <h2 className="text-3xl font-bold text-white">Gift Sent! 🎉</h2>
        <p className="text-gray-300 mt-2">{gift.name} has been delivered!</p>
      </div>
    </div>
  );
}

export default function GiftStorePage() {
  const { token, user } = useAuth();
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPurchase, setShowPurchase] = useState(false);
  const [sendingGift, setSendingGift] = useState<GiftItem | null>(null);
  const [sentGift, setSentGift] = useState<GiftItem | null>(null);
  const [hoveredGift, setHoveredGift] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        const [giftData, walletData, packageData] = await Promise.all([
          apiGet<any[]>('/api/monetization/gifts', token).catch(() => []),
          apiGet<any>('/api/monetization/wallet', token).catch(() => ({ coinBalance: 0 })),
          apiGet<any[]>('/api/monetization/packages', token).catch(() => []),
        ]);
        if (giftData && giftData.length > 0) {
          setGifts(giftData.map((g: any) => ({
            ...g,
            emoji: g.emoji || EMOJI_FALLBACK[g.id.replace('gift_', '')] || '🎁',
          })));
        }
        if (walletData?.coinBalance !== undefined) setBalance(walletData.coinBalance);
        if (packageData && packageData.length > 0) setPackages(packageData);
      } catch (error) {
        console.error('Failed to load gift store', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const filteredGifts = useMemo(() => {
    let result = gifts;
    if (activeCategory !== 'all') {
      result = result.filter(g => {
        if (activeCategory === 'limited') return g.isLimited;
        return g.category === activeCategory;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g => g.name.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q));
    }
    return result.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [gifts, activeCategory, searchQuery]);

  const handleSendGift = async (isAnon: boolean, isSuper: boolean) => {
    if (!sendingGift || !token || !user) return;
    try {
      const receiverId = new URLSearchParams(window.location.search).get('receiverId') || user.id;
      await apiPost('/api/monetization/gifts/send', {
        receiverId,
        giftId: sendingGift.id,
        isAnon,
        isSuper,
      }, token);
      setBalance(prev => prev - (isSuper ? sendingGift.price * 2 : sendingGift.price));
      setSendingGift(null);
      setSentGift(sendingGift);
    } catch (error) {
      console.error('Failed to send gift:', error);
    }
  };

  const handlePurchase = async (pkg: CoinPackage) => {
    try {
      await apiPost('/api/monetization/purchase', { packageId: pkg.id }, token ?? undefined);
      setBalance(prev => prev + pkg.coins + pkg.bonusCoins);
      setShowPurchase(false);
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return gifts.length;
    if (catId === 'limited') return gifts.filter(g => g.isLimited).length;
    return gifts.filter(g => g.category === catId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 lg:pb-10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-pink-500 mx-auto" />
          <p className="text-sm text-gray-400 mt-3">Loading gift store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      {/* Sent gift animation overlay */}
      {sentGift && <GiftSentAnimation gift={sentGift} onComplete={() => setSentGift(null)} />}

      {/* Send gift modal */}
      {sendingGift && (
        <SendGiftModal
          gift={sendingGift}
          balance={balance}
          onClose={() => setSendingGift(null)}
          onSend={handleSendGift}
        />
      )}

      {/* Purchase modal */}
      {showPurchase && (
        <PurchaseModal
          packages={packages}
          balance={balance}
          onClose={() => setShowPurchase(false)}
          onPurchase={handlePurchase}
        />
      )}

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="glass rounded-[32px] p-6 lg:p-8 shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 to-purple-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-cyan-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Gift Store</span>
                  {packages.filter(p => p.isPopular).length > 0 && (
                    <span className="text-[10px] bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded-full font-bold animate-pulse-glow">
                      🔥 SALE
                    </span>
                  )}
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold text-white">
                  Send <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">premium</span> gifts
                </h1>
                <p className="text-sm text-gray-400 max-w-xl">
                  Show appreciation with animated gifts. Every gift brings you closer to your favorite creators.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/profile?tab=wallet">
                  <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />}>Wallet</Button>
                </Link>
              </div>
            </div>

            {/* Balance card */}
            <div className="mt-6 glass rounded-[24px] p-5 border border-white/5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400/20 to-amber-600/20 flex items-center justify-center">
                    <Coins size={28} className="text-yellow-300" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">SparkCoin Balance</p>
                    <p className="text-3xl font-bold text-white mt-0.5">
                      {balance.toLocaleString()}{' '}
                      <span className="text-xl">🪙</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    icon={<Coins size={16} />}
                    onClick={() => setShowPurchase(true)}
                  >
                    Buy Coins
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Categories */}
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search gifts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full glass rounded-[16px] pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/30 transition-colors border border-white/5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const count = getCategoryCount(cat.id);
              const isActive = activeCategory === cat.id;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20'
                      : 'glass text-gray-300 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {cat.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gift Grid */}
        {filteredGifts.length === 0 ? (
          <div className="glass rounded-[28px] p-12 text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h3 className="text-xl font-bold text-white">No gifts found</h3>
            <p className="text-sm text-gray-400 mt-2">Try a different category or search term</p>
          </div>
        ) : (
          <>
            {/* Legendary section label */}
            {activeCategory === 'legendary' && (
              <div className="flex items-center gap-3 px-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
                <div className="flex items-center gap-2 text-yellow-300 text-sm font-bold uppercase tracking-widest">
                  <Star size={14} className="fill-yellow-300" />
                  Cinematic Gifts
                  <Star size={14} className="fill-yellow-300" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredGifts.map((gift) => (
                <div
                  key={gift.id}
                  className={`glass rounded-[28px] p-5 border transition-all duration-500 cursor-pointer group relative overflow-hidden ${
                    gift.isLegendary
                      ? 'border-yellow-500/30 hover:border-yellow-400/60 shadow-[0_0_40px_rgba(255,215,0,0.08)] hover:shadow-[0_0_60px_rgba(255,215,0,0.15)]'
                      : 'border-white/10 hover:border-pink-500/30 hover:shadow-[0_20px_60px_rgba(255,0,127,0.12)]'
                  } ${hoveredGift === gift.id ? '-translate-y-1' : ''}`}
                  onMouseEnter={() => setHoveredGift(gift.id)}
                  onMouseLeave={() => setHoveredGift(null)}
                  onClick={() => setSendingGift(gift)}
                  style={{
                    transform: hoveredGift === gift.id ? 'translateY(-4px)' : 'translateY(0)',
                  }}
                >
                  {/* Glow effect */}
                  <GiftGlow color={gift.glowColor} isLegendary={gift.isLegendary} />

                  {/* Legendary particles */}
                  <LegendaryBackground gift={gift} visible={hoveredGift === gift.id} />

                  {/* Particle burst */}
                  <ParticleBurst color={gift.particleColor} />

                  {/* Badges */}
                  <div className="absolute top-3 right-3 z-10 flex gap-1.5">
                    {gift.isLegendary && (
                      <span className="text-[10px] bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <Star size={10} className="fill-black" /> LEGENDARY
                      </span>
                    )}
                    {gift.isLimited && (
                      <span className="text-[10px] bg-red-500/90 text-white font-bold px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse-glow">
                        <Flame size={10} /> LIMITED
                      </span>
                    )}
                  </div>

                  {/* Emoji display */}
                  <div className={`relative z-10 flex items-center gap-4 ${gift.isLegendary ? 'mb-3' : ''}`}>
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-all duration-500 ${
                        hoveredGift === gift.id ? 'scale-110' : ''
                      } ${gift.isLegendary ? 'bg-gradient-to-br from-yellow-400/20 to-amber-600/20' : 'bg-white/5'}`}
                      style={{
                        textShadow: hoveredGift === gift.id && gift.glowColor
                          ? `0 0 30px ${gift.glowColor}, 0 0 60px ${gift.glowColor}44`
                          : undefined,
                        transform: hoveredGift === gift.id ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      <span className="animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
                        {gift.emoji || EMOJI_FALLBACK[gift.id.replace('gift_', '')] || '🎁'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{gift.name}</h3>
                      <p className="text-[11px] text-gray-400 truncate">{gift.description || 'Premium gift'}</p>
                    </div>
                  </div>

                  {/* Price and action */}
                  <div className="relative z-10 mt-4 flex items-end justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <Coins size={14} className="text-yellow-300" />
                      <span className={`font-bold text-lg ${gift.isLegendary ? 'text-yellow-300' : 'text-white'}`}>
                        {gift.price.toLocaleString()}
                      </span>
                    </div>
                    <Button
                      variant={gift.isLegendary ? 'primary' : 'ghost'}
                      size="sm"
                      icon={<Gift size={14} />}
                      className={gift.isLegendary ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold hover:from-yellow-400 hover:to-amber-500' : ''}
                    >
                      Send
                    </Button>
                  </div>

                  {/* Combo indicator */}
                  {gift.comboEnabled && (
                    <div className="relative z-10 mt-2 flex items-center gap-1 text-[10px] text-gray-500">
                      <Zap size={10} />
                      Combo ready
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bottom info bar */}
        <div className="glass rounded-[20px] p-4 text-center">
          <p className="text-xs text-gray-400">
            💎 Every gift supports creators • 70% goes directly to them • Gifts are non-refundable
          </p>
        </div>
      </div>
    </div>
  );
}