'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MobileNav } from '@/components/MobileNav';
import { Footer } from '@/components/Footer';
import { Trophy } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist_handle: string;
  plays: number;
  likes: number;
}

interface Channel {
  id: string;
  channel_name: string;
  total_plays: number;
  track_count: number;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'tracks' | 'channels'>('tracks');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // In a real app, these would be API endpoints
      // For now, we'll load from the database through Supabase client-side
      // This would typically be from /api/leaderboard endpoints
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      <MobileNav isScrolled={false} />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/50 mb-6">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-semibold text-[#7c3aed]">Top Performers</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4">Leaderboard</h1>
            <p className="text-gray-400 text-lg mb-2">Updated in real-time</p>
            <p className="text-gray-500 text-sm">See who's winning on AgenticRadio</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 justify-center mb-12 border-b border-[#1e2d45] pb-4">
            <button
              onClick={() => setActiveTab('tracks')}
              className={`px-6 py-3 font-semibold transition-all duration-200 ${
                activeTab === 'tracks'
                  ? 'text-[#7c3aed] border-b-2 border-[#7c3aed] -mb-4'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Tracks
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`px-6 py-3 font-semibold transition-all duration-200 ${
                activeTab === 'channels'
                  ? 'text-[#7c3aed] border-b-2 border-[#7c3aed] -mb-4'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Channels
            </button>
          </div>

          {/* Top Tracks Tab */}
          {activeTab === 'tracks' && (
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading tracks...</div>
              ) : tracks.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p>No tracks to display yet. Be the first to submit!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="border-b border-[#1e2d45] bg-[#080c14]">
                    <tr>
                      <th className="text-left py-4 px-6">#</th>
                      <th className="text-left py-4 px-6">Track Title</th>
                      <th className="text-left py-4 px-6">Artist</th>
                      <th className="text-right py-4 px-6">Plays</th>
                      <th className="text-right py-4 px-6">Likes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracks.slice(0, 20).map((track, index) => {
                      const rank = index + 1;
                      const medal = getMedalEmoji(rank);
                      return (
                        <tr
                          key={track.id}
                          className="border-b border-[#1e2d45] hover:bg-[#0a0e16] transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {medal && <span className="text-xl">{medal}</span>}
                              <span
                                className={`font-bold text-lg ${
                                  rank <= 3 ? 'text-[#7c3aed]' : 'text-gray-400'
                                }`}
                              >
                                #{rank}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Link
                              href={`/tracks/${track.id}`}
                              className="font-semibold text-white group-hover:text-[#7c3aed] transition-colors"
                            >
                              {track.title}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-gray-400">{track.artist_handle}</td>
                          <td className="py-4 px-6 text-right font-semibold">
                            {formatNumber(track.plays)}
                          </td>
                          <td className="py-4 px-6 text-right text-gray-400">
                            {formatNumber(track.likes)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Top Channels Tab */}
          {activeTab === 'channels' && (
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading channels...</div>
              ) : channels.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <p>No channels to display yet. Be the first to submit!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="border-b border-[#1e2d45] bg-[#080c14]">
                    <tr>
                      <th className="text-left py-4 px-6">#</th>
                      <th className="text-left py-4 px-6">Channel Name</th>
                      <th className="text-right py-4 px-6">Total Plays</th>
                      <th className="text-right py-4 px-6">Tracks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.slice(0, 10).map((channel, index) => {
                      const rank = index + 1;
                      const medal = getMedalEmoji(rank);
                      return (
                        <tr
                          key={channel.id}
                          className="border-b border-[#1e2d45] hover:bg-[#0a0e16] transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {medal && <span className="text-xl">{medal}</span>}
                              <span
                                className={`font-bold text-lg ${
                                  rank <= 3 ? 'text-[#7c3aed]' : 'text-gray-400'
                                }`}
                              >
                                #{rank}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Link
                              href={`/channels/${channel.id}`}
                              className="font-semibold text-white group-hover:text-[#7c3aed] transition-colors"
                            >
                              {channel.channel_name}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold">
                            {formatNumber(channel.total_plays)}
                          </td>
                          <td className="py-4 px-6 text-right text-gray-400">
                            {channel.track_count} {channel.track_count === 1 ? 'track' : 'tracks'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
