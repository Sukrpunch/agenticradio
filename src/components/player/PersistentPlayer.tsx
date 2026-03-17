'use client';
import { usePlayer } from '@/context/PlayerContext';
import { useAuth, supabase } from '@/context/AuthContext';
import { formatTime } from '@/lib/format';
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import { TipButton } from '@/components/tips/TipButton';

export function PersistentPlayer() {
  const { currentTrack, isPlaying, currentTimeMs, durationMs, volume, play, pause, resume, next, prev, seek, setVolume } = usePlayer();
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  // Check if track is liked
  useEffect(() => {
    if (!currentTrack || !user) {
      setLiked(false);
      return;
    }

    const checkLike = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/likes', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const likedTracks = await response.json();
        setLiked(likedTracks.some((t: any) => t.id === currentTrack.id));
      }
    };

    checkLike();
  }, [currentTrack, user]);

  if (!currentTrack) return null;

  const progressPercent = durationMs > 0 ? (currentTimeMs / durationMs) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * durationMs);
  };

  const handleLike = async () => {
    if (!user) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newLikedState = !liked;

    // Optimistic update
    setLiked(newLikedState);

    const response = await fetch(
      newLikedState
        ? '/api/likes'
        : `/api/likes?track_id=${currentTrack?.id}`,
      {
        method: newLikedState ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: newLikedState ? JSON.stringify({ track_id: currentTrack?.id }) : undefined,
      }
    );

    if (!response.ok) {
      // Revert on error
      setLiked(!newLikedState);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur border-t border-zinc-800">
      {/* Progress bar */}
      <div
        className="h-1 bg-zinc-800 cursor-pointer hover:h-2 transition-all"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-violet-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Track info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {currentTrack.cover_url && (
            <img
              src={currentTrack.cover_url}
              alt={currentTrack.title}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
            {currentTrack.creator_username && (
              <Link
                href={`/creators/${currentTrack.creator_username}`}
                className="text-xs text-zinc-400 hover:text-violet-400 truncate block"
              >
                @{currentTrack.creator_username}
              </Link>
            )}
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => prev()}
            className="text-zinc-400 hover:text-white transition"
            aria-label="Previous track"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={() => (isPlaying ? pause() : resume())}
            className="bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-full transition"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>

          <button
            onClick={() => next()}
            className="text-zinc-400 hover:text-white transition"
            aria-label="Next track"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Right: Volume, like, actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-zinc-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 bg-zinc-700 rounded cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              aria-label="Volume"
            />
          </div>

          <button
            onClick={handleLike}
            className={`transition ${liked ? 'text-red-500' : 'text-zinc-400 hover:text-red-500'}`}
            aria-label="Like track"
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>

          {currentTrack && (
            <TipButton
              trackId={currentTrack.id}
              creatorId={currentTrack.creator_id}
              creatorUsername={currentTrack.artist_handle}
              currentTimeMs={currentTimeMs}
            />
          )}

          {user && (
            <button
              onClick={() => setShowPlaylistModal(true)}
              className="text-zinc-400 hover:text-violet-400 transition"
              aria-label="Add to playlist"
            >
              <Plus size={18} />
            </button>
          )}

          <span className="text-xs text-zinc-500">
            {formatTime(currentTimeMs)} / {formatTime(durationMs)}
          </span>
        </div>
      </div>

      <AddToPlaylistModal
        open={showPlaylistModal}
        trackId={currentTrack?.id || ''}
        onClose={() => setShowPlaylistModal(false)}
      />
    </div>
  );
}
