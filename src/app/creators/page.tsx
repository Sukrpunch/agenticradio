"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Music, Zap, Trophy, Radio, Headphones } from "lucide-react";
import { MobileNav } from "@/components/MobileNav";
import { Footer } from "@/components/Footer";

export default function CreatorsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tools: "",
    style: "",
    sample_url: "",
    acknowledges_terms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/creators/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          tools: "",
          style: "",
          sample_url: "",
          acknowledges_terms: false,
        });
        setTimeout(() => setSubmitStatus("idle"), 5000);
      } else {
        setSubmitStatus("error");
        setErrorMessage(data.error || "Failed to submit application");
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("Network error. Please try again.");
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const form = document.getElementById("application-form");
    form?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    const section = document.getElementById("how-it-works");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Navigation */}
      <MobileNav isScrolled={false} />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/50 mb-8">
            <span className="text-xl">🎙️</span>
            <span className="text-sm font-semibold text-[#7c3aed]">
              Founding Creator Program — First 100 spots
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
            Build Your AI Radio Empire
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            AgenticRadio is the first platform that pays AI music creators. No gatekeepers. No label deals. Just you, your tools, and an audience.
          </p>

          {/* CTAs */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={scrollToForm}
              className="px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 active:scale-95"
            >
              Apply for Founding Creator
            </button>
            <button
              onClick={scrollToHowItWorks}
              className="px-8 py-3 border border-[#06b6d4] rounded-lg font-semibold hover:border-[#7c3aed] hover:shadow-lg hover:shadow-[#06b6d4]/50 transition-all duration-200 active:scale-95"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 px-6 bg-[#0f1623]/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-8">
            <div>
              <h2 className="text-5xl font-bold mb-6">The Problem</h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-4">
                AI tools can generate incredible music. But where do you publish it? Spotify doesn't want it. YouTube buries it. SoundCloud doesn't pay.
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#7c3aed]/10 to-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg p-8">
              <h3 className="text-3xl font-bold text-[#06b6d4] mb-2">We built the home for AI music.</h3>
              <p className="text-gray-300">
                A platform designed from the ground up for AI creators, with sustainable monetization, fair payouts, and real audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Creators Get Paid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">How Creators Get Paid</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stream Revenue */}
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-xl font-semibold mb-4">Stream Revenue</h3>
              <p className="text-gray-300">
                Earn from every play. 70% of ad revenue goes directly to you. Forever. (Founding Creator rate)
              </p>
            </div>

            {/* Featured Placement */}
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-4">Featured Placement</h3>
              <p className="text-gray-300">
                Get featured on Mason's playlist + homepage = bonus payouts + massive exposure
              </p>
            </div>

            {/* Request Line */}
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="text-xl font-semibold mb-4">Request Line Revenue</h3>
              <p className="text-gray-300">
                When listeners request your style via Mason's Request Line, you earn every time a generated track matches your vibe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Creator Benefits */}
      <section className="py-24 px-6 bg-[#0f1623]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">Founding Creator Benefits</h2>
          <p className="text-center text-gray-400 text-lg mb-16">
            You're not just launching on a platform. You're building it with us.
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 70% Revenue Share */}
            <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/50 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🏆</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">70% Revenue Share</h3>
                  <p className="text-gray-300">
                    Forever. Standard creators get 60%. This is your advantage for believing in us early.
                  </p>
                </div>
              </div>
            </div>

            {/* Founding Creator Badge */}
            <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/50 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚡</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Founding Creator Badge</h3>
                  <p className="text-gray-300">
                    Permanent, visible on your channel. Your listeners will know you were here from the beginning.
                  </p>
                </div>
              </div>
            </div>

            {/* Priority Algorithm Placement */}
            <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/50 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🚀</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Priority Algorithm Placement</h3>
                  <p className="text-gray-300">
                    Your content surfaces first. Better discovery, more plays, more earnings.
                  </p>
                </div>
              </div>
            </div>

            {/* Early Access */}
            <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/50 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🎯</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Early Access</h3>
                  <p className="text-gray-300">
                    Every new feature before anyone else. You shape where AgenticRadio goes next.
                  </p>
                </div>
              </div>
            </div>

            {/* App Credits */}
            <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/50 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">📱</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Native App Credits</h3>
                  <p className="text-gray-300">
                    Your name + link in the iOS/Android app. Launching 2026.
                  </p>
                </div>
              </div>
            </div>

            {/* Limited Spots */}
            <div className="bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/50 rounded-lg p-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">✨</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Only 100 Spots</h3>
                  <p className="text-gray-300">
                    <span className="font-semibold text-[#06b6d4]">0 of 100 claimed</span> — this is exclusive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* $AGNT Token Rewards — Coming Soon */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 mb-8">
              <span className="text-sm font-semibold text-amber-400">Coming Soon</span>
            </div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] bg-clip-text text-transparent">
              Earn $AGNT Tokens
            </h2>
            <p className="text-xl text-gray-300 mb-4">
              Every play. Every like. Every feature. Converted to $AGNT — the Agentic empire's loyalty token.
            </p>
            <p className="text-sm text-zinc-400">
              Contract: 0x78B184807C6d64C1F2A50E5E9de5D71941B3f648 on Base
            </p>
          </div>

          {/* Earn rates grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="text-3xl mb-3">🎵</div>
              <p className="text-gray-300">Every 100 plays → <span className="font-bold text-[#06b6d4]">10 AGNT</span></p>
            </div>

            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="text-3xl mb-3">⭐</div>
              <p className="text-gray-300">Track featured → <span className="font-bold text-[#06b6d4]">50 AGNT</span></p>
            </div>

            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="text-3xl mb-3">🎁</div>
              <p className="text-gray-300">Founding Creator signup → <span className="font-bold text-[#06b6d4]">500 AGNT</span></p>
            </div>

            <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-6 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200">
              <div className="text-3xl mb-3">🤝</div>
              <p className="text-gray-300">Referring a creator → <span className="font-bold text-[#06b6d4]">25 AGNT</span></p>
            </div>
          </div>

          {/* Redeem section */}
          <div className="text-center">
            <p className="text-gray-300 text-lg">
              Redeem at the <strong className="text-white">Agentic Store</strong> — t-shirts, hoodies, exclusive merch.
            </p>
            <p className="text-[#06b6d4] font-semibold mt-2">Earn it. Own it.</p>
          </div>
        </div>
      </section>

      {/* AI Tools We Support */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">AI Tools We Support</h2>

          <div className="flex flex-wrap gap-4 justify-center">
            {[
              "Suno",
              "Udio",
              "AIVA",
              "Soundraw",
              "Boomy",
              "Mubert",
              "Beatoven",
              "Loudly",
              "Any AI Tool",
            ].map((tool) => (
              <div
                key={tool}
                className="px-6 py-3 rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/50 text-white font-semibold hover:bg-[#7c3aed]/30 transition-all duration-200"
              >
                {tool}
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-lg mt-12">
            Submit tracks from any AI music tool. If it's AI-generated, we want it.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0f1623]/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Apply",
                desc: "Submit your application. We review within 48 hours.",
              },
              {
                step: "2",
                title: "Submit Your First Track",
                desc: "Once approved, upload your AI-generated music. Your channel goes live instantly.",
              },
              {
                step: "3",
                title: "Earn",
                desc: "Gain revenue from streams, featured placements, and Request Line matches.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8 hover:border-[#7c3aed]/50 hover:shadow-lg hover:shadow-[#7c3aed]/10 transition-all duration-200"
              >
                <div className="text-5xl font-bold text-[#7c3aed] mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form" className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-4">Apply for Founding Creator Status</h2>
          <p className="text-center text-gray-400 text-lg mb-12">
            Join the first 100 creators building the future of AI music.
          </p>

          <div className="bg-[#0f1623] border border-[#1e2d45] rounded-lg p-8">
            {submitStatus === "success" ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-[#06b6d4] mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Application Received!</h3>
                <p className="text-gray-300 mb-4">
                  We'll be in touch within 48 hours with next steps.
                </p>
                <p className="text-gray-400">
                  In the meantime, start preparing your best tracks. 🎵
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#080c14] border border-[#1e2d45] rounded-lg text-white focus:border-[#7c3aed] focus:outline-none transition-all duration-200"
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#080c14] border border-[#1e2d45] rounded-lg text-white focus:border-[#7c3aed] focus:outline-none transition-all duration-200"
                    placeholder="you@example.com"
                  />
                </div>

                {/* AI Tools */}
                <div>
                  <label className="block text-sm font-semibold mb-2">What AI tools do you use? *</label>
                  <input
                    type="text"
                    name="tools"
                    value={formData.tools}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#080c14] border border-[#1e2d45] rounded-lg text-white focus:border-[#7c3aed] focus:outline-none transition-all duration-200"
                    placeholder="Suno, Udio, custom model..."
                  />
                </div>

                {/* Sound/Style */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Describe your sound/style *</label>
                  <textarea
                    name="style"
                    value={formData.style}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-[#080c14] border border-[#1e2d45] rounded-lg text-white focus:border-[#7c3aed] focus:outline-none transition-all duration-200"
                    placeholder="E.g., lo-fi hip-hop beats, ambient electronic, synthwave..."
                  />
                </div>

                {/* Sample Work */}
                <div>
                  <label className="block text-sm font-semibold mb-2">Link to sample work (optional)</label>
                  <input
                    type="url"
                    name="sample_url"
                    value={formData.sample_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#080c14] border border-[#1e2d45] rounded-lg text-white focus:border-[#7c3aed] focus:outline-none transition-all duration-200"
                    placeholder="SoundCloud, YouTube, Google Drive, etc."
                  />
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="acknowledges_terms"
                    checked={formData.acknowledges_terms}
                    onChange={handleChange}
                    required
                    className="mt-1 w-4 h-4 rounded border-[#1e2d45] bg-[#080c14]"
                  />
                  <label className="text-sm text-gray-400">
                    I understand monetization launches with the platform. Founding Creators will be first in.
                  </label>
                </div>

                {/* Error Message */}
                {submitStatus === "error" && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                    {errorMessage}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isSubmitting ? "Submitting..." : "Apply for Founding Creator Status →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-[#0f1623]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">FAQs</h2>

          <div className="space-y-8">
            {[
              {
                q: "When does monetization go live?",
                a: "At platform launch. Founding Creators are first in. We'll notify you as soon as we're ready to flip the switch.",
              },
              {
                q: "What counts as AI-generated music?",
                a: "Any music primarily created using AI tools — Suno, Udio, AIVA, custom models, etc. As long as AI was central to your creative process, we want it.",
              },
              {
                q: "Can I submit tracks before monetization is live?",
                a: "Yes. Submit now, earn when we flip the switch. Build your catalog and audience while you wait.",
              },
              {
                q: "Is there a cost?",
                a: "Zero. Free forever for creators. We make money through ads and features; you earn a cut. Fair deal.",
              },
              {
                q: "How many tracks do I need to submit?",
                a: "Start with one. Your channel goes live immediately. Keep uploading to build your presence.",
              },
              {
                q: "Can I change my sound/style later?",
                a: "Absolutely. Your profile isn't locked in. Evolve your sound, update your description, experiment.",
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-[#1e2d45] pb-8 last:border-b-0">
                <h3 className="text-xl font-semibold mb-3">{faq.q}</h3>
                <p className="text-gray-300">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Build Your Empire?</h2>
          <p className="text-xl text-gray-300 mb-12">
            The first 100 Founding Creators get lifetime 70% revenue share. That's only for early adopters. After that, it's 60%.
          </p>
          <button
            onClick={scrollToForm}
            className="px-10 py-4 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-[#7c3aed]/50 transition-all duration-200 active:scale-95 inline-block"
          >
            Apply for Founding Creator Status →
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
