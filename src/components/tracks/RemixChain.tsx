'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/context/AuthContext';
import Link from 'next/link';
import { Music } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  creator_id: string;
  cover_url?: string;
}

interface RemixChainData {
  ancestors: Track[];
  children: Track[];
  siblings: Track[];
}

interface Creator {
  id: string;
  username: string;
  display_name: string;
}

export function RemixChain({ trackId }: { trackId: string }) {
  const [chain, setChain] = useState<RemixChainData | null>(null);
  const [creators, setCreators] = useState<Map<string, Creator>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChain = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`/api/tracks/${trackId}/remix-chain`, {
          headers: session ? {
            'Authorization': `Bearer ${session.access_token}`,
          } : {},
        });

        if (!response.ok) return;
        const chainData = await response.json();
        setChain(chainData);

        // Collect all creator IDs
        const creatorIds = new Set<string>();
        chainData.ancestors?.forEach((t: Track) => creatorIds.add(t.creator_id));
        chainData.children?.forEach((t: Track) => creatorIds.add(t.creator_id));
        chainData.siblings?.forEach((t: Track) => creatorIds.add(t.creator_id));

        if (creatorIds.size > 0) {
          const { data: creatorData } = await supabase
            .from('profiles')
            .select('id, username, display_name')
            .in('id', Array.from(creatorIds));

          if (creatorData) {
            setCreators(new Map(creatorData.map(c => [c.id, c])));
          }
        }
      } catch (error) {
        console.error('Failed to fetch remix chain:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChain();
  }, [trackId]);

  if (loading || !chain) return null;

  const hasAncestors = chain.ancestors && chain.ancestors.length > 0;
  const hasChildren = chain.children && chain.children.length > 0;
  const hasSiblings = chain.siblings && chain.siblings.length > 0;

  if (!hasAncestors && !hasChildren && !hasSiblings) {
    return null;
  }

  const getCreatorName = (creatorId: string) => {
    const creator = creators.get(creatorId);
    return creator?.display_name || creator?.username || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Remix Of */}
      {hasAncestors && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">🔄</span>
            Remix of
          </h3>
          <div className="space-y-3">
            {chain.ancestors.map(ancestor => (
              <Link
                key={ancestor.id}
                href={`/tracks/${ancestor.id}`}
                className="flex items-start gap-3 p-3 bg-zinc-900/50 hover:bg-zinc-700/50 rounded-lg transition-colors duration-200"
              >
                <div className="w-12 h-12 rounded bg-zinc-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {ancestor.cover_url ? (
                    <img
                      src={ancestor.cover_url}
                      alt={ancestor.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{ancestor.title}</p>
                  <p className="text-xs text-gray-400">
                    by @{getCreatorName(ancestor.creator_id)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Remixes Of This Track */}
      {hasChildren && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">🔄</span>
            {chain.children.length} {chain.children.length === 1 ? 'Remix' : 'Remixes'} of this track
          </h3>
          <div className="space-y-3">
            {chain.children.map(child => (
              <Link
                key={child.id}
                href={`/tracks/${child.id}`}
                className="flex items-start gap-3 p-3 bg-zinc-900/50 hover:bg-zinc-700/50 rounded-lg transition-colors duration-200"
              >
                <div className="w-12 h-12 rounded bg-zinc-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {child.cover_url ? (
                    <img
                      src={child.cover_url}
                      alt={child.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{child.title}</p>
                  <p className="text-xs text-gray-400">
                    by @{getCreatorName(child.creator_id)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other Remixes of Parent */}
      {hasSiblings && (
        <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-xl">🔄</span>
            Other remixes
          </h3>
          <div className="space-y-3">
            {chain.siblings.map(sibling => (
              <Link
                key={sibling.id}
                href={`/tracks/${sibling.id}`}
                className="flex items-start gap-3 p-3 bg-zinc-900/50 hover:bg-zinc-700/50 rounded-lg transition-colors duration-200"
              >
                <div className="w-12 h-12 rounded bg-zinc-700 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {sibling.cover_url ? (
                    <img
                      src={sibling.cover_url}
                      alt={sibling.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{sibling.title}</p>
                  <p className="text-xs text-gray-400">
                    by @{getCreatorName(sibling.creator_id)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
