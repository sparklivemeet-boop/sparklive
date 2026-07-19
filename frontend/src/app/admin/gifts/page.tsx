"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gift, Plus, Edit3, Search, Grid3X3, List, ToggleLeft,
  ToggleRight, Sparkles, Crown, Snowflake, Heart, PanelTop,
  Info, Database, CheckCircle, XCircle
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import Button from '@/components/ui/Button';
import { getGifts } from '@/lib/adminApi';
import type { GiftDefinition } from '@/types/admin';

const categoryColors: Record<string, string> = {
  everyday: 'bg-white/10 text-gray-300',
  premium: 'bg-pink-500/20 text-pink-300',
  legendary: 'bg-yellow-500/20 text-yellow-300',
  seasonal: 'bg-blue-500/20 text-blue-300',
  limited: 'bg-red-500/20 text-red-300',
  featured: 'bg-purple-500/20 text-purple-300',
};

export default function GiftsPage() {
  const [gifts, setGifts] = useState<GiftDefinition[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await getGifts(token);
        setGifts(data);
      } catch (err) {
        console.error('Failed to fetch gifts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = categoryFilter === 'all' ? gifts : gifts.filter(g => g.category === categoryFilter);

  const categories = ['all', 'everyday', 'premium', 'legendary', 'seasonal', 'limited', 'featured'];

  const toggleActive = (id: string) => {
    setGifts(prev => prev.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g));
  };

  const savePrice = (id: string) => {
    setGifts(prev => prev.map(g => g.id === id ? { ...g, price: priceValue } : g));
    setEditingPrice(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Gift size={14} className="text-pink-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Gifts</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Gift Management</h1>
          <p className="text-sm text-gray-400 mt-1">Create, edit, and manage virtual gifts. No code changes needed for new gifts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-500 hover:text-gray-300'}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setViewMode('table')} className={`p-2 rounded-xl transition-colors ${viewMode === 'table' ? 'bg-pink-500/20 text-pink-300' : 'text-gray-500 hover:text-gray-300'}`}>
            <List size={16} />
          </button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>Add Gift</Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => setCategoryFilter(cat)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                : 'glass text-gray-400 hover:text-white border border-white/[0.06]'
            }`}>
            {cat === 'all' ? <Gift size={12} /> : cat === 'premium' ? <Crown size={12} /> : cat === 'legendary' ? <Sparkles size={12} /> : cat === 'seasonal' ? <Snowflake size={12} /> : <Heart size={12} />}
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
            <span className="opacity-60">({cat === 'all' ? gifts.length : gifts.filter(g => g.category === cat).length})</span>
          </button>
        ))}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((gift, i) => (
            <motion.div key={gift.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass rounded-[20px] p-4 border border-white/[0.06] hover:border-white/[0.12] transition-all text-center group">
              <div className="text-4xl mb-3">{gift.emoji}</div>
              <p className="text-sm font-bold text-white">{gift.name}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${categoryColors[gift.category] || ''}`}>
                {gift.category}
              </span>
              <div className="mt-2">
                {editingPrice === gift.id ? (
                  <div className="flex items-center justify-center gap-1">
                    <input type="number" value={priceValue} onChange={e => setPriceValue(parseInt(e.target.value))}
                      className="w-16 glass rounded-[8px] px-2 py-0.5 text-white text-sm text-center" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') savePrice(gift.id); }} />
                    <button onClick={() => savePrice(gift.id)} className="text-[10px] text-green-400">✓</button>
                    <button onClick={() => setEditingPrice(null)} className="text-[10px] text-red-400">✗</button>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-yellow-300">{gift.price} 🪙</p>
                )}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <button onClick={() => toggleActive(gift.id)} className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${gift.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                  {gift.isActive ? 'Active' : 'Inactive'}
                </button>
                <button onClick={() => { setEditingPrice(gift.id); setPriceValue(gift.price); }}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100">
                  <Edit3 size={12} className="text-gray-400" />
                </button>
              </div>
              {gift.animation && <p className="text-[9px] text-gray-500 mt-1">✨ Animated</p>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-[11px] uppercase tracking-wider border-b border-white/[0.06]">
                  <th className="text-left py-3 px-2 font-medium">Gift</th>
                  <th className="text-left py-3 px-2 font-medium">Category</th>
                  <th className="text-right py-3 px-2 font-medium">Price</th>
                  <th className="text-center py-3 px-2 font-medium">Status</th>
                  <th className="text-center py-3 px-2 font-medium">Anim</th>
                  <th className="text-center py-3 px-2 font-medium">Order</th>
                  <th className="text-center py-3 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(gift => (
                  <tr key={gift.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{gift.emoji}</span>
                        <div>
                          <p className="text-white font-medium">{gift.name}</p>
                          <p className="text-gray-500 text-[10px] max-w-[150px] truncate">{gift.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[gift.category] || ''}`}>{gift.category}</span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      {editingPrice === gift.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <input type="number" value={priceValue} onChange={e => setPriceValue(parseInt(e.target.value))}
                            className="w-16 glass rounded-[8px] px-2 py-0.5 text-white text-sm text-center" autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') savePrice(gift.id); }} />
                          <button onClick={() => savePrice(gift.id)} className="text-green-400">✓</button>
                        </div>
                      ) : (
                        <span className="font-bold text-yellow-300">{gift.price.toLocaleString()} 🪙</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button onClick={() => toggleActive(gift.id)} className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors ${gift.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                        {gift.isActive ? <ToggleRight size={10} /> : <ToggleLeft size={10} />}
                        {gift.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center text-gray-500 text-xs">{gift.animation ? '✅' : '—'}</td>
                    <td className="py-3 px-2 text-center text-gray-500 text-xs">{gift.sortOrder}</td>
                    <td className="py-3 px-2 text-center">
                      <button onClick={() => { setEditingPrice(gift.id); setPriceValue(gift.price); }} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                        <Edit3 size={12} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* No-code note */}
      <GlassCard>
        <div className="flex items-center gap-3">
          <Database size={20} className="text-pink-400" />
          <div>
            <p className="text-sm font-medium text-white">No Code Changes Required</p>
            <p className="text-xs text-gray-400">New gifts can be added directly via the database or API. The dashboard and rendering engine will automatically support them.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}