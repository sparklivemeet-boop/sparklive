'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import {
  MessageCircle, Search, Plus, Phone, Video, MoreHorizontal,
  Send, Smile, Paperclip, Mic, Image, Check, CheckCheck,
  Loader2, Users, Hash, Pin, Bell, BellOff, ArrowLeft,
  Trash2, Edit3, X, UserPlus, UserCheck, Group, Globe,
  Lock, Camera, ChevronDown, ChevronUp, Pencil, Menu,
  Twitter, Github, Instagram, Youtube, Linkedin, Sparkles,
  User, LogOut, Settings, HelpCircle, Bookmark, Gift, Crown,
  BarChart3, Wallet, Compass, Home, Radio, Film, Bell as BellIcon,
} from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';

interface Conversation {
  id: string;
  type: 'private' | 'group' | 'channel';
  name: string;
  avatar?: string;
  lastMessage?: {
    text: string;
    sender: string;
    timestamp: string;
    read: boolean;
  };
  unread: number;
  online: boolean;
  pinned?: boolean;
  muted?: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: { id: string; username: string; avatar?: string; };
  timestamp: string;
  read: boolean;
  isOwn: boolean;
}

export default function MessagesPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [showFab, setShowFab] = useState(false);
  const [fabExpanded, setFabExpanded] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close FAB when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>('/api/messages', token).catch(() => ({ conversations: [] }));
      const convList = Array.isArray(data) ? data : data?.conversations ?? data?.data ?? [];
      const normalizedConversations = convList.map((conv: any) => ({
        id: conv.id,
        type: conv.isGroup ? 'group' : 'private',
        name: conv.name || conv.partner?.username || 'Conversation',
        avatar: conv.partner?.avatar || conv.avatar,
        lastMessage: conv.lastMessage ? {
          text: conv.lastMessage.content ?? conv.lastMessage.text ?? '',
          sender: conv.lastMessage.sender?.username ?? 'Unknown',
          timestamp: conv.lastMessage.createdAt ?? conv.lastMessage.timestamp,
          read: conv.lastMessage.read ?? false,
        } : undefined,
        unread: conv.unreadCount ?? conv.unread ?? 0,
        online: Boolean(conv.partner?.isOnline ?? conv.online),
      }));
      setConversations(normalizedConversations);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!token) return;
    try {
      const data = await apiGet<any>(`/api/messages/${conversationId}`, token).catch(() => ({ messages: [] }));
      const msgList = Array.isArray(data) ? data : data?.messages ?? data?.data ?? [];
      setMessages(msgList);
    } catch { /* silently fail */ }
  }, [token]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setShowMobileList(false);
    fetchMessages(id);
  };

  const handleNewGroup = () => {
    setFabExpanded(false);
    showToast?.({ type: 'info', title: 'New Group', message: 'Creating a new group...' });
  };

  const handleNewChannel = () => {
    setFabExpanded(false);
    showToast?.({ type: 'info', title: 'New Channel', message: 'Creating a new channel...' });
  };

  const handleNewChat = () => {
    setFabExpanded(false);
    showToast?.({ type: 'info', title: 'New Chat', message: 'Starting a new conversation...' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeConv = conversations.find(c => c.id === activeConversation);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
            <Loader2 size={24} className="text-white/40 animate-spin" />
          </div>
          <p className="text-sm text-white/30">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Loader2 size={24} className="text-red-400" />
        </div>
        <h3 className="text-white/50 font-medium text-lg mb-1">Failed to load messages</h3>
        <p className="text-white/30 text-sm mb-4">{error}</p>
        <button onClick={fetchConversations} className="btn-primary text-sm">Try Again</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.02] relative"
    >
      {/* Conversation List */}
      <div className={cn(
        'w-full lg:w-[360px] border-r border-white/[0.06] flex flex-col shrink-0',
        !showMobileList && 'hidden lg:flex'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7c3aed] flex items-center justify-center">
              <MessageCircle size={16} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">Messages</h2>
          </div>
          <button
            onClick={() => setFabExpanded(!fabExpanded)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.05] transition"
          >
            <Pencil size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageCircle size={28} className="text-white/10 mb-3" />
              <p className="text-sm text-white/30">No conversations yet</p>
              <p className="text-xs text-white/20 mt-1">Start a new conversation</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 transition-all text-left',
                  activeConversation === conv.id
                    ? 'bg-white/[0.04] border-l-2 border-[#ff007f]'
                    : 'hover:bg-white/[0.02] border-l-2 border-transparent'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar src={conv.avatar} alt={conv.name} size="md" />
                  {conv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0a0f]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white truncate">{conv.name}</p>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-gray-500 shrink-0 ml-2">
                        {new Date(conv.lastMessage.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {conv.lastMessage ? (
                      <p className="text-xs text-gray-500 truncate flex-1">
                        {conv.lastMessage.read ? (
                          <CheckCheck size={10} className="inline mr-1 text-[#06f7ff]" />
                        ) : (
                          <Check size={10} className="inline mr-1 text-gray-500" />
                        )}
                        {conv.lastMessage.text}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">No messages yet</p>
                    )}
                    {conv.unread > 0 && (
                      <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-[9px] font-bold text-white flex items-center justify-center px-1">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn(
        'flex-1 flex flex-col',
        showMobileList && 'hidden lg:flex'
      )}>
        {activeConversation && activeConv ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="lg:hidden p-1 text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={18} />
                </button>
                <Avatar src={activeConv.avatar} alt={activeConv.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold text-white">{activeConv.name}</p>
                  <p className="text-[10px] text-emerald-400">
                    {activeConv.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="btn-icon w-8 h-8"><Phone size={15} /></button>
                <button className="btn-icon w-8 h-8"><Video size={15} /></button>
                <button className="btn-icon w-8 h-8"><MoreHorizontal size={15} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle size={32} className="text-white/10 mb-3" />
                  <p className="text-sm text-white/30">No messages yet</p>
                  <p className="text-xs text-white/20 mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.isOwn ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[75%]', msg.isOwn ? 'order-1' : 'order-1')}>
                      {!msg.isOwn && (
                        <div className="flex items-center gap-2 mb-1 ml-1">
                          <span className="text-[10px] text-gray-500">{msg.sender.username}</span>
                        </div>
                      )}
                      <div className={cn(
                        'px-4 py-2.5 text-sm leading-relaxed',
                        msg.isOwn
                          ? 'rounded-2xl rounded-br-md bg-gradient-to-r from-[#ff007f] to-[#7c3aed] text-white'
                          : 'rounded-2xl rounded-bl-md bg-white/[0.06] text-white'
                      )}>
                        {msg.text}
                      </div>
                      <div className={cn('flex items-center gap-1 mt-0.5', msg.isOwn ? 'justify-end mr-1' : 'justify-start ml-1')}>
                        <span className="text-[9px] text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.isOwn && (
                          msg.read ? <CheckCheck size={10} className="text-[#06f7ff]" /> : <Check size={10} className="text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-4 py-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <button className="btn-icon w-9 h-9 shrink-0"><Paperclip size={16} /></button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-2.5 px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && messageInput.trim()) {
                        setMessageInput('');
                      }
                    }}
                  />
                </div>
                <button className="btn-icon w-9 h-9 shrink-0"><Smile size={16} /></button>
                <button
                  onClick={() => { if (messageInput.trim()) setMessageInput(''); }}
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
                    messageInput.trim()
                      ? 'bg-gradient-to-r from-[#ff007f] to-[#7c3aed] text-white shadow-lg shadow-[#ff007f]/20'
                      : 'text-gray-500'
                  )}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff007f]/10 to-[#7c3aed]/10 border border-[#ff007f]/15 flex items-center justify-center mb-5">
              <MessageCircle size={36} className="text-[#ff007f]/30" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Your Messages</h3>
            <p className="text-sm text-white/30 max-w-sm">
              Select a conversation or start a new one to begin chatting
            </p>
          </div>
        )}
      </div>

      {/* ===== TELEGRAM-STYLE FLOATING ACTION BUTTON ===== */}
      <div ref={fabRef} className="fixed bottom-24 lg:bottom-8 right-6 z-50">
        <AnimatePresence>
          {fabExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-20 right-0 w-72 rounded-2xl bg-[#0e0e16]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
            >
              {/* Search Bar */}
              <div className="p-3 border-b border-white/[0.06]">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
                    autoFocus
                  />
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 space-y-0.5">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00d8ff]/20 to-[#3b82f6]/20 border border-[#00d8ff]/20 flex items-center justify-center shrink-0">
                    <UserPlus size={16} className="text-[#00d8ff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">New Chat</p>
                    <p className="text-[10px] text-white/40">Start a private conversation</p>
                  </div>
                </button>

                <button
                  onClick={handleNewGroup}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Users size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">New Group</p>
                    <p className="text-[10px] text-white/40">Create a group conversation</p>
                  </div>
                </button>

                <button
                  onClick={handleNewChannel}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Hash size={16} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">New Channel</p>
                    <p className="text-[10px] text-white/40">Broadcast to your audience</p>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          onClick={() => setFabExpanded(!fabExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
            fabExpanded
              ? 'bg-red-500 shadow-red-500/30 rotate-45'
              : 'bg-gradient-to-r from-[#ff007f] to-[#7a00cc] shadow-[#ff007f]/30'
          )}
        >
          <motion.div
            animate={{ rotate: fabExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={24} className="text-white" />
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
}