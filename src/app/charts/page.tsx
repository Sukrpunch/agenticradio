"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Heart, Play, Share2, TrendingUp } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

interface ChartEntry {
  id: string;
  position: number;
  prev_position: number | null;
  track: {
    id: string;
    title: string;
    cover_url: string;
    duration_ms: number;
    creator_id: string;
    profiles: { username: string };
  };
  weeks_on_chart: number;
  is_new_entry: boolean;
  is_bullet: boolean;
  mason_commentary: string;
  play_count_week: number;
}

interface Dedication {
  id: string;
  sender_name: string;
  recipient_name: string;
  message: string;
  track: { title: string };
}

export default function ChartsPage() {
  const [entries, setEntries] = useState<ChartEntry[]>([]);
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowingDedicationModal, setIsShowingDedicationModal] = useState(false);
  const [reverseOrder, setReverseOrder] = useState(false);

  useEffect(() => {
    fetchChart();
  }, [selectedWeek]);

  const fetchChart = async () => {
    try {
      setIsLoading(true);
      const url = `/api/charts${selectedWeek ? `?week=${selectedWeek}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setEntries(data.entries || []);
      setDedications(data.featured_dedications || []);
      setAvailableWeeks(data.available_weeks || []);
      if (!selectedWeek && data.week) {
        setSelectedWeek(data.week);
      }
    } catch (error) {
      console.error("Failed to fetch chart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getMovementIcon = (entry: ChartEntry) => {
    if (entry.is_new_entry) return "🆕";
    if (entry.is_bullet) return "🔥";
    if (entry.position === 1 && entry.weeks_on_chart > 1) return `👑`;
    if (!entry.prev_position) return null;
    if (entry.prev_position > entry.position) return "⬆️";
    if (entry.prev_position < entry.position) return "⬇️";
    return null;
  };

  const getMovementText = (entry: ChartEntry) => {
    if (entry.is_new_entry) return "NEW";
    if (entry.is_bullet) return `BULLET`;
    if (entry.position === 1 && entry.weeks_on_chart > 1) return `${entry.weeks_on_chart}w`;
    if (!entry.prev_position) return "";
    const change = Math.abs(entry.prev_position - entry.position);
    if (entry.prev_position > entry.position) return `+${change}`;
    if (entry.prev_position < entry.position) return `-${change}`;
    return "";
  };

  const getPositionColor = (position: number) => {
    if (position === 1) return "text-yellow-400";
    if (position <= 10) return "text-violet-400";
    if (position <= 20) return "text-cyan-400";
    return "text-gray-400";
  };

  const chartToShow = reverseOrder ? [...entries].reverse() : entries;

  return (
    <div className="min-h-screen bg-[#080c14] text-white pb-24">
      <MobileNav isScrolled={true} />

      {/* Header Section */}
      <section className="pt-24 px-6 bg-gradient-to-b from-[#0f1623] to-[#080c14]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-2 flex items-center gap-4">
              🎙️ <span>The Agentic Charts</span>
            </h1>
            <p className="text-gray-400">Hosted by Mason · Week of {formatDate(selectedWeek)}</p>
          </div>

          {/* Controls */}
          <div className="flex gap-4 items-center mb-8 flex-wrap">
            {availableWeeks.length > 0 && (
              <div className="relative">
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="px-4 py-2 bg-[#0f1623] border border-[#1e2d45] rounded-lg text-white focus:outline-none focus:border-[#7c3aed]"
                >
                  {availableWeeks.map((week) => (
                    <option key={week} value={week}>
                      Week of {formatDate(week)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setReverseOrder(!reverseOrder)}
              className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d2fb8] rounded-lg font-semibold transition-all duration-200"
            >
              {reverseOrder ? "#40 → #1" : "#1 → #40"}
            </button>

            <button
              onClick={() => setIsShowingDedicationModal(true)}
              className="px-4 py-2 bg-[#06b6d4] hover:bg-[#0891b2] rounded-lg font-semibold transition-all duration-200"
            >
              💌 Send a Dedication
            </button>
          </div>
        </div>
      </section>

      {/* Chart List */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading chart...</div>
          ) : chartToShow.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No entries for this week yet.</div>
          ) : (
            <div className="space-y-4">
              {chartToShow.map((entry) => (
                <div
                  key={entry.id}
                  className={`bg-[#0f1623] border rounded-lg p-4 hover:border-[#7c3aed] transition-all duration-200 ${
                    entry.position === 1 ? "border-yellow-500/50 shadow-lg shadow-yellow-500/10" : "border-[#1e2d45]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Position & Movement */}
                    <div className="flex flex-col items-center gap-2 w-16 flex-shrink-0">
                      <div className={`text-3xl font-bold ${getPositionColor(entry.position)}`}>
                        #{entry.position}
                      </div>
                      {getMovementIcon(entry) && (
                        <div className="flex items-center gap-1 text-sm">
                          <span>{getMovementIcon(entry)}</span>
                          <span className={entry.is_bullet || (entry.prev_position && entry.prev_position > entry.position) ? "text-green-400" : "text-red-400"}>
                            {getMovementText(entry)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Cover Art */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#1e2d45]">
                      {entry.track.cover_url ? (
                        <img src={entry.track.cover_url} alt={entry.track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-2xl">🎵</span>
                        </div>
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold truncate">{entry.track.title}</h3>
                      <p className="text-sm text-gray-400">@{entry.track.profiles?.username} · verified ✓</p>
                      <p className="text-sm text-gray-500 italic mt-2">{entry.mason_commentary}</p>

                      {/* Play Button */}
                      <div className="flex gap-3 mt-3 text-xs">
                        <button className="flex items-center gap-1 px-3 py-1 bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 rounded-full transition-all duration-200">
                          <Play className="w-3 h-3" /> Play
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 bg-[#0f1623] hover:bg-[#1e2d45] rounded-full transition-all duration-200">
                          <Heart className="w-3 h-3" /> {entry.play_count_week}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Dedications */}
      {dedications.length > 0 && (
        <section className="py-12 px-6 bg-[#0f1623]/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">💌 Long Distance Dedications</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {dedications.map((ded) => (
                <div key={ded.id} className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6">
                  <p className="text-gray-300 italic mb-4">{ded.message}</p>
                  <p className="text-sm text-gray-400">
                    From <span className="text-white font-semibold">{ded.sender_name}</span> to{" "}
                    <span className="text-[#06b6d4] font-semibold">{ded.recipient_name}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Track: {ded.track?.title || "Unknown"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dedication Modal */}
      {isShowingDedicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Send a Dedication</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await fetch("/api/charts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      sender_name: formData.get("sender_name"),
                      recipient_name: formData.get("recipient_name"),
                      message: formData.get("message"),
                      track_id: formData.get("track_id") || entries[0]?.track.id,
                    }),
                  });
                  setIsShowingDedicationModal(false);
                  fetchChart();
                } catch (error) {
                  console.error("Failed to send dedication:", error);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-2">From</label>
                <input
                  type="text"
                  name="sender_name"
                  placeholder="Your name"
                  className="w-full px-3 py-2 bg-[#080c14] border border-[#1e2d45] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">To</label>
                <input
                  type="text"
                  name="recipient_name"
                  placeholder="Recipient's name"
                  className="w-full px-3 py-2 bg-[#080c14] border border-[#1e2d45] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Message (500 chars max)</label>
                <textarea
                  name="message"
                  placeholder="Your dedication message..."
                  maxLength={500}
                  className="w-full px-3 py-2 bg-[#080c14] border border-[#1e2d45] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] resize-none"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsShowingDedicationModal(false)}
                  className="flex-1 px-4 py-2 bg-[#1e2d45] hover:bg-[#2a3a52] rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#06b6d4] hover:bg-[#0891b2] rounded-lg font-semibold transition-all duration-200"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
