'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAuthModal } from '@/context/AuthModalContext';

export function AuthModal() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const { isOpen, closeModal } = useAuthModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message || 'Sign up failed');
        } else {
          closeModal();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Sign in failed');
        } else {
          closeModal();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => closeModal()}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h2>
          <p className="text-zinc-400">
            {isSignUp ? 'Create a new account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
              required={isSignUp}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
            required
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 text-white rounded font-medium transition"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-zinc-400 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
