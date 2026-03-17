'use client';
import { usePlayer } from '@/context/PlayerContext';
import { formatTime } from '@/lib/format';
import { Heart, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function PersistentPlayer() {
  const { currentTrack, isPlaying, currentTimeMs, durationMs, volume, play, pause, resume, next, prev, seek, setVolume } = usePlayer();
  const [liked, setLiked] = useState(false);

  if (!currentTrack) return null;

  const progressPercent = durationMs > 0 ? (currentTimeMs / durationMs) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * durationMs);
  };

  const handleLike = async () => {
    setLiked(!liked);
    // TODO: Save to database via /api/likes
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
            className="text-zinc-400 hover:text-red-500 transition"
            aria-label="Like track"
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>

          <span className="text-xs text-zinc-500">
            {formatTime(currentTimeMs)} / {formatTime(durationMs)}
          </span>
        </div>
      </div>
    </div>
  );
}
