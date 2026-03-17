'use client';

import { useEffect, useState } from 'react';
import { useAuth, supabase } from '@/context/AuthContext';
import { X } from 'lucide-react';

export function PushPermissionPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (!user || !('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    // Only show if permission is not yet decided
    if (Notification.permission === 'default') {
      // Show after 30 seconds on site (don't immediately prompt)
      const timer = setTimeout(() => {
        setShow(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [user]);

  async function enableNotifications() {
    try {
      setIsSubscribing(true);

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        setShow(false);
        setIsSubscribing(false);
        return;
      }

      // Register service worker if not already registered
      if (!navigator.serviceWorker.controller) {
        await navigator.serviceWorker.register('/sw.js');
      }

      // Subscribe to push
      await subscribeUserToPush();
      setShow(false);
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      setShow(false);
    } finally {
      setIsSubscribing(false);
    }
  }

  async function subscribeUserToPush() {
    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session');
        return;
      }

      // Send subscription to backend
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to subscribe: ${response.status}`);
      }

      console.log('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      throw error;
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">🔔</span>
        <div className="flex-1">
          <p className="text-white font-medium text-sm">Enable notifications</p>
          <p className="text-zinc-400 text-xs mt-1">
            Get notified when someone follows you or comments on your tracks.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={enableNotifications}
              disabled={isSubscribing}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white text-xs rounded-lg font-medium transition-colors"
            >
              {isSubscribing ? 'Enabling...' : 'Enable'}
            </button>
            <button
              onClick={() => setShow(false)}
              disabled={isSubscribing}
              className="px-3 py-1.5 text-zinc-400 hover:text-white disabled:text-zinc-600 text-xs transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-zinc-500 hover:text-zinc-300 flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
