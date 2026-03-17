'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { useAuth, supabase } from '@/context/AuthContext';

interface Conversation {
  id: string;
  otherParticipant: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
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

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) return;
      const { conversations: convs } = await response.json();
      setConversations(convs || []);

      // Handle ?new=userId to open new conversation
      const newUserId = searchParams?.get('new');
      if (newUserId) {
        // Find or create conversation and redirect
        const existing = convs?.find(
          c => c.otherParticipant.id === newUserId
        );
        if (existing) {
          router.push(`/messages/${existing.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, searchParams, router]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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
              <Mail className="w-6 h-6 text-[#06b6d4]" />
              <h1 className="text-3xl font-bold">Messages</h1>
            </div>
          </div>

          {/* Conversations List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 text-lg">No messages yet</p>
              <p className="text-gray-500 mt-2">Find a creator and say hi!</p>
              <Link
                href="/creators"
                className="mt-6 inline-block px-6 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium transition-all duration-200"
              >
                Discover Creators
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map(conv => (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className={`p-4 border border-[#1e2d45] rounded-lg hover:border-[#7c3aed]/50 hover:bg-[#1a2332] transition-all duration-200 cursor-pointer ${
                    conv.unreadCount > 0 ? 'bg-[#1a2332]/50 border-[#7c3aed]/30' : ''
                  }`}>
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-violet-500/20 flex-shrink-0 flex items-center justify-center text-sm font-bold">
                        {conv.otherParticipant.username?.charAt(0).toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold text-base">
                            {conv.otherParticipant.display_name || conv.otherParticipant.username}
                          </h3>
                          <p className="text-xs text-gray-500 ml-2">
                            {formatRelativeTime(conv.lastMessageAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {conv.lastMessage || 'No messages yet'}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {conv.unreadCount > 0 && (
                        <div className="w-6 h-6 rounded-full bg-violet-500 flex-shrink-0 flex items-center justify-center text-xs font-bold">
                          {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
