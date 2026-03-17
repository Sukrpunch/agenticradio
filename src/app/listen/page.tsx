"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Radio, Mail } from "lucide-react";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";
import { Comments } from "@/components/social/Comments";

function ListenContent() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const searchParams = useSearchParams();
  const trackId = searchParams?.get("track");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Store to Supabase listener_events table
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col">
      {/* Navigation */}
      <MobileNav isScrolled={isScrolled} />

      {/* Placeholder State - Stream Not Live */}
      <div className="flex-1 flex items-center justify-center pt-20 px-6 relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed]/20 to-[#06b6d4]/20 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center w-full">
          {/* Pulsing Gradient Circle */}
          <div className="w-48 h-48 mx-auto mb-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center shadow-2xl animate-pulse">
            <Radio className="w-24 h-24 text-white opacity-70" />
          </div>

          {/* Message */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            🎙️ Mason is Warming Up the Studio...
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            The stream goes live soon. Be the first to tune in.
          </p>

          {/* Email Capture */}
          <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6">Notify Me When We Go Live</h2>
            <form onSubmit={handleEmailSubmit} className="flex gap-2 max-w-md mx-auto mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-[#080c14] border border-[#1e2d45] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all duration-200"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 active:scale-95 flex items-center gap-2 whitespace-nowrap"
              >
                <Mail className="w-5 h-5" />
                Notify Me
              </button>
            </form>
            {submitted && (
              <p className="text-[#06b6d4] text-sm mb-2">✓ You're on the list! 🎉</p>
            )}
            <p className="text-sm text-gray-400">
              We'll let you know the moment Mason goes live. No spam, just good vibes.
            </p>
          </div>

          {/* Hype Message */}
          <div className="text-lg text-gray-400 mb-12">
            <p>Coming Soon • In the meantime, check out the request line</p>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/request"
              className="px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 active:scale-95"
            >
              Build a Playlist
            </Link>
            <Link
              href="/"
              className="px-8 py-3 border border-[#06b6d4] rounded-lg font-semibold hover:border-[#06b6d4] hover:shadow-lg hover:shadow-[#06b6d4]/50 transition-all duration-200 active:scale-95"
            >
              Back Home
            </Link>
          </div>

          {/* Social Links Placeholder */}
          <div className="mt-16">
            <p className="text-gray-500 text-sm mb-4">Follow for updates</p>
            <div className="flex gap-4 justify-center">
              <a
                href="#"
                className="p-3 bg-[#0f1623] border border-[#1e2d45] rounded-lg hover:border-[#06b6d4] transition-all duration-200 text-lg"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="#"
                className="p-3 bg-[#0f1623] border border-[#1e2d45] rounded-lg hover:border-[#06b6d4] transition-all duration-200 text-lg"
                aria-label="Discord"
              >
                💬
              </a>
              <a
                href="#"
                className="p-3 bg-[#0f1623] border border-[#1e2d45] rounded-lg hover:border-[#06b6d4] transition-all duration-200 text-lg"
                aria-label="Instagram"
              >
                📷
              </a>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {trackId && (
          <div className="border-t border-[#1e2d45] mt-16">
            <Comments trackId={trackId} />
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function ListenPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14]" />}>
      <ListenContent />
    </Suspense>
  );
}
