"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, Heart, Share2, Twitter, Copy, Zap, Music } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface Track {
  id: string;
  title: string;
  duration_seconds: number;
  ai_tool: string;
}

interface Playlist {
  id: string;
  name: string;
  slug: string;
  creator_email: string;
  creator_handle: string;
  vibe_description: string;
  track_ids: string[];
  play_count: number;
  share_count: number;
  creator_credits: number;
  is_public: boolean;
  created_at: string;
}

export default function PlaylistPage({
  params,
}: {
  params: { id: string };
}) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        // Fetch playlist by slug
        const { data: playlistData, error: playlistError } = await supabase
          .from("playlists")
          .select("*")
          .eq("slug", params.id)
          .single();

        if (playlistError || !playlistData) {
          setError("Playlist not found");
          setIsLoading(false);
          return;
        }

        setPlaylist(playlistData);

        // Fetch tracks if they exist
        if (playlistData.track_ids && playlistData.track_ids.length > 0) {
          const { data: tracksData, error: tracksError } = await supabase
            .from("tracks")
            .select("id, title, duration_seconds, ai_tool")
            .in("id", playlistData.track_ids);

          if (!tracksError && tracksData) {
            setTracks(tracksData);
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError("Failed to load playlist");
        setIsLoading(false);
      }
    };

    loadPlaylist();
  }, [params.id, supabase]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/playlist/${params.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    if (!playlist) return;
    const url = `${window.location.origin}/playlist/${params.id}`;
    const text = `Check out my custom AI playlist: "${playlist.name}" — curated on AgenticRadio. ${url}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">🎵</div>
          <p>Loading your playlist...</p>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white">
        <nav className="border-b border-[#1e2d45] px-6 py-4">
          <Link href="/" className="text-sm hover:text-[#06b6d4] transition">
            ← Back to Home
          </Link>
        </nav>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Playlist Not Found</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <Link
              href="/request"
              className="px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow"
            >
              Create Your Own Playlist
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Navigation */}
      <nav className="border-b border-[#1e2d45] px-6 py-4">
        <Link href="/" className="flex items-center gap-2 hover:text-[#06b6d4] transition">
          <span className="text-sm">← Back to Home</span>
        </Link>
      </nav>

      {/* Playlist Header */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Album Art */}
          <div className="w-48 h-48 mb-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] opacity-80 flex items-center justify-center shadow-2xl">
            <Music className="w-24 h-24 text-white opacity-70" />
          </div>

          {/* Playlist Info */}
          <h1 className="text-5xl font-bold mb-4">{playlist.name}</h1>
          <p className="text-xl text-gray-300 mb-2">
            Vibe: {playlist.vibe_description}
          </p>
          <p className="text-gray-400 mb-8">
            Created by <span className="text-[#7c3aed] font-semibold">@{playlist.creator_handle}</span>
          </p>

          {/* Stats */}
          <div className="flex gap-8 mb-8 text-sm">
            <div>
              <p className="text-gray-400">Plays</p>
              <p className="text-2xl font-bold text-[#7c3aed]">{playlist.play_count}</p>
            </div>
            <div>
              <p className="text-gray-400">Creator Credits</p>
              <p className="text-2xl font-bold text-[#06b6d4]">{playlist.creator_credits}</p>
            </div>
            <div>
              <p className="text-gray-400">Tracks</p>
              <p className="text-2xl font-bold text-[#7c3aed]">{tracks.length}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <button className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow flex items-center gap-2">
              <Play className="w-5 h-5 fill-white" />
              Play All
            </button>

            <button
              onClick={handleCopyLink}
              className="px-6 py-3 bg-[#1e2d45] border border-[#1e2d45] rounded-lg font-semibold hover:border-[#7c3aed] transition flex items-center gap-2"
            >
              <Copy className="w-5 h-5" />
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <button
              onClick={handleShareTwitter}
              className="px-6 py-3 bg-[#1e2d45] border border-[#1e2d45] rounded-lg font-semibold hover:border-[#06b6d4] transition flex items-center gap-2"
            >
              <Twitter className="w-5 h-5" />
              Share on X
            </button>
          </div>
        </div>
      </section>

      {/* Track List */}
      <section className="py-16 px-6 bg-[#0f1623]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Tracks</h2>

          {tracks.length === 0 ? (
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-12 text-center text-gray-400">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Playlist is being generated. Check back in a few moments!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-4 hover:border-[#7c3aed] transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <span className="text-gray-500 font-semibold w-8">
                      {index + 1}
                    </span>
                    <button className="p-2 bg-[#1e2d45] rounded-full opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-4 h-4 fill-white" />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{track.title}</h3>
                      <p className="text-sm text-gray-400">
                        Generated by {track.ai_tool} · {formatDuration(track.duration_seconds)}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:text-[#7c3aed] transition opacity-0 group-hover:opacity-100">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Creator Earnings Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#7c3aed]/10 to-[#06b6d4]/10 border border-[#1e2d45] rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-8 h-8 text-[#7c3aed]" />
            Creator Earnings
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            This playlist has been played{" "}
            <span className="text-[#7c3aed] font-bold">{playlist.play_count}</span> times.
          </p>
          <p className="text-lg text-gray-400">
            Creator has earned{" "}
            <span className="text-[#06b6d4] font-bold">{playlist.creator_credits}</span> credits.
          </p>
          <p className="text-gray-400 mt-6">
            Every listen = credits earned. Share your playlist with more listeners to grow your earnings!
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#0f1623]/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Create Your Own Vibe</h2>
          <p className="text-xl text-gray-300 mb-8">
            Tell Mason your vibe and get your custom playlist.
          </p>
          <Link
            href="/request"
            className="inline-block px-10 py-4 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow"
          >
            Create Your Playlist →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1623] border-t border-[#1e2d45] py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 AgenticRadio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
