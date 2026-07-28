'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useLiveKit, getLiveKitToken } from '@/lib/hooks/useLiveKit';
import { apiGet, apiPost } from '@/lib/apiClient';
import {
  LiveKitRoom, VideoTrack, ParticipantLoop, ParticipantName,
  useTracks, useParticipants, useRemoteParticipants
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import {
  Heart, MessageCircle, Gift, Share2, UserPlus, Users,
  Radio, Loader2, AlertTriangle, Send, ChevronDown, X,
  Volume2, VolumeX, Maximize2, Minimize2, Flag, Ban
} from 'lucide-react';
import '@livekit/components-styles';

export default function WatchStreamPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const streamId = params.streamId as string;

  const [stream, setStream] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [reactions, setReactions] = useState<{ emoji: string; id: number }[]>([]);
  const [giftAnimation, setGiftAnimation] = useState<any>(null);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<any>(null);
  const reactionIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch stream data
  useEffect(() => {
    if (!token || !streamId) return;

    const fetchStream = async () => {
      try {
        const data = await apiGet<any>(`/api/live/${streamId}`, token);
        setStream(data);
        setIsLive(data?.active && data?.status === 'LIVE');
        setViewerCount(data?.viewerCount || 0);
        setLikes(data?.likes || 0);

        // Get LiveKit token for viewer
        if (data?.liveKitRoom) {
          const lkToken = await getLiveKitToken(streamId, token, 'viewer');
          setLiveKitToken(lkToken);
        }
      } catch (err: any) {
        setError(err.message || 'Stream not found');
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
  }, [token, streamId]);

  // Connect to socket
  useEffect(() => {
    if (!token || !streamId) return;

    const initSocket = async () => {
      const { io } = await import('socket.io-client');
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join_stream', streamId);
      });

      socket.on('viewer_count', (data: any) => {
        setViewerCount(data.viewers);
      });

      socket.on('new_comment', (data: any) => {
        setChatMessages(prev => [...prev, data.message]);
      });

      socket.on('gift_received', (data: any) => {
        setGiftAnimation(data.transaction);
        setTimeout(() => setGiftAnimation(null), 3000);
      });

      socket.on('reaction', (data: any) => {
        const id = reactionIdRef.current++;
        setReactions(prev => [...prev, { emoji: data.emoji, id }]);
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== id));
        }, 2000);
      });

      socket.on('stream_ended', () => {
        setIsLive(false);
      });

      socket.on('stream_error', (data: any) => {
        setConnectionError(data.error);
      });
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_stream', streamId);
        socketRef.current.disconnect();
      }
    };
  }, [token, streamId]);

  const sendChat = () => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('send_comment', { streamId, comment: chatInput.trim() });
    setChatInput('');
  };

  const sendReaction = (emoji: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit('reaction', { streamId, emoji });
  };

  const handleLike = async () => {
    if (!token || !streamId) return;
    try {
      await apiPost(`/api/live/${streamId}/like`, {}, token);
      setLikes(l => hasLiked ? l - 1 : l + 1);
      setHasLiked(!hasLiked);
    } catch {}
  };

  const handleFollow = async () => {
    if (!token || !streamId) return;
    try {
      await apiPost(`/api/live/${streamId}/follow`, {}, token);
      setIsFollowing(!isFollowing);
    } catch {}
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const reactionEmojis = ['❤️', '🔥', '👏', '😂', '😍', '🎉'];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-fuchsia-500 mx-auto mb-4" />
          <p className="text-white/60">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={36} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Stream Not Available</h2>
          <p className="text-sm text-white/40 mb-6">{error || 'This stream could not be found or has ended.'}</p>
          <button
            onClick={() => router.push('/live')}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white font-bold"
          >
            Browse Live Streams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white">
      {/* Stream Video */}
      <div className="relative w-full aspect-video lg:aspect-auto lg:h-[70vh] bg-black">
        {liveKitToken && isLive ? (
          <LiveKitRoom
            token={liveKitToken}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880'}
            connect={true}
            video={true}
            audio={!isMuted}
            style={{ width: '100%', height: '100%' }}
          >
            <div className="w-full h-full">
              <ParticipantLoop>
                <VideoTrack />
              </ParticipantLoop>
            </div>
          </LiveKitRoom>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
            {!isLive ? (
              <>
                <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mb-4">
                  <Radio size={36} className="text-white/20" />
                </div>
                <p className="text-white/40 text-lg font-medium">Stream has ended</p>
              </>
            ) : (
              <>
                <Loader2 size={36} className="animate-spin text-fuchsia-500 mb-4" />
                <p className="text-white/60">Connecting to stream...</p>
              </>
            )}
          </div>
        )}

        {/* Stream Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/live')}
                className="p-2 rounded-xl bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
              >
                <X size={18} />
              </button>
              {isLive && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-red-400">LIVE</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
                <Users size={14} className="text-white/60" />
                <span className="text-xs font-medium">{viewerCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Stream Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {stream.host?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold truncate">{stream.host?.username || 'Streamer'}</h2>
                {stream.host?.verified && (
                  <svg className="w-4 h-4 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-white/60 truncate">{stream.title}</p>
            </div>
            <button
              onClick={handleFollow}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isFollowing
                  ? 'bg-white/10 text-white/60'
                  : 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Floating Reactions */}
        <div className="absolute top-1/2 right-4 space-y-2 pointer-events-none">
          <AnimatePresence>
            {reactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, x: 20, scale: 0.5 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, y: -40 }}
                transition={{ duration: 1.5 }}
                className="text-3xl"
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Gift Animation */}
        <AnimatePresence>
          {giftAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5, y: -100 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <div className="text-center">
                <div className="text-7xl mb-3">🎁</div>
                <div className="px-8 py-3 rounded-2xl bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm shadow-2xl">
                  <p className="text-white font-bold text-xl">{giftAnimation.amount} coins</p>
                  <p className="text-white/80 text-sm">from {giftAnimation.senderName || 'Anonymous'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-70vh)]">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-[#0a0a0f] border-t border-white/5">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle size={32} className="text-white/10 mb-3" />
                <p className="text-white/30 text-sm">No messages yet</p>
                <p className="text-white/20 text-xs">Be the first to say something!</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-purple-600/30 flex items-center justify-center text-[10px] font-bold text-fuchsia-300 shrink-0">
                    {msg.user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-fuchsia-400">{msg.user?.username || 'User'}</span>
                    <span className="text-xs text-white/70 ml-1.5">{msg.message}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-2 bg-white/5 rounded-2xl border border-white/10 p-1.5">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Send a message..."
                className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/30"
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white disabled:opacity-50 transition-opacity"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 p-4 bg-[#0a0a0f] border-t border-white/5 lg:border-t-0 lg:border-l">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                hasLiked ? 'bg-red-500/20 text-red-400' : 'bg-white/5 hover:bg-white/10 text-white/60'
              }`}
            >
              <Heart size={20} className={hasLiked ? 'fill-red-400' : ''} />
              <span className="text-[10px] font-medium">{likes}</span>
            </button>
            <button
              onClick={() => setShowGiftMenu(!showGiftMenu)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 transition-all"
            >
              <Gift size={20} />
              <span className="text-[10px] font-medium">Gift</span>
            </button>
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 transition-all">
              <Share2 size={20} />
              <span className="text-[10px] font-medium">Share</span>
            </button>
          </div>

          {/* Reaction Buttons */}
          <div className="flex items-center gap-1.5 ml-2">
            {reactionEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-base transition-all hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Connection Error */}
      {connectionError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-2xl bg-red-500/20 border border-red-500/30 backdrop-blur-sm">
            <p className="text-xs text-red-300">{connectionError}</p>
          </div>
        </div>
      )}
    </div>
  );
}