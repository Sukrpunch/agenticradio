'use client';
import { useAuth, supabase } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useState, useEffect } from 'react';
import { Play, Edit2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Track {
  id: string;
  title: string;
  creator_name?: string;
  cover_art_url?: string;
  audio_url: string;
}

interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  track_count: number;
  creator_id: string;
  tracks: Track[];
}

export default function PlaylistDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const [params, setParams] = useState<{ id: string } | null>(null);
  const { user } = useAuth();
  const { play } = usePlayer();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  useEffect(() => {
    if (!params) return;

    const fetchPlaylist = async () => {
      const response = await fetch(`/api/playlists/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPlaylist(data);
      }
      setLoading(false);
    };

    fetchPlaylist();
  }, [params]);

  const handleDelete = async () => {
    if (!confirm('Delete this playlist?')) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const response = await fetch(`/api/playlists/${params?.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });

    if (response.ok) {
      router.push('/playlists');
    }
  };

  const isOwner = user && playlist && playlist.creator_id === user.id;

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!playlist) return <div className="text-center py-12">Playlist not found</div>;

  const tracks = playlist.tracks || [];
  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration_seconds || 0), 0) / 60;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex gap-6 mb-8">
        {playlist.cover_url && (
          <img
            src={playlist.cover_url}
            alt={playlist.title}
            className="w-32 h-32 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{playlist.title}</h1>
          {playlist.description && (
            <p className="text-zinc-400 mb-4">{playlist.description}</p>
          )}
          <p className="text-sm text-zinc-500">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''} • {Math.round(totalDuration)} min
          </p>

          <div className="flex gap-3 mt-4">
            {tracks.length > 0 && (
              <button
                onClick={() => play(tracks[0], tracks)}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition"
              >
                <Play size={16} />
                Play All
              </button>
            )}
            {isOwner && (
              <>
                <button className="flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded-lg transition">
                  <Edit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tracks</h2>
        {tracks.length === 0 ? (
          <p className="text-zinc-400">No tracks in this playlist yet.</p>
        ) : (
          <div className="space-y-2">
            {tracks.map((track, idx) => (
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
                  <p className="font-semibold truncate">{idx + 1}. {track.title}</p>
                  <p className="text-sm text-zinc-400">{track.creator_name || 'Unknown Artist'}</p>
                </div>
                <button
                  onClick={() => play(track, tracks)}
                  className="text-violet-400 hover:text-violet-300 transition"
                >
                  <Play size={20} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
