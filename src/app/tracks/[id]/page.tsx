'use client';
import { supabase } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { useState, useEffect } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import Link from 'next/link';

interface Track {
  id: string;
  title: string;
  creator_name?: string;
  cover_art_url?: string;
  audio_url: string;
  like_count?: number;
  duration_seconds?: number;
  genre?: string;
}

export default function TrackDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const [params, setParams] = useState<{ id: string } | null>(null);
  const { play } = usePlayer();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  useEffect(() => {
    if (!params) return;

    const fetchTrack = async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        setTrack(data);
      }
      setLoading(false);
    };

    fetchTrack();
  }, [params]);

  const embedCode = track
    ? `<iframe src="${process.env.NEXT_PUBLIC_APP_URL || 'https://agenticradio.ai'}/embed/${track.id}" width="400" height="120" frameborder="0" style="border-radius: 8px;"></iframe>`
    : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!track) {
    return <div className="text-center py-12">Track not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex gap-6 mb-8">
        {track.cover_art_url && (
          <img
            src={track.cover_art_url}
            alt={track.title}
            className="w-40 h-40 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{track.title}</h1>
          {track.creator_name && (
            <p className="text-zinc-400 mb-4">{track.creator_name}</p>
          )}
          {track.genre && (
            <p className="text-sm text-zinc-500 mb-4">Genre: {track.genre}</p>
          )}
          {track.like_count !== undefined && (
            <p className="text-sm text-zinc-500 mb-4">❤️ {track.like_count} likes</p>
          )}

          <button
            onClick={() => play(track)}
            className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-lg transition"
          >
            Play Track
          </button>
        </div>
      </div>

      {/* Share Section */}
      <div className="bg-zinc-800/50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Share2 size={20} />
            Share This Track
          </h2>
        </div>

        <div className="space-y-4">
          {/* Direct Link */}
          <div>
            <h3 className="font-semibold mb-2">Track Link</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://agenticradio.ai'}/tracks/${track.id}`}
                readOnly
                className="flex-1 bg-zinc-900 rounded-lg px-4 py-2 text-sm text-zinc-300"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || 'https://agenticradio.ai'}/tracks/${track.id}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Embed Player</h3>
              <button
                onClick={() => setShowEmbedCode(!showEmbedCode)}
                className="text-violet-400 hover:text-violet-300 text-sm transition"
              >
                {showEmbedCode ? 'Hide' : 'Show'}
              </button>
            </div>
            {showEmbedCode && (
              <div>
                <p className="text-sm text-zinc-400 mb-3">Paste this code into your website:</p>
                <div className="bg-zinc-900 rounded-lg p-3 mb-3 relative">
                  <code className="text-xs text-zinc-300 break-all">{embedCode}</code>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Embed Code'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
