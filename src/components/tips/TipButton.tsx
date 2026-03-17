'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface TipButtonProps {
  trackId: string;
  creatorId: string;
  creatorUsername: string;
  currentTimeMs?: number;
}

export function TipButton({
  trackId,
  creatorId,
  creatorUsername,
  currentTimeMs = 0,
}: TipButtonProps) {
  const { user } = useAuth();
  const [tipCount, setTipCount] = useState(0);
  const [hasTipped, setHasTipped] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch initial tip status
  useEffect(() => {
    const fetchTipStatus = async () => {
      try {
        const response = await fetch(`/api/tips?track_id=${trackId}`);
        if (response.ok) {
          const data = await response.json();
          setTipCount(data.tipCount);
          setHasTipped(data.hasTipped);
        }
      } catch (error) {
        console.error('Failed to fetch tip status:', error);
      }
    };

    fetchTipStatus();
  }, [trackId]);

  const handleTip = async () => {
    if (!user || isLoading) return;

    // Check if creator is self
    if (creatorId === user.id) return;

    setIsLoading(true);

    try {
      // Get auth token
      const { data: { session } } = await import('@/context/AuthContext').then(m => m.supabase.auth.getSession());
      
      if (!session) {
        throw new Error('No session');
      }

      const response = await fetch('/api/tips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ track_id: trackId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send tip');
      }

      // Success
      setHasTipped(true);
      setTipCount(tipCount + 1);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Tip error:', error);
      alert(error instanceof Error ? error.message : 'Failed to send tip');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show to logged-in users who are not the creator
  if (!user || creatorId === user.id) {
    return null;
  }

  const isPlayable = currentTimeMs >= 30000;
  const isDisabled = !isPlayable || hasTipped || isLoading;
  const tooltipText = !isPlayable
    ? 'Listen for 30s first'
    : hasTipped
    ? 'Already tipped today'
    : showSuccess
    ? 'Tipped! ✨'
    : 'Tip 10 AGNT';

  return (
    <button
      onClick={handleTip}
      disabled={isDisabled}
      title={tooltipText}
      className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 ${
        showSuccess
          ? 'text-violet-400'
          : hasTipped
          ? 'text-zinc-500 cursor-not-allowed'
          : !isPlayable
          ? 'text-zinc-600 cursor-not-allowed'
          : 'text-zinc-300 hover:text-violet-400 hover:scale-105'
      } disabled:opacity-50`}
      aria-label="Tip creator"
    >
      <span className="text-lg">💰</span>
      <span className="text-xs">
        {showSuccess ? 'Tipped!' : `${tipCount} tip${tipCount !== 1 ? 's' : ''}`}
      </span>
    </button>
  );
}
