'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { Music, TrendingUp, Users, Radio } from 'lucide-react';
import Link from 'next/link';

interface Breakdown {
  id: string;
  week_start: string;
  highlight_text: string;
  new_creators_count: number;
  total_plays_week: number;
  trending_genre: string;
  top_track_id?: string;
  top_creator_id?: string;
  top_track?: {
    id: string;
    title: string;
    cover_url?: string;
  };
  top_creator?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

export default function BreakdownPage() {
  const { play } = usePlayer();
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [previousBreakdowns, setPreviousBreakdowns] = useState<Breakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/breakdown');
        if (!response.ok) return;

        const { breakdown: bd } = await response.json();
        setBreakdown(bd);

        // Fetch previous breakdowns
        const { data: previous } = await supabase
          .from('weekly_breakdowns')
          .select(`
            id, week_start, highlight_text, trending_genre,
            new_creators_count, total_plays_week
          `)
          .order('week_start', { ascending: false })
          .limit(5);

        if (previous) {
          setPreviousBreakdowns(previous.slice(1)); // Skip the latest one
        }
      } catch (error) {
        console.error('Failed to fetch breakdown:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakdown();
  }, []);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      <MobileNav isScrolled={isScrolled} />

      <main className="flex-1 pt-24 px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Radio className="w-8 h-8 text-violet-500" />
              <h1 className="text-4xl font-bold">Mason's Weekly Breakdown</h1>
            </div>
            <p className="text-gray-400">
              Your platform pulse, every week.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <p>Loading breakdown...</p>
            </div>
          ) : breakdown ? (
            <div className="space-y-8">
              {/* Current Breakdown */}
              <div className="bg-gradient-to-br from-violet-900/20 to-cyan-900/20 border border-violet-500/30 rounded-xl p-8">
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Week of {formatDate(breakdown.week_start)}</p>
                  <p className="text-lg leading-relaxed italic text-gray-200">
                    "{breakdown.highlight_text}"
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-violet-400">{breakdown.total_plays_week.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-2">Total Plays</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-cyan-400">{breakdown.new_creators_count}</p>
                    <p className="text-xs text-gray-400 mt-2">New Creators</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-pink-400">{breakdown.trending_genre}</p>
                    <p className="text-xs text-gray-400 mt-2">Trending Genre</p>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                    <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Weekly Peak</p>
                  </div>
                </div>
              </div>

              {/* Track of the Week */}
              {breakdown.top_track && (
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Music className="w-5 h-5 text-violet-500" />
                    Track of the Week
                  </h2>
                  <Link href={`/tracks/${breakdown.top_track.id}`}>
                    <div className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-zinc-700/50 rounded-lg p-4 hover:border-violet-500/50 transition-colors duration-200">
                      <div className="flex items-start gap-4">
                        {breakdown.top_track.cover_url ? (
                          <img
                            src={breakdown.top_track.cover_url}
                            alt={breakdown.top_track.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-zinc-700 flex items-center justify-center">
                            <Music className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg line-clamp-2">{breakdown.top_track.title}</h3>
                          <p className="text-sm text-gray-400 mt-2">Click to listen</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Creator of the Week */}
              {breakdown.top_creator && (
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-500" />
                    Creator of the Week
                  </h2>
                  <Link href={`/creators/${breakdown.top_creator.username}`}>
                    <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-zinc-700/50 rounded-lg p-4 hover:border-cyan-500/50 transition-colors duration-200">
                      <div className="flex items-center gap-4">
                        {breakdown.top_creator.avatar_url ? (
                          <img
                            src={breakdown.top_creator.avatar_url}
                            alt={breakdown.top_creator.username}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{breakdown.top_creator.display_name}</h3>
                          <p className="text-sm text-gray-400">@{breakdown.top_creator.username}</p>
                          <p className="text-xs text-gray-500 mt-1">This week's platform leader</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Previous Breakdowns */}
              {previousBreakdowns.length > 0 && (
                <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-6">
                  <h2 className="text-lg font-bold mb-4">Previous Breakdowns</h2>
                  <div className="space-y-2">
                    {previousBreakdowns.map(pb => (
                      <div
                        key={pb.id}
                        className="p-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg hover:border-violet-500/30 transition-colors duration-200"
                      >
                        <Link href={`#${pb.week_start}`} className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-sm">Week of {formatDate(pb.week_start)}</p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{pb.highlight_text}</p>
                          </div>
                          <span className="text-2xl ml-2">→</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Radio className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No breakdowns published yet.</p>
              <p className="text-gray-500 mt-2">Check back soon for your first weekly summary!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
