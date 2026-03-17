'use client';
import { useAuth, supabase } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useState, useEffect } from 'react';
import { useAuthModal } from '@/context/AuthModalContext';
import { Plus, Play } from 'lucide-react';
import Link from 'next/link';
import { CreatePlaylistModal } from '@/components/playlists/CreatePlaylistModal';

interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  track_count: number;
  creator_id: string;
}

export default function PlaylistsPage() {
  const { user, profile } = useAuth();
  const { openModal } = useAuthModal();
  const { play } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchPlaylists = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/playlists', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      }
      setLoading(false);
    };

    fetchPlaylists();
  }, [user]);

  const handlePlaylistCreated = (newPlaylist: Playlist) => {
    setPlaylists([newPlaylist, ...playlists]);
    setShowCreateModal(false);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Playlists</h1>
        <p className="text-zinc-400 mb-6">Sign in to create and manage playlists.</p>
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Playlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus size={18} />
          New Playlist
        </button>
      </div>

      <CreatePlaylistModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handlePlaylistCreated}
      />

      {loading ? (
        <div className="text-zinc-400">Loading...</div>
      ) : playlists.length === 0 ? (
        <div className="text-zinc-400">No playlists yet. Create one to get started!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
              <div className="group bg-zinc-800/50 hover:bg-zinc-800 rounded-lg overflow-hidden transition cursor-pointer">
                {playlist.cover_url && (
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={playlist.cover_url}
                      alt={playlist.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold truncate">{playlist.title}</h3>
                  {playlist.description && (
                    <p className="text-sm text-zinc-400 line-clamp-2">{playlist.description}</p>
                  )}
                  <p className="text-sm text-zinc-500 mt-2">{playlist.track_count} track{playlist.track_count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
