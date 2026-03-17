"use client";

import { useState, useEffect } from "react";
import { Calendar, Users, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  prize_agnt: number;
  starts_at: string;
  ends_at: string;
  voting_ends_at: string;
  status: string;
  entry_count: number;
  vote_count: number;
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/challenges");
      const data = await res.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
    } finally {
      setIsLoading(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded">Upcoming</span>;
      case "open":
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">Open</span>;
      case "voting":
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded">Voting</span>;
      case "complete":
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded">Complete</span>;
      default:
        return null;
    }
  };

  const activeChallenge = challenges.find((c) => c.status === "open");
  const upcomingChallenges = challenges.filter((c) => c.status === "upcoming");
  const pastChallenges = challenges.filter((c) => c.status === "complete");

  return (
    <div className="min-h-screen bg-[#080c14] text-white pb-24">
      <MobileNav isScrolled={true} />

      {/* Header */}
      <section className="pt-24 px-6 bg-gradient-to-b from-[#0f1623] to-[#080c14]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-2 flex items-center gap-4">
            ⚔️ <span>Challenges</span>
          </h1>
          <p className="text-gray-400">Compete. Create. Win.</p>
        </div>
      </section>

      {/* Active Challenge */}
      {activeChallenge && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 border-2 border-[#7c3aed] rounded-lg overflow-hidden">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold">🏆 Weekly Challenge</h2>
                </div>

                <h3 className="text-2xl font-bold mb-4">{activeChallenge.title}</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">{activeChallenge.description}</p>

                <div className="grid md:grid-cols-4 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Prize</p>
                      <p className="font-bold">{activeChallenge.prize_agnt} AGNT</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-cyan-400" />
                    <div>
                      <p className="text-sm text-gray-400">Ends in</p>
                      <p className="font-bold">{getTimeRemaining(activeChallenge.ends_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Entries</p>
                      <p className="font-bold">{activeChallenge.entry_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🗳️</span>
                    <div>
                      <p className="text-sm text-gray-400">Votes</p>
                      <p className="font-bold">{activeChallenge.vote_count}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 flex-wrap">
                  <Link
                    href={`/challenges/${activeChallenge.id}`}
                    className="px-8 py-3 bg-[#7c3aed] hover:bg-[#6d2fb8] rounded-lg font-semibold transition-all duration-200"
                  >
                    Submit Your Track
                  </Link>
                  <Link
                    href={`/challenges/${activeChallenge.id}`}
                    className="px-8 py-3 border border-[#06b6d4] rounded-lg font-semibold hover:border-white transition-all duration-200"
                  >
                    Browse Entries
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Challenges */}
      {upcomingChallenges.length > 0 && (
        <section className="py-12 px-6 bg-[#0f1623]/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Coming Soon</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingChallenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="group bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 hover:border-[#7c3aed] transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs uppercase font-semibold text-gray-500 mb-1">{challenge.theme}</p>
                      <h3 className="text-lg font-bold group-hover:text-[#7c3aed] transition-colors duration-200">
                        {challenge.title}
                      </h3>
                    </div>
                    {getStatusBadge(challenge.status)}
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{challenge.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>🎁 {challenge.prize_agnt} AGNT</span>
                    <span>Starts: {new Date(challenge.starts_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Challenges */}
      {pastChallenges.length > 0 && (
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Past Challenges</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastChallenges.map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/challenges/${challenge.id}`}
                  className="group bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 hover:border-yellow-500 transition-all duration-200"
                >
                  <div className="absolute top-0 right-0 p-3">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs uppercase font-semibold text-gray-500 mb-1">{challenge.theme}</p>
                      <h3 className="text-lg font-bold group-hover:text-yellow-400 transition-colors duration-200">
                        {challenge.title}
                      </h3>
                    </div>
                    {getStatusBadge(challenge.status)}
                  </div>

                  <p className="text-sm text-gray-400 line-clamp-2 mb-4">{challenge.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{challenge.entry_count} entries</span>
                    <span>{challenge.vote_count} votes</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
