"use client";

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, MessageCircle, Send, Phone, Video, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';
import Button from '@/components/ui/Button';

interface ConversationSummary {
  id: string;
  isGroup: boolean;
  name: string | null;
  partner: { id: string; username: string; avatar?: string | null; bio?: string | null; } | null;
  lastMessage: { id: string; content: string; createdAt: string; sender: { id: string; username: string }; } | null;
  unreadCount: number;
  updatedAt: string;
}

export default function Messages() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token || !user) return;
      try {
        const data = await apiGet<ConversationSummary[]>('/api/messages', token);
        setConversations(data);
        setSelectedId(data[0]?.id ?? null);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      } finally { setLoading(false); }
    };
    fetchConversations();
  }, [token, user]);

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedId) ?? conversations[0] ?? null,
    [conversations, selectedId]
  );

  const filteredConversations = useMemo(
    () => conversations.filter(c => (c.name || c.partner?.username || '').toLowerCase().includes(searchQuery.toLowerCase())),
    [conversations, searchQuery]
  );

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="space-y-6">
        <div className="glass rounded-[32px] p-6 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Messenger</p>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mt-1">Messages</h1>
              <p className="text-sm text-gray-400 mt-1">Real-time messaging with typing indicators and read receipts.</p>
            </div>
            <Button variant="primary" size="sm" icon={<Plus size={16} />}>New conversation</Button>
          </div>
        </div>

        <div className="glass rounded-[32px] p-6 shadow-card">
          <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Conversations</p>
                  <h2 className="text-xl font-bold text-white">Chats</h2>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)] transition" />
              </div>
              <div className="space-y-2 rounded-[24px] border border-white/10 bg-black/40 p-2 max-h-[600px] overflow-y-auto scrollbar-thin">
                {loading ? <div className="p-6 text-center text-gray-500">Loading conversations...</div>
                : filteredConversations.length === 0 ? (
                  <div className="p-10 text-center">
                    <MessageCircle size={36} className="mx-auto mb-3 text-gray-600" />
                    <p className="text-sm font-medium text-gray-400">No conversations yet</p>
                    <p className="text-xs text-gray-500 mt-1">Start a new chat to connect with others.</p>
                    <Button variant="primary" size="sm" icon={<Plus size={14} />} className="mt-4">Start Chat</Button>
                  </div>
                ) : filteredConversations.map(conv => {
                  const partner = conv.partner;
                  const isActive = selectedConversation?.id === conv.id;
                  return (
                    <button key={conv.id} onClick={() => setSelectedId(conv.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${isActive ? 'border-[var(--color-spark-pink)]/30 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-spark flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {(partner?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-white">{conv.name || partner?.username || 'New conversation'}</h3>
                          <p className="truncate text-xs text-gray-400">{conv.lastMessage?.content || 'No messages yet'}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-500">
                        <span>{conv.unreadCount > 0 && <span className="rounded-full bg-gradient-spark px-2 py-0.5 text-[9px] font-semibold text-white">{conv.unreadCount}</span>}</span>
                        <span>{conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-gray-400">Active chat</p>
                  <h2 className="text-xl font-bold text-white">{selectedConversation?.name || selectedConversation?.partner?.username || 'Select a conversation'}</h2>
                </div>
                <div className="flex gap-1">
                  <button className="rounded-full bg-white/5 p-2.5 text-gray-400 hover:text-white hover:bg-white/10 transition"><Phone size={14} /></button>
                  <button className="rounded-full bg-white/5 p-2.5 text-gray-400 hover:text-white hover:bg-white/10 transition"><Video size={14} /></button>
                  <button className="rounded-full bg-white/5 p-2.5 text-gray-400 hover:text-white hover:bg-white/10 transition"><MoreHorizontal size={14} /></button>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-black/40 p-4 min-h-[400px] max-h-[500px] overflow-y-auto scrollbar-thin">
                {selectedConversation ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Select a conversation to start chatting</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Select a conversation</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                <div className="flex gap-2">
                  <input type="text" placeholder="Type a message..."
                    className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[var(--color-spark-pink)]" />
                  <Button variant="primary" size="sm" icon={<Send size={16} />}>Send</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}