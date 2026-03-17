'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Music2,
  Crown,
  Trophy,
  Star,
  Zap,
  Heart,
  Users,
  ChevronRight,
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: string;
  metadata: Record<string, any>;
  created_at: string;
  actor?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  track?: {
    id: string;
    title: string;
    genre: string;
    cover_url?: string;
  };
  challenge?: {
    id: string;
    name: string;
    prize: string;
  };
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'track_upload':
      return <Music2 className="w-10 h-10 text-[#06b6d4]" />;
    case 'chart_number_one':
      return <Crown className="w-10 h-10 text-yellow-500" />;
    case 'challenge_winner':
      return <Trophy className="w-10 h-10 text-orange-400" />;
    case 'new_creator':
      return <Star className="w-10 h-10 text-[#7c3aed]" />;
    case 'milestone_plays':
    case 'milestone_followers':
      return <Zap className="w-10 h-10 text-yellow-400" />;
    case 'featured':
      return <Heart className="w-10 h-10 text-red-500" />;
    case 'challenge_opened':
      return <Users className="w-10 h-10 text-[#7c3aed]" />;
    default:
      return <Zap className="w-10 h-10 text-gray-400" />;
  }
}

function formatActivityText(event: ActivityEvent): string {
  const actorName = event.actor?.display_name || event.actor?.username || 'User';
  const actorHandle = event.actor?.username || 'unknown';

  switch (event.type) {
    case 'track_upload':
      return `@${actorHandle} just dropped a new track "${event.track?.title || 'Untitled'}"`;
    case 'chart_entry':
      return `"${event.track?.title || 'Untitled'}" entered the Agentic Charts at #${event.metadata.position || '?'}`;
    case 'chart_number_one':
      return `"${event.track?.title || 'Untitled'}" by @${actorHandle} hit #1 on the charts 👑`;
    case 'challenge_winner':
      return `@${actorHandle} won the "${event.challenge?.name || 'Challenge'}" challenge 🏆`;
    case 'challenge_opened':
      return `New challenge: "${event.challenge?.name || 'Challenge'}" — ${event.challenge?.prize || '500 AGNT'} prize ⚔️`;
    case 'milestone_plays':
      return `@${actorHandle} hit ${event.metadata.count || '?'} plays on "${event.track?.title || 'Untitled'}" 🎉`;
    case 'milestone_followers':
      return `@${actorHandle} hit ${event.metadata.count || '?'} followers 🎉`;
    case 'new_creator':
      return `@${actorHandle} just joined Agentic Radio 🎵`;
    case 'featured':
      return `"${event.track?.title || 'Untitled'}" is now featured 🌟`;
    default:
      return 'Activity event';
  }
}

function getActionButton(event: ActivityEvent) {
  if (event.track?.id) {
    return {
      label: '▶ Play',
      href: `/tracks/${event.track.id}`,
    };
  }
  if (event.actor?.id) {
    return {
      label: 'View Profile',
      href: `/creators/${event.actor.username}`,
    };
  }
  if (event.type === 'chart_number_one') {
    return {
      label: 'View Charts',
      href: '/charts',
    };
  }
  return null;
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const fetchActivity = useCallback(async (before?: string) => {
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (before) params.append('before', before);

      const response = await fetch(`/api/activity?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching activity:', result.error);
        return;
      }

      const newEvents = result.data || [];
      setEvents((prev) => (before ? [...prev, ...newEvents] : newEvents));
      setCursor(result.pagination?.cursor);
      setHasMore(newEvents.length === 20);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const loadMore = () => {
    if (cursor && hasMore) {
      fetchActivity(cursor);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#080c14]/95 backdrop-blur border-b border-[#1a1f3a] px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌊</span>
            <h1 className="text-2xl font-bold">Activity Feed</h1>
          </div>
          <p className="text-gray-400 text-sm">
            What's happening on Agentic Radio right now
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-500 font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading && events.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin text-[#7c3aed] text-4xl mb-4">⚙️</div>
            <p className="text-gray-400">Loading activity...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No activity yet</p>
            <p className="text-gray-500 text-sm mt-2">
              Activity will appear here as creators upload tracks and events happen
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const actionBtn = getActionButton(event);
              return (
                <div
                  key={event.id}
                  className="bg-[#0f1419] border border-[#1a1f3a] rounded-lg p-4 hover:border-[#7c3aed]/50 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Icon / Avatar */}
                    <div className="flex-shrink-0">
                      {event.actor?.avatar_url ? (
                        <img
                          src={event.actor.avatar_url}
                          alt={event.actor.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center">
                          {getActivityIcon(event.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white line-clamp-2">
                        {formatActivityText(event)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {event.track && (
                          <span className="text-xs bg-[#1a1f3a] text-[#06b6d4] px-2 py-1 rounded">
                            {event.track.genre}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {timeAgo(event.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {actionBtn && (
                      <div className="flex-shrink-0">
                        <Link
                          href={actionBtn.href}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded bg-[#7c3aed]/10 text-[#7c3aed] hover:bg-[#7c3aed]/20 transition-colors whitespace-nowrap"
                        >
                          {actionBtn.label}
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && events.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-6 py-2 rounded border border-[#7c3aed] text-[#7c3aed] hover:bg-[#7c3aed]/10 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
