"use client";

import { useState, useEffect } from "react";
import { Heart, Play, Share2, Trash2, Plus, Users } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { PlayerCard } from "@/components/PlayerCard";

interface Track {
  id: string;
  title: string;
  creator_id: string;
  profiles: { username: string };
  cover_url?: string;
  duration_ms: number;
  audio_url: string;
  like_count: number;
  play_count: number;
  tags?: string[];
  genre?: string;
}

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
  tracks: Track[];
  profiles?: { username: string; id: string };
  created_at: string;
}

export default function StationPage({ params }: { params: { slug: string } }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [station, setStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 0);
    });
    fetchStation();
  }, [params.slug, user]);

  const fetchStation = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/stations/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setStation(data);
        setIsOwner(user?.id === data.owner_id);
      }
    } catch (error) {
      console.error("Failed to fetch station:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      alert("Please sign in to follow stations");
      return;
    }

    try {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) return;

      const authData = JSON.parse(token);
      const method = isFollowing ? "DELETE" : "POST";

      const res = await fetch(`/api/stations/${params.slug}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${authData.session?.access_token}`,
        },
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        fetchStation();
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/stations/${params.slug}`;
    navigator.clipboard.writeText(url);
    alert("Station link copied to clipboard!");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this station?")) return;

    try {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) return;

      const authData = JSON.parse(token);
      const res = await fetch(`/api/stations/${params.slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authData.session?.access_token}`,
        },
      });

      if (res.ok) {
        window.location.href = "/stations";
      }
    } catch (error) {
      console.error("Failed to delete station:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14]">
        <MobileNav isScrolled={isScrolled} />
        <div className="pt-20 pb-12 flex items-center justify-center">
          <p className="text-gray-400">Loading station...</p>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="min-h-screen bg-[#080c14]">
        <MobileNav isScrolled={isScrolled} />
        <div className="pt-20 pb-12 flex items-center justify-center">
          <p className="text-gray-400">Station not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14]">
      <MobileNav isScrolled={isScrolled} />
      <div className="pt-20 pb-12">
        {/* Station Header */}
        <section className="max-w-7xl mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Cover Art */}
            {station.cover_url ? (
              <img
                src={station.cover_url}
                alt={station.name}
                className="w-48 h-48 rounded-lg object-cover"
              />
            ) : (
              <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center">
                <span className="text-6xl">📻</span>
              </div>
            )}

            {/* Station Info */}
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">{station.theme}</p>
                <h1 className="text-5xl font-bold text-white mb-4">{station.name}</h1>

                {station.description && (
                  <p className="text-lg text-gray-300 mb-6">{station.description}</p>
                )}

                <div className="flex items-center gap-4 text-gray-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{station.follower_count} followers</span>
                  </div>
                  <span>•</span>
                  <span>{station.track_count} tracks</span>
                  <span>•</span>
                  <Link
                    href={`/creators/${station.profiles?.username}`}
                    className="text-[#7c3aed] hover:text-[#06b6d4] transition-colors"
                  >
                    by @{station.profiles?.username}
                  </Link>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#6d2dd4] hover:to-[#0597b0] text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200">
                  <Play className="w-5 h-5" />
                  Play Station
                </button>

                <button
                  onClick={handleFollow}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 ${
                    isFollowing
                      ? "bg-[#7c3aed] text-white"
                      : "bg-[#1e2d45] text-gray-300 hover:bg-[#2a3a55]"
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  onClick={handleShare}
                  className="px-6 py-3 bg-[#1e2d45] hover:bg-[#2a3a55] text-gray-300 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>

                {isOwner && (
                  <button
                    onClick={handleDelete}
                    className="px-6 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tracks Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Tracks</h2>
              {isOwner && (
                <button className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d2dd4] text-white rounded-lg font-semibold flex items-center gap-2 transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  Add Track
                </button>
              )}
            </div>

            {station.tracks && station.tracks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {station.tracks.map((track) => (
                  <PlayerCard key={track.id} track={track} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg border border-[#1e2d45] bg-[#0f1623]">
                <p className="text-gray-400 mb-4">No tracks in this station yet</p>
                {isOwner && (
                  <button className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d2dd4] text-white rounded-lg font-semibold transition-all duration-200">
                    Add First Track
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
