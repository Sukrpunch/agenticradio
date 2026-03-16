"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Music, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

export default function RequestPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    vibe_description: "",
    genre_hint: "",
    playlist_name: "",
    email: "",
  });

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };
  
  typeof window !== "undefined" && window.addEventListener("scroll", handleScroll);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/request/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create playlist");
      }

      // Redirect to playlist page
      router.push(`/playlist/${data.playlistSlug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Navigation */}
      <MobileNav isScrolled={isScrolled} />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            🎙 The Request Line
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Tell Mason what to create. He'll build it.
          </p>
          <p className="text-lg text-gray-400">
            Describe your vibe, artist, or mood — Mason analyzes your style and generates original AI tracks matching that exact energy.
          </p>
        </div>
      </section>

      {/* Main Form Section */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Vibe Description */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                Describe Your Vibe or Artist
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="vibe_description"
                value={formData.vibe_description}
                onChange={handleChange}
                placeholder="e.g. Dirty Heads, or chill reggae-rock with surf vibes"
                required
                className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition"
              />
              <p className="text-gray-400 text-sm mt-2">
                The more specific, the better. "Chill lo-fi like Nujabes" works great!
              </p>
            </div>

            {/* Genre Hint */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                Genre Hint (Optional)
              </label>
              <select
                name="genre_hint"
                value={formData.genre_hint}
                onChange={handleChange}
                className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition"
              >
                <option value="">Any</option>
                <option value="Lo-Fi">Lo-Fi</option>
                <option value="Synthwave">Synthwave</option>
                <option value="Ambient">Ambient</option>
                <option value="Reggae">Reggae</option>
                <option value="Rock">Rock</option>
                <option value="Electronic">Electronic</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Playlist Name */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                Playlist Name (Optional)
              </label>
              <input
                type="text"
                name="playlist_name"
                value={formData.playlist_name}
                onChange={handleChange}
                placeholder="e.g. My Chill Session"
                className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition"
              />
              <p className="text-gray-400 text-sm mt-2">
                If you don't provide one, Mason will suggest a name based on your vibe.
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-lg font-semibold mb-3">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full bg-[#0f1623] border border-[#1e2d45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition"
              />
              <p className="text-gray-400 text-sm mt-2">
                Where should we send your playlist? (helps you find it later)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin">⏳</div>
                  Building Your Playlist...
                </>
              ) : (
                <>
                  Build My Playlist
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[#0f1623]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-[#7c3aed]/20 flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-[#7c3aed]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">You Describe</h3>
              <p className="text-gray-400">
                Tell us your vibe — an artist, mood, or style. "Chill reggae-rock" or "sad indie like Phoebe Bridgers" both work.
              </p>
            </div>

            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-[#7c3aed]/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-[#7c3aed]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Mason Analyzes</h3>
              <p className="text-gray-400">
                Our AI co-founder analyzes your style and generates a detailed production prompt — BPM, mood, instruments, everything.
              </p>
            </div>

            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="w-12 h-12 rounded-full bg-[#7c3aed]/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-[#7c3aed]" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Get Your Playlist</h3>
              <p className="text-gray-400">
                Your 5-track custom playlist is ready in ~60 seconds. Shareable, playable, and uniquely yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Program Teaser */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#7c3aed]/10 to-[#06b6d4]/10 border border-[#1e2d45] rounded-lg p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">
            🎙 The Vibe Creator Program
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Share your playlist. When others listen, you earn.
          </p>
          <p className="text-gray-400">
            Every playlist is unique to you. When people discover and play your creation, you earn credits. Build the vibe collection, build your credits.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-[#0f1623]/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-8">
            Already have a playlist? Check it out:
          </p>
          <Link
            href="/listen"
            className="inline-block px-10 py-4 bg-[#1e2d45] border border-[#1e2d45] rounded-lg font-semibold hover:border-[#06b6d4] transition"
          >
            Listen to AgenticRadio
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
