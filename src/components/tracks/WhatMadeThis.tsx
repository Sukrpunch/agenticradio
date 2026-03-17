'use client';

import { useEffect, useState } from 'react';

interface Tool {
  name: string;
  version: string;
  role: string;
}

interface TrackCredits {
  id: string;
  track_id: string;
  tools: Tool[];
  prompt: string | null;
  notes: string | null;
  show_prompt: boolean;
  created_at: string;
  updated_at: string;
}

interface WhatMadeThisProps {
  trackId: string;
}

const roleEmoji: Record<string, string> = {
  composition: '🎵',
  vocals: '🎤',
  mixing: '🎚️',
  mastering: '✂️',
  'cover art': '🎨',
  other: '⚙️',
};

export function WhatMadeThis({ trackId }: WhatMadeThisProps) {
  const [credits, setCredits] = useState<TrackCredits | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const response = await fetch(`/api/tracks/${trackId}/credits`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setCredits(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch track credits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, [trackId]);

  if (isLoading) {
    return null;
  }

  if (!credits || credits.tools.length === 0) {
    return (
      <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
        <p className="text-sm text-zinc-400">
          Creator hasn't shared their process yet
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-zinc-200 hover:text-violet-400 transition-colors"
      >
        <span className="text-lg">⚙️</span>
        <span>What Made This</span>
        <span className={`text-xs text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isExpanded && (
        <div className="mt-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
          {/* Tools */}
          {credits.tools.length > 0 && (
            <div className="space-y-2 mb-4">
              {credits.tools.map((tool, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-lg flex-shrink-0">
                    {roleEmoji[tool.role] || roleEmoji.other}
                  </span>
                  <div>
                    <p className="text-zinc-100">
                      {tool.name} {tool.version && `v${tool.version}`}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {tool.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Prompt */}
          {credits.show_prompt && credits.prompt && (
            <div className="mb-4 pb-4 border-t border-zinc-700">
              <p className="text-xs font-medium text-zinc-400 mb-1">Prompt</p>
              <p className="text-sm text-zinc-300 italic">"{credits.prompt}"</p>
            </div>
          )}

          {/* Notes */}
          {credits.notes && (
            <div className="border-t border-zinc-700 pt-4">
              <p className="text-xs font-medium text-zinc-400 mb-1">Notes</p>
              <p className="text-sm text-zinc-300">{credits.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
