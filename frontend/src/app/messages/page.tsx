"use client";

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, MessageCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet } from '@/lib/apiClient';

interface ConversationSummary {
  id: string;
  isGroup: boolean;
  name: string | null;
  partner: {
    id: string;
    username: string;
    avatar?: string | null;
    bio?: string | null;
  } | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; username: string };
  } | null;
  unreadCount: number;
  updatedAt: string;
}

const sidebarContacts = [
  { name: 'Luna', status: 'online' },
  { name: 'Noah', status: 'away' },
  { name: 'Zara', status: 'online' },
  { name: 'Eli', status: 'offline' },
];

export default function Messages() {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token || !user) return;
      try {
        const data = await apiGet<ConversationSummary[]>('/api/messages', token);
        setConversations(data);
        setSelectedId(data[0]?.id ?? null);
      } catch (error) {
        console.error('Failed to fetch conversations', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token, user]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0] ?? null,
    [conversations, selectedId]
  );

  return (
    <div className="min-h-screen pb-10">
      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6 xl:px-8">
        <div className="flex flex-col gap-6">
          <header className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Messenger</p>
                <h1 className="text-4xl font-bold text-white">Desktop chat hub</h1>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-gradient-spark px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(255,0,127,0.18)]">
                <Plus size={16} /> New conversation
              </button>
            </div>
          </header>

          <div className="rounded-[36px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_280px]">
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Conversations</p>
                    <h2 className="text-2xl font-bold text-white">Chats</h2>
                  </div>
                  <button className="rounded-full bg-black/30 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10">Filter</button>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-black/40 p-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-4 text-gray-500" size={18} />
                    <input
                      type="text"
                      placeholder="Search conversations"
                      className="w-full rounded-3xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-spark-pink)] transition"
                    />
                  </div>
                </div>

                <div className="space-y-3 overflow-hidden rounded-[32px] border border-white/10 bg-black/40 p-3">
                  {loading ? (
                    <div className="p-6 text-center text-gray-400">Loading conversations...</div>
                  ) : conversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">No conversations yet. Start a new chat.</div>
                  ) : (
                    conversations.map((conversation) => {
                      const partner = conversation.partner;
                      const isActive = selectedConversation?.id === conversation.id;

                      return (
                        <button
                          key={conversation.id}
                          onClick={() => setSelectedId(conversation.id)}
                          className={`w-full rounded-3xl border p-4 text-left transition ${
                            isActive ? 'border-gradient-spark bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-14 overflow-hidden rounded-3xl border border-white/10 bg-gray-800">
                              <img
                                src={partner?.avatar || `https://ui-avatars.com/api/?name=${partner?.username || 'Guest'}`}
                                alt={partner?.username || 'Conversation'}
                                className="h-full w-full object-cover"
                              />
                              <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[var(--background)]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-semibold text-white">{conversation.name || partner?.username || 'New conversation'}</h3>
                              <p className="truncate text-sm text-gray-400">{conversation.lastMessage?.content || 'No messages yet'}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                            <span>{conversation.unreadCount} unread</span>
                            <span>{conversation.lastMessage ? new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'New'}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-white/10 bg-black/40 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Active chat</p>
                      <h2 className="text-2xl font-bold text-white">{selectedConversation?.name || selectedConversation?.partner?.username || 'Pick a conversation'}</h2>
                    </div>
                    <button className="rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition">Details</button>
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                    {selectedConversation ? (
                      [
                        { from: selectedConversation.partner?.username ?? 'System', message: selectedConversation.lastMessage?.content ?? 'No messages yet.' },
                        { from: 'You', message: 'Ready to say hello? Click into any conversation to start.' },
                        { from: selectedConversation.partner?.username ?? 'System', message: 'This preview shows how messages look in a full desktop chat page.' },
                      ].map((message, index) => (
                        <div
                          key={index}
                          className={`rounded-3xl p-4 ${message.from === 'You' ? 'bg-gradient-spark/15 text-white' : 'bg-white/5 text-gray-300'}`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-gray-400">
                            <span>{message.from}</span>
                            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p>{message.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl bg-white/5 p-6 text-center text-gray-400">Select a conversation from the left column to open the chat.</div>
                    )}
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-4">
                    <textarea
                      placeholder="Type a message..."
                      className="min-h-[120px] w-full resize-none rounded-3xl border border-white/10 bg-white/5 p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-spark-pink)]"
                    />
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-400">Realtime typing and websocket chat stay connected.</span>
                      <button className="rounded-full bg-gradient-spark px-5 py-3 text-sm font-semibold text-white">Send</button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-black/40 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Activity</p>
                  <div className="mt-5 grid gap-3">
                    {sidebarContacts.map((contact) => (
                      <div key={contact.name} className="flex items-center justify-between rounded-3xl bg-white/5 p-4">
                        <div>
                          <p className="font-semibold text-white">{contact.name}</p>
                          <p className="text-xs text-gray-400">Status: {contact.status}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[11px] uppercase ${contact.status === 'online' ? 'bg-emerald-500/15 text-emerald-200' : contact.status === 'away' ? 'bg-yellow-500/15 text-yellow-200' : 'bg-gray-500/15 text-gray-300'}`}>
                          {contact.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="hidden xl:block">
                <div className="rounded-[32px] border border-white/10 bg-black/40 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)]">
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Quick actions</p>
                  <div className="mt-4 space-y-3">
                    <button className="w-full rounded-3xl bg-white/5 px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10">New group chat</button>
                    <button className="w-full rounded-3xl bg-white/5 px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10">Saved replies</button>
                    <button className="w-full rounded-3xl bg-white/5 px-4 py-3 text-left text-sm text-gray-300 transition hover:bg-white/10">Message insights</button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
