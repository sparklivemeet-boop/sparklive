"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, Settings, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, authHeaders } from '@/lib/api';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const initialNotifications: NotificationItem[] = [];

export default function NotificationPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: authHeaders(token),
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Failed to load notifications', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: authHeaders(token),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-white pb-24">
      <div className="px-4 pt-5">
        <div className="glass rounded-[36px] border border-white/10 p-5 shadow-glow backdrop-blur-xl mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Notifications</p>
              <h1 className="text-3xl font-bold">Alerts</h1>
            </div>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              <Settings size={16} /> Settings
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-4 space-y-4">
        <div className="glass rounded-[36px] border border-white/10 p-4 shadow-glow">
          <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-[var(--color-spark-pink)] to-[var(--color-spark-purple)] p-4 text-white shadow-[0_25px_70px_rgba(255,0,127,0.22)]">
            <Bell size={24} />
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-white/80">Action required</p>
              <p className="text-lg font-semibold">Review your latest SparkLive alerts</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="glass rounded-[28px] border border-white/10 p-6 text-center text-gray-400 shadow-glow">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="glass rounded-[28px] border border-white/10 p-6 text-center text-gray-400 shadow-glow">No new notifications yet. Check back after your next stream or match.</div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`glass rounded-[28px] border border-white/10 p-5 shadow-glow transition hover:-translate-y-0.5 ${item.read ? 'bg-white/5' : 'bg-white/10'}`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 rounded-2xl bg-white/5 p-3 text-white">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">{item.type.replace('_', ' ')}</p>
                      </div>
                      <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">{item.body}</p>
                    {!item.read && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="mt-4 inline-flex rounded-full bg-gradient-spark px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="glass rounded-[36px] border border-white/10 p-5 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Tips</p>
              <h2 className="text-xl font-bold">Stay on top of your alerts</h2>
            </div>
            <Link href="/profile" className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
              View profile
            </Link>
          </div>
          <p className="mt-4 text-gray-300">Your Notification feed shows real-time follow requests, gift receipts, and live invitations from SparkLive.</p>
        </div>
      </main>
    </div>
  );
}
