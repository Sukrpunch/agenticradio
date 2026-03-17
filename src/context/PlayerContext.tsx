'use client';
import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { supabase } from './AuthContext';

export interface Track {
  id: string;
  title: string;
  creator_id?: string;
  creator_name?: string;
  creator_username?: string;
  audio_url: string;
  cover_url?: string;
  duration_ms?: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTimeMs: number;
  durationMs: number;
  volume: number;
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (ms: number) => void;
  setVolume: (v: number) => void;
  addToQueue: (track: Track) => void;
}

const PlayerContext = createContext<PlayerContextType>({} as PlayerContextType);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [volume, setVolumeState] = useState(0.8);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
    }
    const audio = audioRef.current;
    const onTime = () => setCurrentTimeMs(audio.currentTime * 1000);
    const onDuration = () => setDurationMs(audio.duration * 1000);
    const onEnded = () => next();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const play = useCallback((track: Track, newQueue?: Track[]) => {
    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(newQueue.findIndex(t => t.id === track.id));
    }
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(console.error);
    }
    
    // Save to listen history (if user is logged in)
    const saveToHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetch('/api/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ track_id: track.id }),
        }).catch(console.error);
      }
    };
    saveToHistory();
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const resume = useCallback(() => audioRef.current?.play(), []);
  
  const seek = useCallback((ms: number) => {
    if (audioRef.current) audioRef.current.currentTime = ms / 1000;
  }, []);
  
  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const next = useCallback(() => {
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      setQueueIndex(nextIdx);
      play(queue[nextIdx]);
    }
  }, [queue, queueIndex, play]);

  const prev = useCallback(() => {
    if (currentTimeMs > 3000) {
      seek(0);
      return;
    }
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      setQueueIndex(prevIdx);
      play(queue[prevIdx]);
    }
  }, [queue, queueIndex, currentTimeMs, play, seek]);

  const addToQueue = useCallback((track: Track) => setQueue(q => [...q, track]), []);

  return (
    <PlayerContext.Provider value={{ currentTrack, queue, isPlaying, currentTimeMs, durationMs, volume, play, pause, resume, next, prev, seek, setVolume, addToQueue }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
