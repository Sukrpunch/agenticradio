'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell } from 'lucide-react';
import Link from 'next/link';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { useAuth, supabase } from '@/context/AuthContext';

interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  entity_id: string | null;
  entity_type: string | null;
  message: string;
  read: boolean;
  created_at: string;
  actor: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
}

const formatRelativeTime = (dateString: string): string => {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString();
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const fetchNotifications = async (pageNum: number) => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const offset = (pageNum - 1) * itemsPerPage;
      const { data: notifs, error } = await supabase
        .from('notifications')
        .select('*, actor:actor_id(id, username, display_name, avatar_url)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + itemsPerPage - 1);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (pageNum === 1) {
        setNotifications(notifs || []);
      } else {
        setNotifications(prev => [...prev, ...(notifs || [])]);
      }

      setHasMore((notifs?.length ?? 0) === itemsPerPage);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ all: true }),
      });

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationLink = (notif: Notification) => {
    switch (notif.type) {
      case 'follow':
        return `/creators/${notif.actor?.username}`;
      case 'comment':
      case 'reply':
        return `/listen?track=${notif.entity_id}`;
      case 'remix':
        return `/listen?track=${notif.entity_id}`;
      default:
        return '#';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return '👤';
      case 'comment':
      case 'reply':
        return '💬';
      case 'remix':
        return '🔄';
      case 'collab_invite':
        return '🤝';
      default:
        return '📌';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      <MobileNav isScrolled={isScrolled} />

      {/* Main Content */}
      <main className="flex-1 pt-24 px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-[#06b6d4]" />
              <h1 className="text-3xl font-bold">Notifications</h1>
            </div>
          </div>

          {/* Mark All Read Button */}
          {notifications.some(n => !n.read) && (
            <div className="mb-6">
              <button
                onClick={handleMarkAllRead}
                className="text-sm px-4 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 rounded-lg text-[#06b6d4] transition-all duration-200"
              >
                Mark all as read
              </button>
            </div>
          )}

          {/* Notifications List */}
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg">You're all caught up ✓</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(notif => (
                <Link key={notif.id} href={getNotificationLink(notif)}>
                  <div className={`p-4 border border-[#1e2d45] rounded-lg hover:border-[#7c3aed]/50 hover:bg-[#1a2332] transition-all duration-200 cursor-pointer ${
                    !notif.read ? 'bg-[#1a2332]/50 border-[#7c3aed]/30' : ''
                  }`}>
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base text-gray-200">
                          {notif.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatRelativeTime(notif.created_at)}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notif.read && (
                        <div className="w-3 h-3 rounded-full bg-violet-500 flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setPage(prev => prev + 1);
                  fetchNotifications(page + 1);
                }}
                disabled={loading}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
