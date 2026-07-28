'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useMediaDevices } from '@/lib/hooks/useMediaDevices';
import { useLiveKit, getLiveKitToken } from '@/lib/hooks/useLiveKit';
import { apiPost } from '@/lib/apiClient';
import { LiveKitRoom, VideoTrack, ParticipantLoop } from '@livekit/components-react';
import {
  Radio, Camera, CameraOff, Mic, MicOff, Monitor, MonitorOff,
  Settings, X, ChevronDown, Users, MessageCircle, Gift, Heart,
  Sparkles, Loader2, AlertTriangle, ArrowLeft, Maximize2,
  Minimize2, ScreenShare, ScreenShareOff, Star, Send
} from 'lucide-react';
import '@livekit/components-styles';

export default function LiveStudioPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const media = useMediaDevices();
  const liveKit = useLiveKit();

  const [step, setStep] = useState<'setup' | 'preview' | 'live'>('setup');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Just Chatting');
  const [description, setDescription] = useState('');
  const [streamId, setStreamId] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState<'camera' | 'mic' | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [reactions, setReactions] = useState<{ emoji: string; id: number }[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [giftAnimation, setGiftAnimation] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const durationInterval = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const reactionIdRef = useRef(0);

  const categories = [
    'Just Chatting', 'Music', 'Travel', 'Lifestyle', 'Gaming',
    'Education', 'Technology', 'Sports', 'ASMR', 'Art',
    'Cooking', 'Dancing', 'Fitness', 'News', 'Politics',
    'Science', 'Religion', 'DIY', 'Outdoors', 'Other'
  ];

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
    };

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, streamId]);

  // Duration counter
  useEffect(() => {
    if (step === 'live') {
      durationInterval.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => {
      if (durationInterval.current) clearInterval(durationInterval.current);
    };
  }, [step]);

  // Display camera preview
  useEffect(() => {
    if (media.stream && videoRef.current) {
      videoRef.current.srcObject = media.stream;
    }
  }, [media.stream]);

  const handleStartStream = async () => {
    if (!token || !title.trim()) return;

    try {
      // Start media if not already started
      if (!media.stream) {
        await media.startMedia();
      }

      // Create stream on backend
      const data = await apiPost<any>('/api/live/start', {
        title: title.trim(),
        category,
        description,
        allowGifts: true,
        language: 'en',
      }, token);

      const newStreamId = data.stream?.id || data.id;
      setStreamId(newStreamId);

      // Get LiveKit token and connect
      const liveKitToken = await getLiveKitToken(newStreamId, token || '', 'host');
      await liveKit.connect(liveKitToken, data.stream?.liveKitRoom || '');

      setStep('live');
    } catch (err: any) {
      console.error('Failed to start stream:', err);
    }
  };

  const handleEndStream = async () => {
    if (!token || !streamId) return;

    try {
      await apiPost(`/api/live/${streamId}/end`, {}, token);
    } catch (err) {
      console.error('Error ending stream:', err);
    }

    liveKit.disconnect();
    media.stopMedia();
    router.push('/live');
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const sendChat = () => {
    if (!chatInput.trim() || !streamId || !socketRef.current) return;
    socketRef.current.emit('send_comment', { streamId, comment: chatInput.trim() });
    setChatInput('');
  };

  const sendReaction = (emoji: string) => {
    if (!streamId || !socketRef.current) return;
    socketRef.current.emit('reaction', { streamId, emoji });
  };

  const reactionEmojis = ['❤️', '🔥', '👏', '😂', '😍', '🎉'];

  // Setup Step - Configure Stream
  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-[#09090f] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview */}
            <div className="space-y-4">
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-black/60 border border-white/10">
                {media.stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                      <Radio size={32} className="text-white/30" />
                    </div>
                    <p className="text-white/40 text-sm">Camera preview will appear here</p>
                  </div>
                )}

                {/* Preview overlay */}
                {media.stream && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-medium">LIVE</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Media Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={media.toggleVideo}
                  className={`p-3 rounded-2xl transition-all ${
                    media.isVideoOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {media.isVideoOn ? <Camera size={20} /> : <CameraOff size={20} />}
                </button>
                <button
                  onClick={media.toggleAudio}
                  className={`p-3 rounded-2xl transition-all ${
                    media.isAudioOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {media.isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button
                  onClick={() => media.startMedia()}
                  disabled={media.isLoading}
                  className="p-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {media.isLoading ? <Loader2 size={20} className="animate-spin" /> : <Radio size={20} />}
                </button>
              </div>

              {/* Device Selector */}
              {media.videoDevices.length > 0 && (
                <div className="relative">
                  <select
                    onChange={(e) => media.switchCamera(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500"
                  >
                    {media.videoDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error Display */}
              {media.error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-300">Camera/Microphone Error</p>
                      <p className="text-xs text-red-400/80 mt-1">{media.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Setup */}
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold mb-1">Go Live</h1>
                <p className="text-sm text-white/40">Set up your stream before going live</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">
                    Stream Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your stream..."
                    maxLength={120}
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-fuchsia-500 transition-colors"
                  />
                  <p className="text-xs text-white/30 mt-1 text-right">{title.length}/120</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-fuchsia-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers what your stream is about..."
                    rows={3}
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none focus:border-fuchsia-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Go Live Button */}
              <button
                onClick={handleStartStream}
                disabled={!title.trim() || media.isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white font-bold text-lg shadow-lg shadow-[#ff007f]/20 hover:shadow-[#ff007f]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
              >
                <div className="flex items-center justify-center gap-2">
                  <Radio size={20} />
                  <span>Go Live</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live Stream UI
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold text-red-400">LIVE</span>
          </div>
          <span className="text-sm font-medium text-white/80">{formatDuration(duration)}</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10">
            <Users size={14} className="text-white/60" />
            <span className="text-xs font-medium">{viewerCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={handleEndStream}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
          >
            End Stream
          </button>
        </div>
      </div>

      {/* Main Video */}
      <div className="w-full h-screen relative">
        <LiveKitRoom
          token={liveKit.token || ''}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || 'ws://localhost:7880'}
          connect={true}
          video={true}
          audio={true}
          style={{ width: '100%', height: '100%' }}
        >
          <div className="w-full h-full bg-black">
            <ParticipantLoop>
              <VideoTrack />
            </ParticipantLoop>
          </div>
        </LiveKitRoom>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={liveKit.toggleCamera}
                className={`p-3 rounded-xl transition-all ${
                  liveKit.isCameraOn ? 'bg-white/15 hover:bg-white/25' : 'bg-red-500/30 text-red-400'
                }`}
              >
                {liveKit.isCameraOn ? <Camera size={18} /> : <CameraOff size={18} />}
              </button>
              <button
                onClick={liveKit.toggleMicrophone}
                className={`p-3 rounded-xl transition-all ${
                  liveKit.isMicrophoneOn ? 'bg-white/15 hover:bg-white/25' : 'bg-red-500/30 text-red-400'
                }`}
              >
                {liveKit.isMicrophoneOn ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              <button
                onClick={liveKit.screenShare}
                className={`p-3 rounded-xl transition-all ${
                  liveKit.isScreenSharing ? 'bg-emerald-500/30 text-emerald-400' : 'bg-white/15 hover:bg-white/25'
                }`}
              >
                <Monitor size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {reactionEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendReaction(emoji)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg transition-all hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Reactions */}
        <div className="absolute bottom-24 right-4 space-y-2 pointer-events-none">
          <AnimatePresence>
            {reactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: -20, scale: 1 }}
                exit={{ opacity: 0, y: -60 }}
                transition={{ duration: 1.5 }}
                className="text-3xl"
              >
                {r.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Chat Overlay */}
        <div className="absolute bottom-20 left-4 w-80 max-h-80 overflow-y-auto space-y-1 pointer-events-none">
          {chatMessages.slice(-50).map((msg, i) => (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-sm"
            >
              <span className="text-xs font-bold text-fuchsia-400">{msg.user?.username || 'User'}</span>
              <span className="text-xs text-white/80 ml-2">{msg.message}</span>
            </motion.div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-2xl border border-white/10 p-2">
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
              className="p-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-white disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Gift Animation */}
        <AnimatePresence>
          {giftAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <div className="text-center">
                <div className="text-6xl mb-2">🎁</div>
                <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-sm">
                  <p className="text-white font-bold text-lg">{giftAnimation.amount} coins</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}