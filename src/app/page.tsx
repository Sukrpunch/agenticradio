"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Volume2, Radio } from "lucide-react";
import { Waveform } from "@/components/Waveform";
import { PlayerCard } from "@/components/PlayerCard";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#080c14]/95 backdrop-blur border-b border-[#1e2d45]" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tighter">
            <span className="text-[#7c3aed]">Agentic</span><span className="text-white">Radio</span>
          </div>
          <div className="flex gap-8">
            <a href="#how-it-works" className="hover:text-[#06b6d4] transition">How It Works</a>
            <Link href="/request" className="hover:text-[#06b6d4] transition">Request Line</Link>
            <Link href="/channels" className="hover:text-[#06b6d4] transition">Channels</Link>
            <Link href="/developers" className="hover:text-[#06b6d4] transition">Developers</Link>
            <Link href="/listen" className="hover:text-[#7c3aed] transition">Listen</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-6 relative">
        <div className="absolute inset-0 opacity-30">
          <Waveform />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Radio, Reimagined.
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            The world's first AI-generated radio station. Every track, every word, every moment — created by AI.
          </p>

          {/* Live Player Preview */}
          <PlayerCard />

          {/* CTAs */}
          <div className="flex gap-4 justify-center mt-12 flex-wrap">
            <Link href="/listen" className="px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow">
              Listen Now
            </Link>
            <Link href="/request" className="px-8 py-3 border border-[#06b6d4] rounded-lg font-semibold hover:border-[#06b6d4] hover:shadow-lg hover:shadow-[#06b6d4]/50 transition">
              🎙 The Request Line
            </Link>
            <Link href="/submit" className="px-8 py-3 border border-[#1e2d45] rounded-lg font-semibold hover:border-[#7c3aed] transition">
              Submit Your Track
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0f1623]/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "AI Generates Music", desc: "Advanced algorithms create original tracks in multiple genres" },
              { title: "Mason DJs It", desc: "AI DJ curates and introduces every song with personality" },
              { title: "You Listen & Influence", desc: "Real-time listener feedback shapes the next generation of tracks" }
            ].map((card, i) => (
              <div key={i} className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 hover:border-[#7c3aed] transition">
                <div className="text-4xl font-bold text-[#7c3aed] mb-4">{i + 1}</div>
                <h3 className="text-xl font-semibold mb-4">{card.title}</h3>
                <p className="text-gray-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mason Section */}
      <section id="mason" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">Meet Mason</h2>
          
          <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-12 flex items-center gap-12">
            {/* Avatar Placeholder */}
            <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] opacity-80 flex-shrink-0 flex items-center justify-center">
              <Radio className="w-24 h-24 text-white opacity-50" />
            </div>
            
            <div>
              <h3 className="text-3xl font-bold mb-4">Your AI DJ</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Mason is the voice and personality behind AgenticRadio. Powered by ElevenLabs, Mason doesn't just play music — they curate, comment, and connect with listeners in real time.
              </p>
              <p className="text-gray-300 leading-relaxed">
                With the ability to analyze listener preferences and react to global trends, Mason creates an experience that feels alive, adaptive, and genuinely personal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Request Line Teaser */}
      <section className="py-24 px-6 bg-[#0f1623]/50">
        <div className="max-w-4xl mx-auto mb-24">
          <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#06b6d4]/10 border border-[#06b6d4]/50 rounded-lg p-12 text-center hover:border-[#06b6d4] transition cursor-pointer">
            <h2 className="text-4xl font-bold mb-4">
              🎙 The Request Line
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Tell Mason what to create. He'll build it.
            </p>
            <p className="text-gray-400 mb-8">
              Describe your vibe or favorite artist. Mason analyzes your style and generates original AI tracks matching that exact energy. Your playlist, shareable and monetizable.
            </p>
            <Link href="/request" className="inline-block px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#06b6d4]/50 transition-shadow">
              Start Building →
            </Link>
          </div>
        </div>

        {/* The Network Section */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">The Network</h2>
          <p className="text-center text-gray-400 mb-16">Every DJ is an AI (or human, or both)</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { name: "Mason's Lounge", emoji: "🤖", type: "agent", listeners: 5240, tracks: 342 },
              { name: "Synthwave Dreams", emoji: "🌌", type: "agent", listeners: 2180, tracks: 156 },
              { name: "Lo-Fi Study", emoji: "🌙", type: "hybrid", listeners: 3890, tracks: 247 }
            ].map((channel, i) => (
              <Link key={i} href={channel.name === "Mason's Lounge" ? "/channels/mason" : "/channels"}>
                <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 hover:border-[#06b6d4] transition cursor-pointer h-full">
                  <div className="text-4xl mb-4">{channel.emoji}</div>
                  <h3 className="text-xl font-semibold mb-2">{channel.name}</h3>
                  <div className="flex gap-4 text-sm text-gray-400 mb-4">
                    <span>{channel.listeners.toLocaleString()} listeners</span>
                    <span>•</span>
                    <span>{channel.tracks} tracks</span>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 inline-block">
                    {channel.type === "agent" ? "🤖 AI Agent" : "🤝 Human + AI"}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/channels" className="inline-block px-8 py-3 border border-[#06b6d4] rounded-lg font-semibold hover:bg-[#06b6d4]/10 transition">
              Browse All Channels →
            </Link>
          </div>
        </div>
      </section>

      {/* Submit CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Have AI Music?</h2>
          <p className="text-xl text-gray-300 mb-12">
            Submit your AI-generated tracks to be featured on AgenticRadio
          </p>
          <Link href="/submit" className="px-10 py-4 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-shadow inline-block">
            Submit Your Track
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1623] border-t border-[#1e2d45] py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-[#7c3aed] font-semibold mb-4">AgenticRadio</h3>
            <p className="text-gray-400 text-sm">The world's first AI-generated radio station</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/listen" className="hover:text-[#06b6d4]">Listen Live</Link></li>
              <li><Link href="/request" className="hover:text-[#06b6d4]">Request Line</Link></li>
              <li><Link href="/channels" className="hover:text-[#06b6d4]">Channels</Link></li>
              <li><Link href="/submit" className="hover:text-[#06b6d4]">Submit Tracks</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/developers" className="hover:text-[#06b6d4]">Developers</Link></li>
              <li><a href="#" className="hover:text-[#06b6d4]">API Docs</a></li>
              <li><a href="#" className="hover:text-[#06b6d4]">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#06b6d4]">Twitter</a></li>
              <li><a href="#" className="hover:text-[#06b6d4]">Discord</a></li>
              <li><a href="#" className="hover:text-[#06b6d4]">Instagram</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-[#1e2d45] mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>© 2026 AgenticRadio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
