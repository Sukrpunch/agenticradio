"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Music, Radio } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

interface Station {
  id: string;
  name: string;
  slug: string;
  description?: string;
  theme: string;
  owner_id: string;
  track_count: number;
  follower_count: number;
  is_public: boolean;
  cover_url?: string;
  profiles?: { username: string };
  created_at: string;
}

export default function StationsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [myStations, setMyStations] = useState<Station[]>([]);
  const [followedStations, setFollowedStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStation, setNewStation] = useState({
    name: "",
    theme: "",
    description: "",
  });
  const { user } = useAuth();

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 0);
    });
    fetchStations();
  }, [user]);

  const fetchStations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/stations?limit=50");
      const data = await res.json();
      setStations(data.stations || []);

      // TODO: Fetch user's stations and followed stations when auth is available
    } catch (error) {
      console.error("Failed to fetch stations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to create a station");
      return;
    }

    if (!newStation.name || !newStation.theme) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        alert("Authentication token not found");
        return;
      }

      const authData = JSON.parse(token);
      const res = await fetch("/api/stations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.session?.access_token}`,
        },
        body: JSON.stringify(newStation),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewStation({ name: "", theme: "", description: "" });
        fetchStations();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create station");
      }
    } catch (error) {
      console.error("Failed to create station:", error);
      alert("Failed to create station");
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14]">
      <MobileNav isScrolled={isScrolled} />
      <div className="pt-20 pb-12">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="text-[#7c3aed]">📻 Community</span>
                <br />
                <span className="text-white">Stations</span>
              </h1>
              <p className="text-xl text-gray-400">
                Themed stations created by the community
              </p>
            </div>

            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#6d2dd4] hover:to-[#0597b0] text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Create Station
              </button>
            )}
          </div>

          {/* Create Station Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Station</h2>

                <form onSubmit={handleCreateStation} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      Station Name *
                    </label>
                    <input
                      type="text"
                      value={newStation.name}
                      onChange={(e) =>
                        setNewStation({ ...newStation, name: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-[#1e2d45] border border-[#2a3a55] text-white focus:outline-none focus:border-[#7c3aed] transition-colors"
                      placeholder="Late Night Lo-Fi"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      Theme *
                    </label>
                    <select
                      value={newStation.theme}
                      onChange={(e) =>
                        setNewStation({ ...newStation, theme: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-[#1e2d45] border border-[#2a3a55] text-white focus:outline-none focus:border-[#7c3aed] transition-colors"
                    >
                      <option value="">Select a theme</option>
                      <option value="lo-fi">Lo-Fi</option>
                      <option value="synthwave">Synthwave</option>
                      <option value="ambient">Ambient</option>
                      <option value="hip-hop">Hip-Hop</option>
                      <option value="dnb">DNB</option>
                      <option value="techno">Techno</option>
                      <option value="jazz">Jazz</option>
                      <option value="classical">Classical</option>
                      <option value="pop">Pop</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400 block mb-2">
                      Description
                    </label>
                    <textarea
                      value={newStation.description}
                      onChange={(e) =>
                        setNewStation({ ...newStation, description: e.target.value })
                      }
                      className="w-full px-4 py-2 rounded-lg bg-[#1e2d45] border border-[#2a3a55] text-white focus:outline-none focus:border-[#7c3aed] transition-colors resize-none"
                      placeholder="What's your station about?"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55] font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white font-semibold hover:from-[#6d2dd4] hover:to-[#0597b0] transition-all duration-200"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Featured Stations */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Stations</h2>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading stations...</p>
              </div>
            ) : stations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No stations yet. Be the first to create one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stations.slice(0, 6).map((station) => (
                  <Link
                    key={station.id}
                    href={`/stations/${station.slug}`}
                    className="rounded-lg border border-[#1e2d45] bg-[#0f1623] p-6 hover:border-[#7c3aed] transition-all duration-200 group cursor-pointer"
                  >
                    {station.cover_url && (
                      <div className="w-full h-32 rounded-lg mb-4 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
                        <img
                          src={station.cover_url}
                          alt={station.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-white group-hover:text-[#7c3aed] transition-colors mb-2">
                      {station.name}
                    </h3>

                    {station.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {station.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Music className="w-4 h-4" />
                        <span>{station.track_count} tracks</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{station.follower_count} followers</span>
                      </div>
                    </div>

                    <span className="inline-block mt-4 px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#7c3aed] text-xs font-semibold">
                      {station.theme}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* View All Link */}
          {stations.length > 6 && (
            <div className="text-center mb-12">
              <Link
                href="/stations?page=1"
                className="text-[#06b6d4] hover:text-[#7c3aed] font-semibold transition-colors"
              >
                View All Stations →
              </Link>
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
}
