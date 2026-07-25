'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost } from '@/lib/apiClient';
import { MessageCircle, Search, UserPlus, Users, Megaphone, X, Check, Loader2, ArrowLeft, Info, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import ConversationList from '@/components/messages/ConversationList';
import ChatMessages from '@/components/messages/ChatMessages';
import MessageInput from '@/components/messages/MessageInput';
import MessageFab from '@/components/messages/MessageFab';
import Avatar from '@/components/ui/Avatar';

interface Message {
  id: string;
  content: string;
  sender: { id: string; name: string; avatar?: string };
  timestamp: string;
  isOwn?: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
  type?: 'text' | 'image' | 'voice' | 'file';
  replyTo?: { id: string; content: string; sender: string };
}

interface Conversation {
  id: string;
  type: 'private' | 'group' | 'channel';
  name: string;
  username?: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    sender?: string;
    isRead?: boolean;
    isDelivered?: boolean;
  };
  unread?: number;
  isOnline?: boolean;
  isVerified?: boolean;
  isPinned?: boolean;
  isMuted?: boolean;
  isTyping?: boolean;
  isArchived?: boolean;
  participants?: { avatar?: string; name: string }[];
}

export default function MessagesPage() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showSearchPeopleModal, setShowSearchPeopleModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<any>('/api/messages', token);
      const list = Array.isArray(data) ? data : data?.conversations ?? data?.data ?? [];
      setConversations(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Fetch messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    if (!token) return;
    setMessagesLoading(true);
    try {
      const data = await apiGet<any>(`/api/messages/${convId}`, token);
      const list = Array.isArray(data) ? data : data?.messages ?? data?.data ?? [];
      setMessages(Array.isArray(list) ? list.map((m: any) => ({
        id: m.id,
        content: m.content,
        sender: { id: m.sender?.id || m.userId || 'unknown', name: m.sender?.fullName || m.sender?.username || 'User', avatar: m.sender?.avatar },
        timestamp: m.createdAt || m.timestamp,
        isOwn: m.sender?.id === user?.id || m.userId === user?.id,
        isRead: m.isRead,
        isDelivered: m.isDelivered,
        type: m.type || 'text',
      })) : []);
    } catch {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
      setShowMobileChat(true);
    }
  }, [activeConversation, fetchMessages]);

  const handleSend = async (content: string) => {
    if (!token || !activeConversation) return;
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      content,
      sender: { id: user?.id || 'me', name: user?.fullName || user?.username || 'You', avatar: user?.avatar },
      timestamp: new Date().toISOString(),
      isOwn: true,
      isDelivered: false,
    };
    setMessages(prev => [...prev, newMsg]);
    
    try {
      await apiPost(`/api/messages/${activeConversation}`, { content }, token);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isDelivered: true } : m));
    } catch {
      // Message failed - could mark as error
    }
  };

  const activeConv = conversations.find(c => c.id === activeConversation);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Mobile/Tablet: Show conversation list or chat */}
      <div className="flex-1 flex overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0e0e16]/60 backdrop-blur-2xl">
        {/* Left: Conversation List */}
        <div className={cn(
          'w-full sm:w-80 lg:w-96 xl:w-[380px] border-r border-white/[0.06] flex flex-col',
          showMobileChat && 'hidden sm:flex'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff007f] to-[#7a00cc] flex items-center justify-center shadow-lg shadow-[#ff007f]/20">
                <MessageCircle size={15} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Messages</h1>
            </div>
            <span className="text-[10px] text-gray-500">
              {conversations.filter(c => !c.isArchived).length} chats
            </span>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              activeId={activeConversation || undefined}
              onSelect={setActiveConversation}
              loading={loading}
            />
          </div>
        </div>

        {/* Center: Chat Window */}
        <div className={cn(
          'flex-1 flex flex-col min-w-0',
          !showMobileChat && 'hidden sm:flex'
        )}>
          {activeConversation && activeConv ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => { setActiveConversation(null); setShowMobileChat(false); }}
                    className="sm:hidden p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.05] transition"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="relative">
                    <Avatar src={activeConv.avatar} alt={activeConv.name} size="sm" />
                    {activeConv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0e0e16]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white truncate">{activeConv.name}</span>
                      {activeConv.isVerified && (
                        <span className="w-4 h-4 rounded-full bg-[#00d8ff] flex items-center justify-center shrink-0">
                          <Check size={7} className="text-white" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {activeConv.isOnline ? 'Online' : activeConv.isTyping ? 'typing...' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.05] transition" aria-label="Voice call">
                    <Phone size={15} />
                  </button>
                  <button className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.05] transition" aria-label="Video call">
                    <Video size={15} />
                  </button>
                  <button className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/[0.05] transition" aria-label="Info">
                    <Info size={15} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <ChatMessages
                messages={messages}
                currentUserId={user?.id || 'me'}
                hasMore={false}
              />

              {/* Input */}
              <MessageInput onSend={handleSend} onAttachment={() => {}} disabled={false} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#ff007f]/10 to-[#7a00cc]/10 border border-[#ff007f]/15 flex items-center justify-center mb-5">
                <MessageCircle size={36} className="text-[#ff007f]/40" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Your Messages</h2>
              <p className="text-sm text-white/30 max-w-sm">
                Select a conversation from the sidebar or tap the + button to start a new chat
              </p>
              <div className="flex items-center gap-2 mt-6 text-xs text-white/20">
                <kbd className="px-2 py-1 rounded-lg bg-white/[0.05] font-mono">⌘K</kbd>
                <span>Search conversations</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Info Sidebar (Desktop) */}
        {activeConversation && activeConv && (
          <div className="hidden xl:block w-72 border-l border-white/[0.06] p-4 overflow-y-auto">
            <div className="text-center mb-6">
              <Avatar src={activeConv.avatar} alt={activeConv.name} size="2xl" className="mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">{activeConv.name}</h3>
              <p className="text-xs text-gray-500">{activeConv.username || `@${activeConv.name.toLowerCase().replace(/\s+/g, '')}`}</p>
              <button className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-xs font-bold text-white">
                View Profile
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-semibold mb-2">Shared Media</h4>
                <div className="grid grid-cols-3 gap-1.5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-[#ff007f]/10 to-[#7a00cc]/10 border border-white/[0.06]" />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-semibold mb-2">Shared Files</h4>
                <div className="space-y-1">
                  {['Document.pdf', 'Photo.zip', 'Presentation.pptx'].map(file => (
                    <div key={file} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/[0.03] transition cursor-pointer">
                      <div className="w-7 h-7 rounded-lg bg-[#ff007f]/10 flex items-center justify-center text-[10px]">📄</div>
                      <span className="text-xs text-white/60 truncate">{file}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-semibold mb-2">Actions</h4>
                <div className="space-y-1">
                  {['Mute Notifications', 'Block User', 'Report', 'Delete Conversation'].map(action => (
                    <button key={action} className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/[0.03] transition">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <MessageFab
        onNewMessage={() => setShowNewMessageModal(true)}
        onSearchPeople={() => setShowSearchPeopleModal(true)}
        onNewGroup={() => setShowNewGroupModal(true)}
        onNewChannel={() => setShowNewChannelModal(true)}
      />

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <NewMessageModal
            onClose={() => setShowNewMessageModal(false)}
            onSelect={(convId) => { setActiveConversation(convId); setShowNewMessageModal(false); }}
          />
        )}
      </AnimatePresence>

      {/* Search People Modal */}
      <AnimatePresence>
        {showSearchPeopleModal && (
          <SearchPeopleModal onClose={() => setShowSearchPeopleModal(false)} />
        )}
      </AnimatePresence>

      {/* New Group Modal */}
      <AnimatePresence>
        {showNewGroupModal && (
          <NewGroupModal onClose={() => setShowNewGroupModal(false)} />
        )}
      </AnimatePresence>

      {/* New Channel Modal */}
      <AnimatePresence>
        {showNewChannelModal && (
          <NewChannelModal onClose={() => setShowNewChannelModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// === MODALS ===

function NewMessageModal({ onClose, onSelect }: { onClose: () => void; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const data = await apiGet<any>(`/api/users/search?q=${encodeURIComponent(query)}`, token);
        setResults(Array.isArray(data) ? data : data?.users ?? data?.data ?? []);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, token]);

  return (
    <ModalShell title="New Message" onClose={onClose}>
      <div className="p-4">
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search users by username or display name..."
            className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
            autoFocus
          />
        </div>

        {results.length > 0 ? (
          <div className="space-y-1">
            {results.slice(0, 8).map((user: any) => (
              <button
                key={user.id}
                onClick={() => onSelect(user.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.03] transition-all"
              >
                <Avatar src={user.avatar} alt={user.fullName || user.username} size="md" />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.fullName || user.username}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                <span className="text-[10px] text-gray-500 shrink-0">{user.followersCount || 0} followers</span>
              </button>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="flex flex-col items-center py-8 text-gray-500">
            <Search size={24} className="mb-2 opacity-30" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-gray-500">
            <UserPlus size={24} className="mb-2 opacity-30" />
            <p className="text-sm">Type at least 2 characters to search</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function SearchPeopleModal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const data = await apiGet<any>(`/api/users/search?q=${encodeURIComponent(query)}`, token);
        setResults(Array.isArray(data) ? data : data?.users ?? data?.data ?? []);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, token]);

  return (
    <ModalShell title="Search People" onClose={onClose}>
      <div className="p-4">
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by username or display name..."
            className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all"
            autoFocus
          />
        </div>

        {results.length > 0 ? (
          <div className="space-y-1">
            {results.slice(0, 10).map((user: any) => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.03] transition-all">
                <Avatar src={user.avatar} alt={user.fullName || user.username} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-white truncate">{user.fullName || user.username}</p>
                    {user.verified && <Check size={10} className="text-[#00d8ff] shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-[10px] font-bold text-white">
                  Follow
                </button>
              </div>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="flex flex-col items-center py-8 text-gray-500">
            <Search size={24} className="mb-2 opacity-30" />
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-gray-500">
            <UserPlus size={24} className="mb-2 opacity-30" />
            <p className="text-sm">Search for creators, friends, and communities</p>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function NewGroupModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="New Group" onClose={onClose}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7a00cc]/20 to-[#3b82f6]/20 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition">
            <Users size={24} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Group Photo</p>
            <p className="text-[10px] text-gray-500">Add a group photo (optional)</p>
          </div>
        </div>
        <input placeholder="Group name" className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all" />
        <textarea placeholder="Group description (optional)" rows={3} className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all resize-none" />
        <input placeholder="Search members..." className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all" />
        <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-sm font-bold text-white">
          Create Group
        </button>
      </div>
    </ModalShell>
  );
}

function NewChannelModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="New Channel" onClose={onClose}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition">
            <Megaphone size={24} className="text-gray-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Channel Avatar</p>
            <p className="text-[10px] text-gray-500">Add a channel photo (optional)</p>
          </div>
        </div>
        <input placeholder="Channel name" className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all" />
        <input placeholder="Channel username" className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all" />
        <textarea placeholder="Channel description" rows={3} className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#ff007f]/30 transition-all resize-none" />
        <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] p-3">
          <div>
            <p className="text-sm text-white">Public Channel</p>
            <p className="text-[10px] text-gray-500">Anyone can find and join</p>
          </div>
          <div className="w-10 h-6 rounded-full bg-[#ff007f] relative cursor-pointer">
            <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1" />
          </div>
        </div>
        <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff007f] to-[#7a00cc] text-sm font-bold text-white">
          Create Channel
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-4 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-[101] flex flex-col rounded-3xl border border-white/[0.08] bg-[#0e0e16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden max-h-[80vh]"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:text-white hover:bg-white/[0.05] transition" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto scrollbar-hide flex-1">
          {children}
        </div>
      </motion.div>
    </>
  );
}