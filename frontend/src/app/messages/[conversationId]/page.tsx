"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';
import { createSocket } from '@/lib/socketClient';
import { ArrowLeft, Send, Phone, Video, MoreVertical, Loader2 } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const { conversationId } = useParams() as { conversationId: string };
  const { token, user } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    if (!token || !user || !conversationId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/${conversationId}`, {
          headers: authHeaders(token),
        });
        if (response.ok) {
          const data: Message[] = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch messages', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const newSocket = createSocket(token);
    setSocket(newSocket);

    newSocket.connect();
    newSocket.on('connect', () => {
      newSocket.emit('join_conversation', conversationId);
    });

    newSocket.on('receive_message', (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
        newSocket.emit('read_messages', { conversationId });
      }
    });

    newSocket.on('user_typing', (data: { userId: string; conversationId: string }) => {
      if (data.conversationId === conversationId && data.userId !== user.id) {
        setTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTyping(false), 1800);
      }
    });

    newSocket.on('messages_read', (data: { conversationId: string; readerId: string }) => {
      if (data.conversationId === conversationId && data.readerId !== user.id) {
        setMessages((prev) => prev.map((m) => (m.senderId === user.id ? { ...m, isRead: true } : m)));
      }
    });

    fetch(`${API_BASE_URL}/api/messages/${conversationId}/read`, {
      method: 'PUT',
      headers: authHeaders(token),
    })
      .then(() => {
        newSocket.emit('read_messages', { conversationId });
      })
      .catch(console.error);

    return () => {
      newSocket.emit('leave_conversation', conversationId);
      newSocket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [token, user, conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const content = newMessage.trim();
    setNewMessage('');

    socket.emit('send_message', {
      conversationId,
      content,
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing', { conversationId });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-white pb-24">
      <div className="px-4 pt-5">
        <div className="glass rounded-[36px] border border-white/10 p-4 shadow-glow backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/messages')} className="rounded-full bg-white/5 p-3 transition hover:bg-white/10">
              <ArrowLeft size={22} className="text-white" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Conversation</p>
              <h1 className="text-2xl font-bold">Live chat room</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-full bg-white/5 p-3 transition hover:bg-white/10">
              <Phone size={18} />
            </button>
            <button className="rounded-full bg-white/5 p-3 transition hover:bg-white/10">
              <Video size={18} />
            </button>
            <button className="rounded-full bg-white/5 p-3 transition hover:bg-white/10">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-6">
        {loading ? (
          <div className="glass rounded-[36px] border border-white/10 p-8 text-center shadow-glow">
            <Loader2 className="mx-auto mb-4 animate-spin text-[var(--color-spark-pink)]" size={30} />
            <p className="text-gray-400">Loading your chat history...</p>
          </div>
        ) : (
          <div className="glass rounded-[36px] border border-white/10 p-5 shadow-glow flex flex-col gap-4">
            <div className="overflow-y-auto max-h-[60vh] space-y-3">
              {messages.length === 0 ? (
                <div className="rounded-3xl bg-white/5 p-5 text-center text-gray-400">No messages yet. Say hello and start a spark.</div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.senderId === user?.id;
                  const showReadReceipt = isMe && msg.isRead && index === messages.length - 1;
                  return (
                    <div key={msg.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`rounded-[26px] px-5 py-3 max-w-[75%] ${isMe ? 'bg-gradient-spark text-white' : 'bg-white/10 text-white'}`}>
                        <p className="leading-relaxed">{msg.content}</p>
                        <div className={`mt-2 text-[11px] ${isMe ? 'text-white/80 text-right' : 'text-gray-400 text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {showReadReceipt && ' • Read'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-[26px] bg-white/10 px-4 py-3 flex items-center gap-2 text-gray-300">
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-300 animate-[bounceDot_1s_infinite]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-300 animate-[bounceDot_1s_infinite]" style={{ animationDelay: '0.15s' }} />
                    <span className="h-2.5 w-2.5 rounded-full bg-gray-300 animate-[bounceDot_1s_infinite]" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="mt-4 flex items-end gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Write a message..."
                className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-[var(--color-spark-pink)] transition"
              />
              <button type="submit" disabled={!newMessage.trim()} className="h-14 w-14 rounded-full bg-gradient-spark text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition">
                <Send size={22} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
