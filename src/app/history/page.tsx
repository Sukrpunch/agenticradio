'use client';
import { useAuth, supabase } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useState, useEffect } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';
import { Play, Trash2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  listened_at: string;
  tracks: {
    id: string;
    title: string;
    creator_name?: string;
    cover_art_url?: string;
    audio_url: string;
  };
}

const formatTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default function HistoryPage() {
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  const { play } = usePlayer();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/history', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const handleClearHistory = async () => {
    if (!confirm('Clear all listen history?')) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch('/api/history', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });

    if (response.ok) {
      setHistory([]);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Recently Played</h1>
        <p className="text-zinc-400 mb-6">Sign in to view your listen history.</p>
        <button
          onClick={() => openModal()}
          className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Recently Played</h1>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition"
          >
            <Trash2 size={18} />
            Clear History
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-zinc-400">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-zinc-400">No listen history yet. Start playing tracks!</div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition"
            >
              {item.tracks.cover_art_url && (
                <img
                  src={item.tracks.cover_art_url}
                  alt={item.tracks.title}
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{item.tracks.title}</p>
                <p className="text-sm text-zinc-400">{item.tracks.creator_name || 'Unknown Artist'}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-zinc-500">{formatTimeAgo(item.listened_at)}</span>
                <button
                  onClick={() => play(item.tracks, history.map(h => h.tracks))}
                  className="text-violet-400 hover:text-violet-300 transition"
                  aria-label="Play track"
                >
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
