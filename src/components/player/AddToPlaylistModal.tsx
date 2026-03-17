'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/context/AuthContext';
import { X, Plus } from 'lucide-react';

interface Playlist {
  id: string;
  title: string;
  track_count: number;
}

interface AddToPlaylistModalProps {
  open: boolean;
  trackId: string;
  onClose: () => void;
}

export function AddToPlaylistModal({ open, trackId, onClose }: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  useEffect(() => {
    if (!open) return;
    
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
    };

    fetchPlaylists();
  }, [open]);

  const handleAddToPlaylist = async (playlistId: string) => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ track_id: trackId }),
    });

    if (response.ok) {
      // Update local playlists
      setPlaylists(playlists.map(p => 
        p.id === playlistId 
          ? { ...p, track_count: p.track_count + 1 }
          : p
      ));
      setTimeout(() => {
        setError('Added to playlist!');
        setTimeout(() => setError(''), 2000);
      }, 500);
    } else {
      const data = await response.json();
      setError(data.error || 'Failed to add track');
    }
    setLoading(false);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistTitle.trim()) return;

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const response = await fetch('/api/playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        title: newPlaylistTitle,
        is_public: true,
      }),
    });

    if (response.ok) {
      const newPlaylist = await response.json();
      setPlaylists([newPlaylist, ...playlists]);
      setNewPlaylistTitle('');
      setShowCreateForm(false);
      
      // Automatically add track to new playlist
      await handleAddToPlaylist(newPlaylist.id);
    } else {
      const data = await response.json();
      setError(data.error || 'Failed to create playlist');
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Add to Playlist</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className={`px-4 py-2 rounded-lg text-sm mb-4 ${
            error.includes('Added') 
              ? 'bg-green-500/10 border border-green-500 text-green-400'
              : 'bg-red-500/10 border border-red-500 text-red-400'
          }`}>
            {error}
          </div>
        )}

        {!showCreateForm ? (
          <>
            {playlists.length > 0 ? (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    disabled={loading}
                    className="w-full text-left px-4 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 rounded-lg transition flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{playlist.title}</p>
                      <p className="text-xs text-zinc-400">{playlist.track_count} tracks</p>
                    </div>
                    <Plus size={16} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400 text-sm mb-4">No playlists yet.</p>
            )}

            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition font-semibold"
            >
              Create New Playlist
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={newPlaylistTitle}
              onChange={(e) => setNewPlaylistTitle(e.target.value)}
              placeholder="Playlist name"
              className="w-full bg-zinc-800 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewPlaylistTitle('');
                }}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaylist}
                disabled={loading || !newPlaylistTitle.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 text-white px-4 py-2 rounded-lg transition"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
