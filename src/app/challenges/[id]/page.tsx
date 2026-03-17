"use client";

import { useState, useEffect } from "react";
import { Trophy, Play, Vote, Clock, Users, Music } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  rules: string;
  prize_agnt: number;
  starts_at: string;
  ends_at: string;
  voting_ends_at: string;
  status: string;
  entries: ChallengeEntry[];
  vote_count: number;
  winner: any;
}

interface ChallengeEntry {
  id: string;
  track: {
    id: string;
    title: string;
    cover_url: string;
    audio_url: string;
    duration_ms: number;
  };
  creator: {
    id: string;
    username: string;
  };
  vote_count: number;
}

export default function ChallengePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useAuth();
  const { openModal } = useAuthModal();
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowingSubmit, setIsShowingSubmit] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const fetchChallenge = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/challenges/${id}`);
      const data = await res.json();
      setChallenge(data);
    } catch (error) {
      console.error("Failed to fetch challenge:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (entryId: string) => {
    if (!user) {
      openModal();
      return;
    }

    if (userVotes.has(entryId)) {
      alert("You have already voted in this challenge");
      return;
    }

    try {
      const token = await fetch("/api/auth/token").then((r) => r.json());
      const res = await fetch(`/api/challenges/${id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entry_id: entryId }),
      });

      if (res.ok) {
        setUserVotes(new Set([...userVotes, entryId]));
        fetchChallenge();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleSubmitTrack = async (trackId: string) => {
    if (!user) {
      openModal();
      return;
    }

    try {
      const token = await fetch("/api/auth/token").then((r) => r.json());
      const res = await fetch(`/api/challenges/${id}/enter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ track_id: trackId }),
      });

      if (res.ok) {
        setIsShowingSubmit(false);
        fetchChallenge();
        alert("Track submitted successfully!");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to submit track");
      }
    } catch (error) {
      console.error("Failed to submit track:", error);
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff < 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white pb-24">
        <MobileNav isScrolled={true} />
        <div className="pt-32 text-center">
          <p className="text-gray-400">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-[#080c14] text-white pb-24">
        <MobileNav isScrolled={true} />
        <div className="pt-32 text-center">
          <p className="text-gray-400">Challenge not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white pb-24">
      <MobileNav isScrolled={true} />

      {/* Header */}
      <section className="pt-24 px-6 bg-gradient-to-b from-[#0f1623] to-[#080c14]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm uppercase font-semibold text-gray-500 mb-2">{challenge.theme}</p>
              <h1 className="text-5xl font-bold mb-4">{challenge.title}</h1>
            </div>
            <div className="text-right">
              <span className={`px-4 py-2 rounded-lg font-semibold ${
                challenge.status === "open"
                  ? "bg-green-500/20 text-green-400"
                  : challenge.status === "voting"
                  ? "bg-purple-500/20 text-purple-400"
                  : challenge.status === "complete"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-blue-500/20 text-blue-400"
              }`}>
                {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
              </span>
            </div>
          </div>

          <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-3xl">{challenge.description}</p>

          {/* Countdown & Stats */}
          <div className="grid md:grid-cols-4 gap-6 bg-[#0f1623]/50 rounded-lg p-6 mb-8">
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" /> Time Remaining
              </p>
              <p className="text-2xl font-bold">
                {challenge.status === "complete"
                  ? "Complete"
                  : challenge.status === "voting"
                  ? getTimeRemaining(challenge.voting_ends_at)
                  : getTimeRemaining(challenge.ends_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" /> Entries
              </p>
              <p className="text-2xl font-bold">{challenge.entries?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Vote className="w-4 h-4" /> Votes
              </p>
              <p className="text-2xl font-bold">{challenge.vote_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4" /> Prize
              </p>
              <p className="text-2xl font-bold">{challenge.prize_agnt} AGNT</p>
            </div>
          </div>

          {/* Action Buttons */}
          {challenge.status === "open" && (
            <button
              onClick={() => setIsShowingSubmit(true)}
              className="px-8 py-3 bg-[#7c3aed] hover:bg-[#6d2fb8] rounded-lg font-semibold transition-all duration-200"
            >
              Submit Your Track
            </button>
          )}
        </div>
      </section>

      {/* Rules */}
      {challenge.rules && (
        <section className="py-8 px-6 bg-[#0f1623]/30">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-xl font-bold mb-4">📋 Rules</h3>
            <p className="text-gray-300 whitespace-pre-line">{challenge.rules}</p>
          </div>
        </section>
      )}

      {/* Winner */}
      {challenge.status === "complete" && challenge.winner && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" /> Winner
            </h2>
            <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500 rounded-lg overflow-hidden">
              <div className="p-8 flex gap-6">
                {challenge.winner.cover_url && (
                  <img
                    src={challenge.winner.cover_url}
                    alt={challenge.winner.title}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="inline-block px-3 py-1 bg-yellow-500/30 text-yellow-300 rounded-full text-sm font-semibold mb-4">
                    🏆 Winner
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{challenge.winner.title}</h3>
                  <p className="text-gray-300 mb-4">by @{challenge.winner.profiles?.username}</p>
                  <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-semibold transition-all duration-200">
                    Play Winning Track
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Entries */}
      {challenge.entries && challenge.entries.length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">
              {challenge.status === "voting" ? "🗳️ Vote for Your Favorite" : "📝 Entries"}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {challenge.entries
                .sort((a, b) => b.vote_count - a.vote_count)
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="group bg-[#0f1623] border border-[#1e2d45] rounded-lg overflow-hidden hover:border-[#7c3aed] transition-all duration-200"
                  >
                    {/* Cover */}
                    <div className="relative aspect-square overflow-hidden bg-[#080c14]">
                      {entry.track.cover_url ? (
                        <img
                          src={entry.track.cover_url}
                          alt={entry.track.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="w-12 h-12 text-[#1e2d45]" />
                        </div>
                      )}

                      {/* Play Button */}
                      <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Play className="w-12 h-12 text-white fill-white" />
                      </button>

                      {/* Vote Badge */}
                      {challenge.status === "voting" && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-purple-500/80 rounded-full text-xs font-bold">
                          {entry.vote_count} 🗳️
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold truncate mb-1">{entry.track.title}</h3>
                      <p className="text-sm text-gray-400 mb-4">@{entry.creator.username}</p>

                      {challenge.status === "voting" ? (
                        <button
                          onClick={() => handleVote(entry.id)}
                          disabled={userVotes.has(entry.id)}
                          className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            userVotes.has(entry.id)
                              ? "bg-[#1e2d45] text-gray-400 cursor-not-allowed"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          }`}
                        >
                          {userVotes.has(entry.id) ? "✓ Voted" : "Vote for This"}
                        </button>
                      ) : (
                        <button className="w-full px-3 py-2 bg-[#7c3aed] hover:bg-[#6d2fb8] rounded-lg font-semibold text-sm transition-all duration-200">
                          Play
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Submit Modal */}
      {isShowingSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Submit Your Track</h3>
            <p className="text-gray-400 mb-4">Select a track from your library to submit</p>

            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {/* Placeholder tracks - would be fetched from user's library */}
              <button
                onClick={() => handleSubmitTrack("track-1")}
                className="w-full text-left p-3 bg-[#080c14] hover:bg-[#0f1623] border border-[#1e2d45] rounded-lg transition-all duration-200"
              >
                <p className="font-semibold">My First Track</p>
                <p className="text-xs text-gray-500">3:45 · Published</p>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsShowingSubmit(false)}
                className="flex-1 px-4 py-2 bg-[#1e2d45] hover:bg-[#2a3a52] rounded-lg font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => alert("Select a track above")}
                className="flex-1 px-4 py-2 bg-[#7c3aed] hover:bg-[#6d2fb8] rounded-lg font-semibold transition-all duration-200"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
