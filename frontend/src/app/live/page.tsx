"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, Gift, Heart, MessageCircle, Play, Share2, Sparkles, StopCircle, UserPlus, Volume2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import { createSocket } from '@/lib/socketClient';
import { Socket } from 'socket.io-client';

interface Category {
  id: string;
  name: string;
  description?: string | null;
}

interface LiveStreamItem {
  id: string;
  title: string;
  description?: string | null;
  category?: Category | null;
  viewers: number;
  viewerCount: number;
  playbackUrl?: string | null;
  thumbnailUrl?: string | null;
  active: boolean;
  host: {
    id: string;
    username: string;
    avatar?: string | null;
  };
}

interface ChatMessage {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar?: string | null;
  };
}

interface StreamDetail extends LiveStreamItem {
  chatMessages: ChatMessage[];
}

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
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const filteredStreams = useMemo(() => {
    if (categoryFilter === 'All') return streams;
    return streams.filter((stream) => stream.category?.name?.toLowerCase() === categoryFilter.toLowerCase());
  }, [categoryFilter, streams]);

  const scrollChatToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchStreams = async () => {
    try {
      const data = await apiGet<LiveStreamItem[]>('/api/live?limit=30', token || undefined);
      setStreams(data);
      if (!selectedId && data.length) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      console.error('Unable to load active streams', err);
    }
  };

  const fetchRecommended = async () => {
    try {
      const result = await apiGet<{ streams: LiveStreamItem[] }>('/api/live/discover?limit=8', token || undefined);
      setRecommended(result.streams);
    } catch (err) {
      console.error('Unable to load discovery streams', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const result = await apiGet<{ name: string }[]>('/api/live/categories', token || undefined);
      setCategories(['All', ...result.map((category) => category.name || '')]);
    } catch (err) {
      console.error('Unable to load live categories', err);
    }
  };

  const fetchFollowingStreams = async () => {
    if (!token) return;
    try {
      const result = await apiGet<{ streams: LiveStreamItem[] }>('/api/live/following', token);
      setFollowing(result.streams);
    } catch (err) {
      console.error('Unable to load following streams', err);
    }
  };

  const fetchSelectedStream = async (streamId: string) => {
    try {
      const stream = await apiGet<StreamDetail>(`/api/live/${streamId}`, token || undefined);
      setSelectedStream(stream);
      setChatMessages(stream.chatMessages.slice().reverse());
      setViewerCount(stream.viewerCount || stream.viewers || 0);
      setFollowed(false);
    } catch (err) {
      console.error('Unable to load stream details', err);
      setSelectedStream(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchStreams(), fetchRecommended(), fetchCategories(), fetchFollowingStreams()]);
    };
    init();
  }, [token]);

  useEffect(() => {
    if (!selectedId) return;
    fetchSelectedStream(selectedId);
  }, [selectedId, token]);

  useEffect(() => {
    if (!selectedStream?.id || !token) return;

    const socketClient = createSocket(token);
    setConnectionState('connecting');
    socketClient.connect();
    setSocket(socketClient);

    socketClient.on('connect', () => {
      setConnectionState('connected');
    });

    socketClient.on('disconnect', () => {
      setConnectionState('disconnected');
      setJoinedStreamId(null);
    });

    socketClient.on('viewer_count', ({ streamId, viewers }) => {
      if (streamId === selectedStream.id) {
        setViewerCount(viewers);
      }
    });

    socketClient.on('new_comment', ({ streamId, message }) => {
      if (streamId === selectedStream.id) {
        setChatMessages((current) => [...current, message]);
      }
    });

    socketClient.on('stream_ended', ({ streamId }) => {
      if (streamId === selectedStream.id) {
        fetchStreams();
        fetchRecommended();
        setSelectedStream((current) => (current ? { ...current, active: false } : current));
      }
    });

    socketClient.on('viewer_joined', ({ streamId }) => {
      if (streamId === selectedStream.id) {
        setViewerCount((current) => current + 1);
      }
    });

    socketClient.on('viewer_left', ({ streamId }) => {
      if (streamId === selectedStream.id) {
        setViewerCount((current) => Math.max(0, current - 1));
      }
    });

    return () => {
      if (joinedStreamId === selectedStream.id) {
        socketClient.emit('leave_stream', selectedStream.id);
      }
      socketClient.disconnect();
      setSocket(null);
      setConnectionState('disconnected');
      setJoinedStreamId(null);
    };
  }, [selectedStream?.id, token]);

  useEffect(() => {
    scrollChatToBottom();
  }, [chatMessages]);

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
    try {
      await apiPost(`/api/live/${selectedStream.id}/follow`, {}, token);
      setFollowed(true);
    } catch (err) {
      console.error('Unable to follow streamer', err);
    }
  };

  const handleEndStream = async () => {
    if (!selectedStream || !token) return;
    try {
      await apiPut(`/api/live/${selectedStream.id}/end`, {}, token);
      fetchStreams();
      fetchRecommended();
      setSelectedStream((current) => (current ? { ...current, active: false } : current));
    } catch (err) {
      console.error('Unable to end stream', err);
    }
  };

  const activeViewers = viewerCount.toLocaleString();
  const streamCards = recommended.length ? recommended : filteredStreams.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#09090f] pb-10 text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-8 lg:px-6 xl:px-8">
        <div className="mb-8 grid gap-6 xl:grid-cols-[1.3fr_auto]">
          <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Live dashboard</p>
            <h1 className="mt-3 text-4xl font-bold text-white">Go live, watch live, and chat in real time.</h1>
            <p className="mt-4 max-w-2xl text-sm text-slate-300">Browse trending channels, join creator broadcasts, and keep your connection in sync with viewer counts and live chat.</p>
          </div>
          <div className="rounded-[36px] border border-white/10 bg-black/50 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.2)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Creator tools</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-3xl bg-white/5 p-4">
                <p className="text-sm text-slate-300">Start a new broadcast and manage your live room from the desktop app.</p>
              </div>
              <a href="/live/go-live" className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 transition hover:brightness-110">
                <Play size={18} /> Go Live now
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.8fr_minmax(0,0.95fr)_320px]">
          <section className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-black/50 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Featured stream</p>
                  <h2 className="mt-2 text-3xl font-bold text-white">{selectedStream?.title || 'Select a live stream'}</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">
                  <Eye size={18} /> {activeViewers} viewers
                </div>
              </div>
              <div className="mt-6 rounded-[32px] overflow-hidden border border-white/10 bg-slate-950 shadow-[0_30px_70px_rgba(0,0,0,0.25)]">
                <div className="relative aspect-[16/9] bg-black">
                  {selectedStream?.thumbnailUrl ? (
                    <img src={selectedStream.thumbnailUrl} alt={selectedStream.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-slate-500">
                      <div className="text-center text-sm uppercase tracking-[0.3em] text-slate-400">Live player coming online</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
                  <div className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white">
                    <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> Live now
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Creator</p>
                  <p className="mt-3 text-xl font-semibold text-white">{selectedStream?.host.username || 'SparkLive creator'}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Category</p>
                  <p className="mt-3 text-xl font-semibold text-white">{selectedStream?.category?.name || 'Live'}</p>
                </div>
              </div>

              <div className="mt-6 rounded-[32px] border border-white/10 bg-black/40 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Stream details</p>
                    <p className="mt-3 text-sm text-slate-300">{selectedStream?.description || 'This stream is being broadcast live with chat, gifts, and live discovery support.'}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {user?.id === selectedStream?.host.id && selectedStream?.active ? (
                      <button onClick={handleEndStream} className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                        <StopCircle size={18} /> End stream
                      </button>
                    ) : (
                      <a href="/live/go-live" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">
                        <Play size={18} /> Start your stream
                      </a>
                    )}
                    {selectedStream?.active && !isJoined && (
                      <button onClick={handleJoinLive} disabled={connectionState !== 'connected'} className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                        <ArrowRight size={18} /> Join Live
                      </button>
                    )}
                    {selectedStream?.active && isJoined && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white">
                        <CheckCircle2 size={18} /> Joined
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2 text-slate-400"><Volume2 size={16} /> HLS-ready architecture</div>
                    <p className="mt-3 text-xs">Playback path is prepared for stream orchestration and future HLS ingestion.</p>
                  </div>
                  <div className="rounded-3xl bg-white/5 p-4 text-sm text-slate-300">
                    <div className="flex items-center gap-2 text-slate-400"><UserPlus size={16} /> Follow creator</div>
                    <button onClick={handleFollow} disabled={followed} className="mt-3 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                      {followed ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-black/40 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Live chat</p>
                  <h2 className="text-2xl font-bold text-white">Realtime chatroom</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {connectionState === 'connected' ? 'Socket connected' : connectionState === 'connecting' ? 'Connecting...' : 'Socket disconnected'}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {isJoined ? 'Joined stream' : 'Not joined'}
                  </span>
                </div>
              </div>
              <div className="mt-5 flex flex-col rounded-[28px] border border-white/10 bg-slate-950/90">
                <div className="max-h-[520px] overflow-y-auto px-4 py-4 text-sm text-slate-300">
                  {chatMessages.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-6 text-center text-slate-400">No messages yet. Join the stream to chat live.</div>
                  ) : (
                    chatMessages.map((message) => (
                      <div key={message.id} className="mb-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
                          <span>{message.user.username}</span>
                          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="mt-3 text-slate-200">{message.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="border-t border-white/10 p-4">
                  <div className="grid gap-3">
                    <textarea
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      rows={4}
                      placeholder="Send a message to the stream"
                      className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-fuchsia-500"
                    />
                    <button onClick={handleSendMessage} disabled={!messageDraft.trim() || !socket} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">
                      <MessageCircle size={18} /> Send chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Recommended channels</p>
              <div className="mt-5 space-y-4">
                {streamCards.map((stream) => (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedId(stream.id)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      selectedStream?.id === stream.id ? 'border-gradient-spark bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-[var(--color-spark-pink)] to-[var(--color-spark-purple)]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{stream.title}</p>
                        <p className="truncate text-xs text-slate-400">{stream.host.username}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{stream.category?.name || 'Live'}</span>
                      <span>{stream.viewers.toLocaleString()} viewers</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="hidden xl:block space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-black/40 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Categories</p>
              <div className="mt-5 grid gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`w-full rounded-3xl px-4 py-3 text-left text-sm text-white transition ${
                      categoryFilter === category ? 'bg-gradient-to-r from-fuchsia-500 to-indigo-500' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Following</p>
              <div className="mt-5 space-y-3">
                {following.length ? (
                  following.map((stream) => (
                    <button key={stream.id} onClick={() => setSelectedId(stream.id)} className="w-full rounded-3xl border border-white/10 bg-black/40 px-4 py-3 text-left text-sm text-slate-200 hover:bg-white/5 transition">
                      <p className="font-semibold text-white">{stream.host.username}</p>
                      <p className="text-xs text-slate-400">{stream.title}</p>
                    </button>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/10 bg-black/40 p-4 text-sm text-slate-400">Follow streamers to see their live rooms here.</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
