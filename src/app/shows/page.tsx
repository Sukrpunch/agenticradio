"use client";

import { useState, useEffect } from "react";
import { Bell, Clock, Radio } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

interface LiveShow {
  id: string;
  title: string;
  theme: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "live" | "ended";
  listener_count: number;
  stream_url?: string;
}

export default function ShowsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentShow, setCurrentShow] = useState<LiveShow | null>(null);
  const [upcomingShows, setUpcomingShows] = useState<LiveShow[]>([]);
  const [pastShows, setPastShows] = useState<LiveShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reminders, setReminders] = useState<Set<string>>(new Set());

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 0);
    });
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const res = await fetch("/api/shows");
      const data = await res.json();
      setCurrentShow(data.current);
      setUpcomingShows(data.upcoming || []);
      setPastShows(data.past || []);
    } catch (error) {
      console.error("Failed to fetch shows:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReminder = (showId: string) => {
    const newReminders = new Set(reminders);
    if (newReminders.has(showId)) {
      newReminders.delete(showId);
    } else {
      newReminders.add(showId);
    }
    setReminders(newReminders);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/New_York",
    };
    return date.toLocaleString("en-US", options);
  };

  const sampleShows: LiveShow[] = [
    {
      id: "sample-1",
      title: "Lo-Fi Midnight Sessions",
      theme: "lo-fi",
      description: "Late night vibes with chill lo-fi beats",
      scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 60,
      status: "scheduled",
      listener_count: 0,
    },
    {
      id: "sample-2",
      title: "Synthwave Sundown",
      theme: "synthwave",
      description: "Retro-futuristic synthwave journey",
      scheduled_at: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 90,
      status: "scheduled",
      listener_count: 0,
    },
    {
      id: "sample-3",
      title: "Ambient Sunday",
      theme: "ambient",
      description: "Relaxing ambient soundscapes",
      scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration_minutes: 120,
      status: "scheduled",
      listener_count: 0,
    },
  ];

  const displayUpcoming = upcomingShows.length > 0 ? upcomingShows : sampleShows;

  return (
    <div className="min-h-screen bg-[#080c14]">
      <MobileNav isScrolled={isScrolled} />
      <div className="pt-20 pb-12">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-[#7c3aed]">🎙️ Mason&apos;s</span>
              <br />
              <span className="text-white">Live Shows</span>
            </h1>
            <p className="text-xl text-gray-400">
              Tune in when Mason takes the mic
            </p>
          </div>

          {/* Current Live Show */}
          {currentShow && (
            <div className="mb-12 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-900/30 to-transparent p-6 animate-pulse">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-semibold">LIVE NOW</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentShow.title}
                  </h2>
                  <p className="text-lg text-gray-300">
                    Mason is spinning now · {currentShow.listener_count.toLocaleString()} listeners
                  </p>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#6d2dd4] hover:to-[#0597b0] text-white rounded-lg font-semibold transition-all duration-200">
                  🎧 Tune In →
                </button>
              </div>
            </div>
          )}

          {/* Upcoming Shows */}
          {displayUpcoming.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6">Upcoming Shows</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayUpcoming.map((show) => (
                  <div
                    key={show.id}
                    className="rounded-lg border border-[#1e2d45] bg-[#0f1623] p-6 hover:border-[#7c3aed] transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">
                          {formatDate(show.scheduled_at)}
                        </p>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#7c3aed] transition-colors">
                          {show.title}
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] text-xs font-semibold">
                        {show.theme}
                      </span>
                    </div>

                    {show.description && (
                      <p className="text-sm text-gray-400 mb-4">{show.description}</p>
                    )}

                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{show.duration_minutes} minutes</span>
                    </div>

                    <button
                      onClick={() => toggleReminder(show.id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        reminders.has(show.id)
                          ? "bg-[#7c3aed] text-white"
                          : "bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55]"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      {reminders.has(show.id) ? "Reminder Set" : "Set Reminder"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Shows */}
          {pastShows.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Past Shows</h2>
              <div className="space-y-3">
                {pastShows.map((show) => (
                  <div
                    key={show.id}
                    className="rounded-lg border border-[#1e2d45] bg-[#0f1623] p-4 hover:border-[#7c3aed] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {show.title}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatDate(show.scheduled_at)}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] text-xs font-semibold">
                        {show.theme}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
