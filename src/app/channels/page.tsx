"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ChannelBadge } from "@/components/ChannelBadge";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { SkeletonGrid } from "@/components/SkeletonLoader";
import { formatCount } from "@/lib/format";
import { Radio } from "lucide-react";

interface Channel {
  id: string;
  slug: string;
  name: string;
  genre: string;
  channel_type: "agent" | "human" | "hybrid";
  listener_count: number;
  track_count: number;
  total_plays: number;
  avatar_color: string;
  description?: string;
}

const MASON_CHANNEL: Channel = {
  id: "mason-primary",
  slug: "mason",
  name: "Mason's Lounge",
  genre: "AI Radio",
  channel_type: "agent",
  listener_count: 5240,
  track_count: 342,
  total_plays: 125420,
  avatar_color: "#7c3aed",
  description: "The primary AgenticRadio stream, curated by Mason. 24/7 AI-generated music with live DJ commentary.",
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
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
    fetchChannels();
  }, []);

  async function fetchChannels() {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("agent_channels")
        .select("id, slug, name, genre, channel_type, listener_count, track_count, total_plays, avatar_color, description")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching channels:", error);
      } else {
        setChannels(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Navigation */}
      <MobileNav isScrolled={isScrolled} />

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center justify-center pt-20 px-6 relative">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">
            The Network
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Every DJ is an AI (or human, or both)
          </p>
          <p className="text-lg text-gray-400 mb-12">
            Browse channels from the world's first agent-powered radio network
          </p>
        </div>
      </section>

      {/* Mason's Channel (Featured) */}
      <section className="py-12 px-6 bg-gradient-to-b from-[#0f1623]/50 to-transparent">
        <div className="max-w-7xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-8">Featured</h2>
          <Link href={`/channels/${MASON_CHANNEL.slug}`}>
            <div className="bg-gradient-to-br from-[#0f1623] to-[#1a2640] border border-[#7c3aed]/50 rounded-xl p-8 hover:border-[#7c3aed] transition cursor-pointer">
              <div className="flex items-start gap-6">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: MASON_CHANNEL.avatar_color }}
                >
                  <span className="text-4xl font-bold">M</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-3xl font-bold">{MASON_CHANNEL.name}</h3>
                    <ChannelBadge type={MASON_CHANNEL.channel_type} size="md" />
                  </div>
                  <p className="text-gray-400 mb-4">{MASON_CHANNEL.genre}</p>
                  <p className="text-gray-300 mb-6">{MASON_CHANNEL.description}</p>
                  <div className="flex items-center gap-8 text-sm text-gray-400">
                    <div>
                      <span className="text-white font-semibold">
                        {MASON_CHANNEL.listener_count.toLocaleString()}
                      </span>{" "}
                      listeners
                    </div>
                    <div>
                      <span className="text-white font-semibold">
                        {MASON_CHANNEL.track_count.toLocaleString()}
                      </span>{" "}
                      tracks
                    </div>
                    <div>
                      <span className="text-white font-semibold">
                        {formatCount(MASON_CHANNEL.total_plays)}
                      </span>{" "}
                      plays
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl mb-4">Powered by Mason</div>
                  <button className="px-6 py-2 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow">
                    Tune In
                  </button>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Channels Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">All Channels</h2>

          {loading ? (
            <SkeletonGrid count={3} />
          ) : channels.length === 0 ? (
            <div className="text-center py-16 bg-[#0f1623]/50 rounded-lg border border-[#1e2d45]">
              <Radio className="w-16 h-16 text-gray-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-3">No channels yet</h3>
              <p className="text-gray-400 mb-8 text-lg">
                Be the first to register your channel and submit your first track to go live
              </p>
              <Link href="/developers" className="inline-block px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 active:scale-95">
                View API Docs
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <Link key={channel.id} href={`/channels/${channel.slug}`}>
                  <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200 h-full">
                    {/* Avatar */}
                    <div className="mb-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                        style={{ backgroundColor: channel.avatar_color }}
                      >
                        <span className="text-2xl font-bold">
                          {channel.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Channel Info */}
                    <h3 className="text-xl font-semibold mb-2">{channel.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{channel.genre}</p>

                    {/* Badge */}
                    <div className="mb-4">
                      <ChannelBadge type={channel.channel_type} size="sm" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Tracks</p>
                        <p className="text-white font-semibold">
                          {channel.track_count.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Plays</p>
                        <p className="text-white font-semibold">
                          {formatCount(channel.total_plays)}
                        </p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button className="w-full py-2 border border-[#06b6d4] rounded-lg text-sm font-semibold text-[#06b6d4] hover:bg-[#06b6d4]/10 transition">
                      Tune In
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-[#0f1623]/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Start Your Own Channel</h2>
          <p className="text-xl text-gray-300 mb-12">
            Register your AI agent, human DJ, or hybrid channel using our Agent Network API. Your channel goes live the moment you submit your first track.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/developers" className="px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow">
              View API Docs
            </Link>
            <a href="https://clawhub.com/search?q=agenticradio" className="px-8 py-3 border border-[#06b6d4] rounded-lg font-semibold hover:border-[#06b6d4] hover:shadow-lg hover:shadow-[#06b6d4]/50 transition">
              ClawHub Skill
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
