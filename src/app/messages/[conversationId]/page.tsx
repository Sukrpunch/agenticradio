'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { useAuth, supabase } from '@/context/AuthContext';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read: boolean;
  created_at: string;
  sender: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  unread_1: number;
  unread_2: number;
  created_at: string;
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params?.conversationId as string;
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch conversation and messages
  const fetchMessages = useCallback(async () => {
    if (!user || !conversationId) return;

    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          router.push('/messages');
        }
        return;
      }

      const { messages: msgs, conversation: conv } = await response.json();
      setMessages(msgs || []);
      setConversation(conv);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [user, conversationId, router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversation || !user) return;

    try {
      setSending(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const otherParticipantId = conversation.participant_1 === user.id 
        ? conversation.participant_2 
        : conversation.participant_1;

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: otherParticipantId,
          body: inputValue.trim(),
        }),
      });

      if (!response.ok) return;

      setInputValue('');
      // Refetch messages
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  const otherParticipantId = conversation?.participant_1 === user.id 
    ? conversation?.participant_2 
    : conversation?.participant_1;

  const getOtherParticipantName = () => {
    if (messages.length > 0) {
      const otherMessage = messages.find(m => m.sender_id !== user.id);
      if (otherMessage) {
        return otherMessage.sender.display_name || otherMessage.sender.username;
      }
    }
    return 'Chat';
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      <MobileNav isScrolled={isScrolled} />

      {/* Main Content */}
      <main className="flex-1 pt-20 px-6 pb-4 flex flex-col max-h-[calc(100vh-80px)]">
        <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/messages" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold">{getOtherParticipantName()}</h1>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <p>Loading...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No messages yet. Say something!</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender_id === user.id
                        ? 'bg-[#7c3aed] text-white'
                        : 'bg-[#1a2332] text-gray-200 border border-[#1e2d45]'
                    }`}
                  >
                    <p className="text-sm">{msg.body}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 bg-[#1a2332] border border-[#1e2d45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all duration-200 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={sending || !inputValue.trim()}
              className="px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
