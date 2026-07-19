"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, MessageCircle, Play, Sparkles, StopCircle, UserPlus, Volume2, Search, Users, TrendingUp, Grid, List, Tv, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import { createSocket } from '@/lib/socketClient';
import { Socket } from 'socket.io-client';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatNumber } from '@/lib/utils';

interface Category { id: string; name: string; description?: string | null; }
interface LiveStreamItem {
  id: string; title: string; description?: string | null; category?: Category | null;
  viewers: number; viewerCount: number; playbackUrl?: string | null; thumbnailUrl?: string | null;
  active: boolean; host: { id: string; username: string; avatar?: string | null; };
}
interface ChatMessage {
  id: string; message: string; createdAt: string; user: { id: string; username: string; avatar?: string | null; };
}
interface StreamDetail extends LiveStreamItem { chatMessages: ChatMessage[]; }

export default function LiveStreamPage() {
  const { user, token } = useAuth();
  const [streams, setStreams] = useState<LiveStreamItem[]>([]);
  const [recommended, setRecommended] = useState<LiveStreamItem[]>([]);
  const [following, setFollowing] = useState<LiveStreamItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<StreamDetail | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [joinedStreamId, setJoinedStreamId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const filteredStreams = useMemo(() => {
    if (categoryFilter === 'All') return streams;
    return streams.filter(s => s.category?.name?.toLowerCase() === categoryFilter.toLowerCase());
  }, [categoryFilter, streams]);

  const scrollChatToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [s, r, c, f] = await Promise.all([
          apiGet<LiveStreamItem[]>('/api/live?limit=30', token || undefined),
          apiGet<{ streams: LiveStreamItem[] }>('/api/live/discover?limit=8', token || undefined),
          apiGet<{ name: string }[]>('/api/live/categories', token || undefined),
          token ? apiGet<{ streams: LiveStreamItem[] }>('/api/live/following', token) : Promise.resolve({ streams: [] }),
        ]);
        setStreams(s);
        if (!selectedId && s.length) setSelectedId(s[0].id);
        setRecommended(r.streams);
        setCategories(['All', ...c.map(cat => cat.name || '')]);
        setFollowing(f.streams);
      } catch (err) { console.error('Failed to load streams', err); }
      finally { setLoading(false); }
    };
    init();
  }, [token]);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      try {
        const stream = await apiGet<StreamDetail>(`/api/live/${selectedId}`, token || undefined);
        setSelectedStream(stream);
        setChatMessages(stream.chatMessages.slice().reverse());
        setViewerCount(stream.viewerCount || stream.viewers || 0);
        setFollowed(false);
      } catch { setSelectedStream(null); }
    })();
  }, [selectedId, token]);

  useEffect(() => {
    if (!selectedStream?.id || !token) return;
    const sc = createSocket(token);
    setConnectionState('connecting'); sc.connect(); setSocket(sc);
    sc.on('connect', () => setConnectionState('connected'));
    sc.on('disconnect', () => { setConnectionState('disconnected'); setJoinedStreamId(null); });
    sc.on('viewer_count', ({ streamId, viewers }) => { if (streamId === selectedStream.id) setViewerCount(viewers); });
    sc.on('new_comment', ({ streamId, message }) => { if (streamId === selectedStream.id) setChatMessages(c => [...c, message]); });
    sc.on('stream_ended', ({ streamId }) => {
      if (streamId === selectedStream.id) { fetchStreams(); fetchRecommended(); setSelectedStream(c => c ? { ...c, active: false } : c); }
    });
    const fetchStreams = async () => { try { const d = await apiGet<LiveStreamItem[]>('/api/live?limit=30', token); setStreams(d); } catch {} };
    const fetchRecommended = async () => { try { const d = await apiGet<{ streams: LiveStreamItem[] }>('/api/live/discover?limit=8', token); setRecommended(d.streams); } catch {} };
    sc.on('viewer_joined', ({ streamId }) => { if (streamId === selectedStream.id) setViewerCount(c => c + 1); });
    sc.on('viewer_left', ({ streamId }) => { if (streamId === selectedStream.id) setViewerCount(c => Math.max(0, c - 1)); });
    return () => {
      if (joinedStreamId === selectedStream.id) sc.emit('leave_stream', selectedStream.id);
      sc.disconnect(); setSocket(null); setConnectionState('disconnected'); setJoinedStreamId(null);
    };
  }, [selectedStream?.id, token]);

  useEffect(() => { scrollChatToBottom(); }, [chatMessages]);

  const handleSendMessage = () => {
    if (!socket || !selectedStream || !messageDraft.trim() || joinedStreamId !== selectedStream.id) return;
    socket.emit('send_comment', { streamId: selectedStream.id, comment: messageDraft.trim() });
    setMessageDraft('');
  };

  const handleJoinLive = () => {
    if (!socket || !selectedStream || connectionState !== 'connected') return;
    socket.emit('join_stream', selectedStream.id);
    setJoinedStreamId(selectedStream.id);
  };
  const isJoined = joinedStreamId === selectedStream?.id;
  const handleFollow = async () => {
    if (!selectedStream || !token) return;
    try { await apiPost(`/api/live/${selectedStream.id}/follow`, {}, token); setFollowed(true); } catch {}
  };
  const handleEndStream = async () => {
    if (!selectedStream || !token) return;
    try { await apiPut(`/api/live/${selectedStream.id}/end`, {}, token); } catch {}
  };

  const streamCards = recommended.length ? recommended : filteredStreams.slice(0, 4);

  // Empty state when no streams are available
  const hasStreams = streams.length > 0 || recommended.length > 0;

  if (loading) return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <div className="skeleton rounded-[32px] h-36 w-full" />
        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <SkeletonCard /><div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="glass rounded-[32px] p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Live</p>
              <h1 className="text-3xl font-bold text-white mt-1">Live streams</h1>
              <p className="text-sm text-gray-400 mt-2 max-w-2xl">Watch live broadcasts, chat in real time, and support your favorite creators.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-2.5 transition ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}><Grid size={16} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 transition ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}><List size={16} /></button>
              </div>
              <a href="/live/go-live"><Button variant="primary" size="sm" icon={<Play size={14} />}>Go Live</Button></a>
            </div>
          </div>
        </div>

        {!hasStreams ? (
          /* Beautiful empty state */
          <div className="glass rounded-[32px] p-16 text-center shadow-card">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Tv size={40} className="text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No live broadcasts at the moment</h2>
            <p className="text-gray-400 max-w-md mx-auto mb-8">There are no active streams right now. Be the first to go live or check back later.</p>
            <div className="flex items-center justify-center gap-3">
              <a href="/live/go-live"><Button variant="primary" size="md" icon={<Play size={16} />}>Start Streaming</Button></a>
              <a href="/discover"><Button variant="outline" size="md" icon={<Users size={16} />}>Explore Creators</Button></a>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.8fr_minmax(0,0.95fr)_320px]">
            {/* Main Stream Area */}
            <section className="space-y-6">
              <div className="glass rounded-[28px] p-5 shadow-card">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Now playing</p>
                    <h2 className="text-2xl font-bold text-white mt-1">{selectedStream?.title || 'Select a live stream'}</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300">
                    <Eye size={16} /> {viewerCount.toLocaleString()} viewers
                  </div>
                </div>
                <div className="mt-4 rounded-[24px] overflow-hidden border border-white/10 bg-black/50 shadow-card">
                  <div className="relative aspect-[16/9] bg-black">
                    {selectedStream?.thumbnailUrl ? (
                      <img src={selectedStream.thumbnailUrl} alt={selectedStream.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950">
                        <div className="text-center">
                          <Tv size={48} className="mx-auto mb-3 text-gray-600" />
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Stream preview</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                    {selectedStream?.active && (
                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Live now
                      </div>
                    )}
                    {selectedStream && (
                      <div className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/80 px-3 py-1.5 text-xs text-gray-300">
                        <Users size={12} /> {viewerCount}
                      </div>
                    )}
                  </div>
                </div>
                {selectedStream && (
                  <>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Creator</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-spark flex items-center justify-center text-white font-bold text-xs">
                            {selectedStream.host.username[0].toUpperCase()}
                          </div>
                          <p className="text-lg font-semibold text-white">{selectedStream.host.username}</p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400">Category</p>
                        <p className="mt-2 text-lg font-semibold text-white">{selectedStream.category?.name || 'Live'}</p>
                      </div>
                    </div>
                    <div className="mt-4 glass rounded-[24px] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Stream actions</p>
                          <p className="mt-1 text-sm text-gray-300">{selectedStream.description || 'Join the stream to chat, send gifts, and interact live.'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user?.id === selectedStream.host.id && selectedStream.active ? (
                            <Button variant="danger" size="sm" icon={<StopCircle size={16} />} onClick={handleEndStream}>End stream</Button>
                          ) : selectedStream.active && !isJoined ? (
                            <Button variant="primary" size="sm" icon={<ArrowRight size={16} />} onClick={handleJoinLive} disabled={connectionState !== 'connected'}>Join Live</Button>
                          ) : selectedStream.active && isJoined ? (
                            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                              <CheckCircle2 size={16} /> Joined
                            </div>
                          ) : null}
                          {!user || user.id !== selectedStream.host.id ? (
                            <Button variant="outline" size="sm" icon={<UserPlus size={16} />} onClick={handleFollow} disabled={followed}>
                              {followed ? 'Following' : 'Follow'}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Chat */}
            <section className="space-y-6">
              <div className="glass rounded-[28px] p-5 shadow-card">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Live chat</p>
                    <h2 className="text-lg font-bold text-white">Chat</h2>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[9px] uppercase tracking-[0.2em] ${connectionState === 'connected' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-500/15 text-gray-400'}`}>
                    {connectionState === 'connected' ? 'Connected' : connectionState === 'connecting' ? 'Connecting...' : 'Disconnected'}
                  </span>
                </div>
                <div className="flex flex-col rounded-[24px] border border-white/10 bg-black/40">
                  <div className="max-h-[460px] overflow-y-auto px-4 py-4 text-sm text-gray-300 scrollbar-thin">
                    {!selectedStream ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-black/40 p-6 text-center">
                        <MessageCircle size={24} className="mx-auto mb-2 text-gray-600" />
                        <p className="text-gray-500">Select a stream to view chat</p>
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 bg-black/40 p-6 text-center">
                        <MessageCircle size={24} className="mx-auto mb-2 text-gray-600" />
                        <p className="text-gray-500">No messages yet. Join the stream to chat live.</p>
                      </div>
                    ) : chatMessages.map(msg => (
                      <div key={msg.id} className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between gap-2 text-[10px] text-gray-500">
                          <span className="font-medium text-gray-300">{msg.user.username}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-200">{msg.message}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="border-t border-white/10 p-3">
                    <div className="flex gap-2">
                      <input value={messageDraft} onChange={e => setMessageDraft(e.target.value)} placeholder={isJoined ? "Send a message..." : "Join the stream to chat..."} disabled={!isJoined}
                        className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-[var(--color-spark-pink)] disabled:opacity-50"
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} />
                      <Button variant="primary" size="sm" onClick={handleSendMessage} disabled={!messageDraft.trim() || !socket || !isJoined}>
                        <MessageCircle size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass rounded-[28px] p-5 shadow-card">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-4">Recommended channels</p>
                <div className="space-y-3">
                  {streamCards.map(stream => (
                    <button key={stream.id} onClick={() => setSelectedId(stream.id)} className={`w-full rounded-2xl border p-3 text-left transition ${selectedStream?.id === stream.id ? 'border-[var(--color-spark-pink)]/30 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-spark flex items-center justify-center text-white font-bold text-sm">{stream.host.username[0].toUpperCase()}</div>
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{stream.title}</p><p className="truncate text-xs text-gray-400">{stream.host.username}</p></div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                        <span>{stream.category?.name || 'Live'}</span>
                        <span>{(stream.viewers ?? stream.viewerCount ?? 0).toLocaleString()} viewers</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Sidebar */}
            <aside className="hidden xl:block space-y-6">
              <div className="glass rounded-[28px] p-5 shadow-card">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-4">Categories</p>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)}
                      className={`w-full rounded-2xl px-4 py-2.5 text-left text-sm transition ${categoryFilter === cat ? 'bg-gradient-spark text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass rounded-[28px] p-5 shadow-card">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-4">Following</p>
                <div className="space-y-2">
                  {following.length ? following.map(stream => (
                    <button key={stream.id} onClick={() => setSelectedId(stream.id)} className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2.5 text-left text-sm text-gray-200 hover:bg-white/5 transition">
                      <p className="font-semibold text-white">{stream.host.username}</p>
                      <p className="text-xs text-gray-400">{stream.title}</p>
                    </button>
                  )) : <div className="rounded-2xl border border-dashed border-white/10 bg-black/40 p-4 text-sm text-gray-500 text-center">Follow streamers to see their live rooms here.</div>}
                </div>
              </div>
              {/* Stats overview */}
              <div className="glass rounded-[28px] p-5 shadow-card">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400 mb-4">Overview</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Live now</span>
                    <span className="text-white font-semibold">{streams.filter(s => s.active).length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Categories</span>
                    <span className="text-white font-semibold">{categories.length - 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total viewers</span>
                    <span className="text-white font-semibold">{streams.reduce((acc, s) => acc + (s.viewers ?? s.viewerCount ?? 0), 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Browse all streams section */}
        {hasStreams && (
          <div className="glass rounded-[28px] p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Browse</p>
                <h2 className="text-xl font-bold text-white">All live streams</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.slice(0, 6).map(cat => (
                  <button key={cat} onClick={() => setCategoryFilter(cat)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition ${categoryFilter === cat ? 'bg-gradient-spark text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {filteredStreams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No streams in this category.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-3'}>
                {filteredStreams.map(stream => (
                  viewMode === 'grid' ? (
                    <button key={stream.id} onClick={() => setSelectedId(stream.id)}
                      className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden text-left transition hover:border-white/20 hover:bg-white/5">
                      <div className="relative aspect-video bg-gray-900">
                        {stream.thumbnailUrl ? <img src={stream.thumbnailUrl} alt={stream.title} className="w-full h-full object-cover" /> :
                          <div className="flex items-center justify-center h-full"><Tv size={24} className="text-gray-700" /></div>}
                        {stream.active && <div className="absolute top-2 left-2 rounded-full bg-rose-500 px-2 py-0.5 text-[9px] font-semibold text-white flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE</div>}
                        <div className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] text-gray-300 flex items-center gap-1"><Eye size={10} />{(stream.viewers ?? stream.viewerCount ?? 0).toLocaleString()}</div>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-white truncate">{stream.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{stream.host.username}</p>
                      </div>
                    </button>
                  ) : (
                    <button key={stream.id} onClick={() => setSelectedId(stream.id)}
                      className="w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-left transition hover:bg-white/5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-spark flex items-center justify-center text-white font-bold shrink-0">{stream.host.username[0].toUpperCase()}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{stream.title}</p>
                        <p className="text-xs text-gray-400">{stream.host.username} · {stream.category?.name || 'Live'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Eye size={12} /> {(stream.viewers ?? stream.viewerCount ?? 0).toLocaleString()}
                        {stream.active && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                      </div>
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}