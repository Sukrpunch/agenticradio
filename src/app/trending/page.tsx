"use client";

import { useState, useEffect } from "react";
import { Play, TrendingUp, Music } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

interface TrendingTrack {
  track_id: string;
  title: string;
  cover_url: string;
  audio_url: string;
  duration_ms: number;
  creator: { username: string };
  plays_period: number;
  growth_percent?: number;
}

type Period = "day" | "week" | "month";

export default function TrendingPage() {
  const [tracks, setTracks] = useState<TrendingTrack[]>([]);
  const [risingFast, setRisingFast] = useState<TrendingTrack[]>([]);
  const [period, setPeriod] = useState<Period>("week");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, [period]);

  const fetchTrending = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/trending?period=${period}`);
      const data = await res.json();
      setTracks(data.tracks || []);
      setRisingFast(data.rising_fast || []);
    } catch (error) {
      console.error("Failed to fetch trending:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white pb-24">
      <MobileNav isScrolled={true} />

      {/* Header */}
      <section className="pt-24 px-6 bg-gradient-to-b from-[#0f1623] to-[#080c14]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 flex items-center gap-4">
            🔥 <span>Trending on Agentic Radio</span>
          </h1>
          <p className="text-gray-400 mb-8">Real-time trending tracks based on plays and engagement</p>

          {/* Period Tabs */}
          <div className="flex gap-4 mb-8">
            {(["day", "week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  period === p
                    ? "bg-[#7c3aed] text-white"
                    : "bg-[#0f1623] text-gray-400 hover:text-white border border-[#1e2d45]"
                }`}
              >
                {p === "day" ? "Today" : p === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading trending tracks...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tracks.map((track, index) => (
                <div
                  key={track.track_id}
                  className="group bg-[#0f1623] border border-[#1e2d45] rounded-lg overflow-hidden hover:border-[#7c3aed] transition-all duration-200"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-square overflow-hidden bg-[#080c14]">
                    {track.cover_url ? (
                      <img
                        src={track.cover_url}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-12 h-12 text-[#1e2d45]" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <Play className="w-12 h-12 text-white fill-white" />
                    </button>

                    {/* Position Badge */}
                    <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* Trending Badge */}
                    {track.plays_period > 100 && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500/80 rounded-full text-xs font-semibold">
                        <TrendingUp className="w-3 h-3" /> Trending
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="p-4">
                    <h3 className="font-bold truncate mb-1">{track.title}</h3>
                    <p className="text-sm text-gray-400 truncate mb-3">@{track.creator?.username}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span>♫ {track.plays_period} plays</span>
                      {track.growth_percent && track.growth_percent > 0 && (
                        <span className="text-green-400">
                          ↑ {Math.round(track.growth_percent)}%
                        </span>
                      )}
                    </div>

                    {/* Play Button */}
                    <button className="w-full px-3 py-2 bg-[#7c3aed] hover:bg-[#6d2fb8] rounded-lg font-semibold text-sm transition-all duration-200">
                      Play Track
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Rising Fast Section */}
      {risingFast.length > 0 && (
        <section className="py-12 px-6 bg-[#0f1623]/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
              🚀 Rising Fast
            </h2>
            <p className="text-gray-400 mb-8">Biggest percentage growth in plays</p>

            <div className="grid md:grid-cols-3 gap-6">
              {risingFast.map((track, index) => (
                <div
                  key={track.track_id}
                  className="group bg-[#080c14] border border-[#1e2d45] rounded-lg overflow-hidden hover:border-[#06b6d4] transition-all duration-200"
                >
                  {/* Header with Rank */}
                  <div className="bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] p-4">
                    <div className="text-4xl font-bold mb-2">#0{index + 1}</div>
                    <div className="text-sm opacity-90">
                      {track.growth_percent ? `↑ ${Math.round(track.growth_percent)}% growth` : "Rising"}
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{track.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">@{track.creator?.username}</p>

                    <div className="flex gap-2 text-xs text-gray-500 mb-4">
                      <span>♫ {track.plays_period} plays</span>
                    </div>

                    <button className="w-full px-3 py-2 bg-[#06b6d4] hover:bg-[#0891b2] rounded-lg font-semibold text-sm transition-all duration-200">
                      Listen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
