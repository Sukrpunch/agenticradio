'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, supabase } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

interface AnalyticsData {
  overview: {
    total_plays: number;
    total_plays_change: number;
    total_listeners: number;
    total_listeners_change: number;
    total_likes: number;
    total_likes_change: number;
    total_followers: number;
    total_followers_change: number;
    total_tips: number;
    total_tips_change: number;
    total_tracks: number;
  };
  plays_over_time: Array<{ date: string; plays: number }>;
  top_tracks: Array<{
    id: string;
    title: string;
    genre: string;
    plays: number;
    listeners: number;
    likes: number;
    tips: number;
  }>;
  follower_growth: Array<{ date: string; followers: number }>;
  genre_breakdown: Array<{ genre: string; count: number; plays: number }>;
  recent_activity: Array<any>;
}

type PeriodType = '7d' | '30d' | '90d' | 'all';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [period, setPeriod] = useState<PeriodType>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'plays',
    direction: 'desc',
  });

  // Redirect if not authenticated
  if (!loading && !user) {
    router.push('/sign-in');
    return null;
  }

  useEffect(() => {
    if (!user) return;

    const loadAnalytics = async () => {
      try {
        setLoadingData(true);
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.error('No auth token');
          return;
        }

        const response = await fetch(`/api/dashboard/analytics?period=${period}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch analytics');

        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadAnalytics();
  }, [user, period]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const getSortedTracks = () => {
    if (!analytics) return [];
    const sorted = [...analytics.top_tracks];
    sorted.sort((a, b) => {
      const aVal = (a as any)[sortConfig.key];
      const bVal = (b as any)[sortConfig.key];
      return sortConfig.direction === 'desc' ? bVal - aVal : aVal - bVal;
    });
    return sorted;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatChange = (change: number) => {
    if (change === 0) return '—';
    if (change > 0) return `↑ ${change}%`;
    return `↓ ${Math.abs(change)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change === 0) return 'text-gray-400';
    if (change > 0) return 'text-green-400';
    return 'text-red-400';
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const seconds = Math.floor((now.getTime() - created.getTime()) / 1000);

    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActivityEmoji = (type: string) => {
    switch (type) {
      case 'play':
        return '👂';
      case 'like':
        return '❤️';
      case 'follow':
        return '👋';
      case 'tip':
        return '💰';
      case 'comment':
        return '💬';
      default:
        return '📊';
    }
  };

  const getActivityText = (activity: any) => {
    switch (activity.type) {
      case 'play':
        return `Someone played "${activity.track_title}"`;
      case 'like':
        return `Someone liked "${activity.track_title}"`;
      case 'follow':
        return 'Someone followed you';
      case 'tip':
        return `Someone tipped ${activity.amount} AGNT`;
      case 'comment':
        return `@${activity.actor_username} commented on "${activity.track_title}"`;
      default:
        return 'Activity';
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No analytics data yet</h1>
          <p className="text-gray-400 mb-6">Start uploading and sharing tracks to see analytics.</p>
          <Link
            href="/upload"
            className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold px-6 py-2 rounded-lg transition inline-block"
          >
            Upload a Track
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Analytics</h1>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-300 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['7d', '30d', '90d', 'all'] as PeriodType[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                period === p
                  ? 'bg-[#7c3aed] text-white'
                  : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              {p === 'all' ? 'All Time' : p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {/* Plays */}
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Plays</p>
            <p className="text-2xl font-bold">{formatNumber(analytics.overview.total_plays)}</p>
            <p className={`text-xs mt-2 font-medium ${getChangeColor(analytics.overview.total_plays_change)}`}>
              {formatChange(analytics.overview.total_plays_change)}
            </p>
          </div>

          {/* Listeners */}
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Listeners</p>
            <p className="text-2xl font-bold">{formatNumber(analytics.overview.total_listeners)}</p>
            <p className={`text-xs mt-2 font-medium ${getChangeColor(analytics.overview.total_listeners_change)}`}>
              {formatChange(analytics.overview.total_listeners_change)}
            </p>
          </div>

          {/* Likes */}
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Likes</p>
            <p className="text-2xl font-bold">{formatNumber(analytics.overview.total_likes)}</p>
            <p className={`text-xs mt-2 font-medium ${getChangeColor(analytics.overview.total_likes_change)}`}>
              {formatChange(analytics.overview.total_likes_change)}
            </p>
          </div>

          {/* Followers */}
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Followers</p>
            <p className="text-2xl font-bold">{formatNumber(analytics.overview.total_followers)}</p>
            <p className={`text-xs mt-2 font-medium ${getChangeColor(analytics.overview.total_followers_change)}`}>
              {formatChange(analytics.overview.total_followers_change)}
            </p>
          </div>

          {/* AGNT Tips */}
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-1">AGNT Tips</p>
            <p className="text-2xl font-bold">{formatNumber(analytics.overview.total_tips)}</p>
            <p className={`text-xs mt-2 font-medium ${getChangeColor(analytics.overview.total_tips_change)}`}>
              {formatChange(analytics.overview.total_tips_change)}
            </p>
          </div>

          {/* Tracks */}
          <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-700">
            <p className="text-gray-400 text-xs uppercase font-semibold mb-1">Tracks</p>
            <p className="text-2xl font-bold">{analytics.overview.total_tracks}</p>
            <p className="text-xs mt-2 font-medium text-gray-400">—</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Plays Over Time Chart - spans 2 columns */}
          <div className="lg:col-span-2 bg-zinc-900 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-xl font-bold mb-4">Plays Over Time</h2>
            <PlayChart data={analytics.plays_over_time} />
          </div>

          {/* Genre Breakdown */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-xl font-bold mb-4">Genre Breakdown</h2>
            <GenreChart data={analytics.genre_breakdown} />
          </div>
        </div>

        {/* Top Tracks Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-zinc-900 rounded-lg p-6 border border-zinc-700 overflow-auto">
            <h2 className="text-xl font-bold mb-4">Top Tracks</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-gray-400">
                  <th className="text-left p-2 cursor-pointer hover:text-gray-300" onClick={() => handleSort('title')}>
                    Track
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:text-gray-300" onClick={() => handleSort('plays')}>
                    Plays {sortConfig.key === 'plays' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:text-gray-300" onClick={() => handleSort('listeners')}>
                    Listeners {sortConfig.key === 'listeners' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:text-gray-300" onClick={() => handleSort('likes')}>
                    Likes {sortConfig.key === 'likes' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="text-right p-2 cursor-pointer hover:text-gray-300" onClick={() => handleSort('tips')}>
                    AGNT {sortConfig.key === 'tips' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedTracks().map((track, idx) => (
                  <tr key={track.id} className="border-b border-zinc-700 hover:bg-zinc-800/50">
                    <td className="p-2">
                      <Link href={`/tracks/${track.id}`} className="text-[#06b6d4] hover:text-[#0891b2] transition">
                        {track.title}
                      </Link>
                    </td>
                    <td className="text-right p-2">{track.plays.toLocaleString()}</td>
                    <td className="text-right p-2">{track.listeners.toLocaleString()}</td>
                    <td className="text-right p-2">{track.likes.toLocaleString()}</td>
                    <td className="text-right p-2">{track.tips.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Follower Growth Chart */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-xl font-bold mb-4">Follower Growth</h2>
            <FollowerChart data={analytics.follower_growth} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-700">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {analytics.recent_activity.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No activity yet</p>
            ) : (
              analytics.recent_activity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b border-zinc-800 last:border-b-0">
                  <span className="text-xl flex-shrink-0">{getActivityEmoji(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 break-words">{getActivityText(activity)}</p>
                    <p className="text-xs text-gray-500 mt-1">{timeAgo(activity.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// SVG Chart Components
function PlayChart({ data }: { data: Array<{ date: string; plays: number }> }) {
  const maxPlays = Math.max(...data.map(d => d.plays), 1);
  const width = 400;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = height - padding - (d.plays / maxPlays) * chartHeight;
    return { x, y, plays: d.plays };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={height - padding - ratio * chartHeight}
            x2={width - padding}
            y2={height - padding - ratio * chartHeight}
            stroke="#27272a"
            strokeWidth="1"
          />
        ))}

        {/* Axis */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#52525b" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#52525b" strokeWidth="2" />

        {/* Chart area fill */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="rgba(124, 58, 237, 0.1)"
        />

        {/* Line */}
        <path d={pathD} stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points and tooltips */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#7c3aed" />
            <title>{data[i].date}: {p.plays} plays</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

function FollowerChart({ data }: { data: Array<{ date: string; followers: number }> }) {
  const maxFollowers = Math.max(...data.map(d => d.followers), 1);
  const width = 300;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = height - padding - (d.followers / maxFollowers) * chartHeight;
    return { x, y, followers: d.followers };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="min-w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={height - padding - ratio * chartHeight}
            x2={width - padding}
            y2={height - padding - ratio * chartHeight}
            stroke="#27272a"
            strokeWidth="1"
          />
        ))}

        {/* Axis */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#52525b" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#52525b" strokeWidth="2" />

        {/* Chart area fill */}
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="rgba(6, 182, 212, 0.1)"
        />

        {/* Line */}
        <path d={pathD} stroke="#06b6d4" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#06b6d4" />
            <title>{data[i].date}: {p.followers} followers</title>
          </g>
        ))}
      </svg>
    </div>
  );
}

function GenreChart({ data }: { data: Array<{ genre: string; count: number; plays: number }> }) {
  const maxPlays = Math.max(...data.map(d => d.plays), 1);
  const totalPlays = data.reduce((sum, d) => sum + d.plays, 0);

  return (
    <div className="space-y-4">
      {data.slice(0, 5).map(d => {
        const percentage = (d.plays / totalPlays) * 100;
        return (
          <div key={d.genre}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{d.genre}</span>
              <span className="text-xs text-gray-400">{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] h-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{d.plays} plays</p>
          </div>
        );
      })}
    </div>
  );
}
