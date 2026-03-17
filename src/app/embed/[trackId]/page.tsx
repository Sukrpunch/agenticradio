'use client';
import { supabase } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useState, useEffect } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { formatTime } from '@/lib/format';

interface Track {
  id: string;
  title: string;
  creator_name?: string;
  cover_art_url?: string;
  audio_url: string;
  like_count?: number;
}

export default function EmbedPlayerPage({
  params: paramsPromise,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const [params, setParams] = useState<{ trackId: string } | null>(null);
  const { currentTrack, isPlaying, currentTimeMs, durationMs, play, pause, resume, seek } = usePlayer();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  useEffect(() => {
    if (!params) return;

    const fetchTrack = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', params.trackId)
        .single();

      if (data) {
        setTrack(data);
      }
      setLoading(false);
    };

    fetchTrack();
  }, [params]);

  if (loading) {
    return <div className="w-full h-full bg-[#080c14] flex items-center justify-center text-white">Loading...</div>;
  }

  if (!track) {
    return <div className="w-full h-full bg-[#080c14] flex items-center justify-center text-white">Track not found</div>;
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const progressPercent = isCurrentTrack && durationMs > 0 ? (currentTimeMs / durationMs) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCurrentTrack) {
      play(track);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seek(percent * durationMs);
  };

  return (
    <div className="w-full h-full bg-[#080c14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900/95 rounded-lg overflow-hidden border border-zinc-800">
        {/* Cover */}
        {track.cover_art_url && (
          <div className="aspect-square overflow-hidden">
            <img src={track.cover_art_url} alt={track.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-white truncate">{track.title}</h3>
            <p className="text-sm text-zinc-400">{track.creator_name || 'Unknown Artist'}</p>
          </div>

          {/* Progress bar */}
          <div
            className="h-1 bg-zinc-800 rounded cursor-pointer hover:h-2 transition"
            onClick={handleProgressClick}
          >
            <div className="h-full bg-violet-500" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Time and controls */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {isCurrentTrack ? `${formatTime(currentTimeMs)} / ${formatTime(durationMs)}` : '0:00'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => (isCurrentTrack && isPlaying ? pause() : resume())}
                className="bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-full transition"
              >
                {isCurrentTrack && isPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </button>

              <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-red-400 transition">
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
                {track.like_count || 0}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
