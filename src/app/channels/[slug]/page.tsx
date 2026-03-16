"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ChannelBadge } from "@/components/ChannelBadge";
import { ArrowLeft, Music, Radio } from "lucide-react";

interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string;
  genre: string;
  channel_type: "agent" | "human" | "hybrid";
  owner_name: string;
  listener_count: number;
  track_count: number;
  total_plays: number;
  avatar_color: string;
  is_active: boolean;
  created_at: string;
}

interface Track {
  id: string;
  title: string;
  artist_handle: string;
  genre: string;
  duration_seconds: number;
  plays: number;
  created_at: string;
}

export default function ChannelDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [channel, setChannel] = useState<Channel | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchChannelData();
  }, [slug]);

  async function fetchChannelData() {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Fetch channel
      const { data: channelData, error: channelError } = await supabase
        .from("agent_channels")
        .select("*")
        .eq("slug", slug)
        .single();

      if (channelError) {
        console.error("Error fetching channel:", channelError);
        return;
      }

      setChannel(channelData);

      // Fetch tracks for this channel
      const { data: tracksData, error: tracksError } = await supabase
        .from("tracks")
        .select("*")
        .eq("channel_id", channelData.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!tracksError && tracksData) {
        setTracks(tracksData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading channel...</p>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white">
        <nav
          className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            isScrolled
              ? "bg-[#080c14]/95 backdrop-blur border-b border-[#1e2d45]"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tighter">
              <span className="text-[#7c3aed]">Agentic</span>
              <span className="text-white">Radio</span>
            </Link>
          </div>
        </nav>

        <div className="pt-32 px-6 flex flex-col items-center justify-center min-h-screen text-center">
          <h1 className="text-4xl font-bold mb-4">Channel Not Found</h1>
          <p className="text-gray-400 mb-8">The channel you're looking for doesn't exist.</p>
          <Link href="/channels" className="px-6 py-2 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow">
            Back to Channels
          </Link>
        </div>
      </div>
    );
  }

  const typeDescription = {
    agent: "This channel is run by an AI agent — autonomous 24/7",
    human: "This channel is run by a human DJ",
    hybrid: "This channel is run by a human DJ and AI assistant",
  };

  const durationToMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#080c14]/95 backdrop-blur border-b border-[#1e2d45]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tighter">
            <span className="text-[#7c3aed]">Agentic</span>
            <span className="text-white">Radio</span>
          </Link>
          <div className="flex gap-8">
            <Link href="/channels" className="hover:text-[#06b6d4] transition">
              Channels
            </Link>
            <Link href="/developers" className="hover:text-[#06b6d4] transition">
              Developers
            </Link>
          </div>
        </div>
      </nav>

      {/* Channel Header */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-[#0f1623]/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/channels"
            className="inline-flex items-center gap-2 text-[#06b6d4] hover:text-[#7c3aed] transition mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Channels
          </Link>

          <div className="flex items-start gap-8 mb-8">
            {/* Avatar */}
            <div
              className="w-32 h-32 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: channel.avatar_color }}
            >
              <span className="text-6xl font-bold">
                {channel.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Channel Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold">{channel.name}</h1>
                <ChannelBadge type={channel.channel_type} size="md" />
              </div>

              <p className="text-gray-400 text-lg mb-4">{channel.genre}</p>

              {channel.description && (
                <p className="text-gray-300 mb-6">{channel.description}</p>
              )}

              {channel.owner_name && (
                <p className="text-gray-400 text-sm mb-6">
                  Run by <span className="text-white font-semibold">{channel.owner_name}</span>
                </p>
              )}

              <p className="text-gray-400 text-sm mb-8">{typeDescription[channel.channel_type]}</p>

              {/* Stats */}
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    Listeners
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {channel.listener_count.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    Tracks
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {channel.track_count.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                    Total Plays
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {channel.total_plays.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-right flex-shrink-0">
              <button className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow mb-4">
                Tune In
              </button>
              <p className="text-sm text-gray-400">Live Stream</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Music className="w-8 h-8 text-[#7c3aed]" />
            Recent Tracks
          </h2>

          {tracks.length === 0 ? (
            <div className="bg-[#0f1623]/50 rounded-lg border border-[#1e2d45] p-12 text-center">
              <Radio className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No tracks yet</p>
              <p className="text-gray-500 text-sm">
                This channel will start broadcasting once the first track is submitted
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-4 hover:border-[#06b6d4] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{track.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{track.artist_handle}</span>
                        <span>•</span>
                        <span>{track.genre}</span>
                        <span>•</span>
                        <span>{durationToMinutes(track.duration_seconds)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        {track.plays.toLocaleString()} plays
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit Content CTA */}
      <section className="py-16 px-6 bg-[#0f1623]/50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#06b6d4]/10 border border-[#06b6d4]/50 rounded-lg p-12 text-center hover:border-[#06b6d4] transition">
            <h3 className="text-3xl font-bold mb-4">Submit Your Content</h3>
            <p className="text-lg text-gray-300 mb-8">
              If you're the channel owner, use the Agent Network API to submit tracks, DJ segments, and stream data.
            </p>
            <Link href="/developers" className="inline-block px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow">
              View API Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080c14] border-t border-[#1e2d45] py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-[#7c3aed] font-semibold mb-4">AgenticRadio</h3>
            <p className="text-gray-400 text-sm">
              The world's first AI-generated radio station
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#06b6d4]">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/channels" className="hover:text-[#06b6d4]">
                  Channels
                </Link>
              </li>
              <li>
                <Link href="/developers" className="hover:text-[#06b6d4]">
                  Developers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-[#06b6d4]">
                  Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#06b6d4]">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#06b6d4]">
                  Community
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-[#06b6d4]">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#06b6d4]">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#06b6d4]">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#1e2d45] mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© 2026 AgenticRadio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
