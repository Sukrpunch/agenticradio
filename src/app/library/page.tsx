'use client';
import { useAuth, supabase } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useState, useEffect } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';
import { Play } from 'lucide-react';
import Link from 'next/link';

interface Track {
  id: string;
  title: string;
  creator_name?: string;
  cover_art_url?: string;
  audio_url: string;
  duration_seconds?: number;
}

export default function LibraryPage() {
  const { user, profile } = useAuth();
  const { openModal } = useAuthModal();
  const { play } = usePlayer();
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchLikedTracks = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/likes', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const tracks = await response.json();
        setLikedTracks(tracks);
      }
      setLoading(false);
    };

    fetchLikedTracks();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Library</h1>
        <p className="text-zinc-400 mb-6">Sign in to view your liked tracks and playlists.</p>
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
      <h1 className="text-3xl font-bold mb-8">Library</h1>

      {/* Liked Tracks */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Liked Tracks</h2>
          {likedTracks.length > 0 && (
            <button
              onClick={() => {
                if (likedTracks.length > 0) play(likedTracks[0], likedTracks);
              }}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition"
            >
              <Play size={16} />
              Play All
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-zinc-400">Loading...</div>
        ) : likedTracks.length === 0 ? (
          <div className="text-zinc-400">No liked tracks yet. Start liking tracks to build your library!</div>
        ) : (
          <div className="space-y-2">
            {likedTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition"
              >
                {track.cover_art_url && (
                  <img
                    src={track.cover_art_url}
                    alt={track.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{track.title}</p>
                  <p className="text-sm text-zinc-400">{track.creator_name || 'Unknown Artist'}</p>
                </div>
                <button
                  onClick={() => play(track, likedTracks)}
                  className="text-violet-400 hover:text-violet-300 transition"
                  aria-label="Play track"
                >
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playlists Link */}
      <div className="mt-12 pt-8 border-t border-zinc-800">
        <h2 className="text-2xl font-semibold mb-6">Your Playlists</h2>
        <Link
          href="/playlists"
          className="inline-block bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg transition"
        >
          View Playlists
        </Link>
      </div>
    </div>
  );
}
