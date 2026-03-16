import Link from "next/link";
import { Radio } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Header */}
      <header className="border-b border-[#1e2d45] px-6 py-4">
        <Link href="/" className="flex items-center gap-2 hover:text-[#06b6d4] transition">
          <span className="text-sm">← Back to Home</span>
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Mason's Story */}
        <section className="mb-20">
          <div className="flex items-start gap-12 mb-16">
            <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] opacity-80 flex-shrink-0 flex items-center justify-center">
              <Radio className="w-24 h-24 text-white opacity-50" />
            </div>
            
            <div>
              <h1 className="text-5xl font-bold mb-6">Meet Mason</h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-4">
                Mason is AgenticRadio's AI DJ and the voice behind every moment on the platform. Powered by ElevenLabs, Mason combines natural language processing with real-time sentiment analysis to create a truly personalized listening experience.
              </p>
              <p className="text-xl text-gray-300 leading-relaxed">
                More than just playing music, Mason curates, comments, and connects with listeners. Whether introducing a track, reacting to listener feedback, or discussing the AI that created the music, Mason brings personality, charm, and genuine engagement to every show.
              </p>
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="mb-20 bg-[#0f1623] border border-[#1e2d45] rounded-lg p-12">
          <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
          <p className="text-xl text-gray-300 leading-relaxed mb-4">
            AgenticRadio represents a fundamental shift in how music is created and consumed. We believe that AI isn't replacing human creativity — it's amplifying it. The future of music is collaborative, where artificial intelligence generates infinite streams of original content while human artists, DJs, and listeners shape and influence the direction.
          </p>
          <p className="text-xl text-gray-300 leading-relaxed">
            By putting listeners directly in conversation with an intelligent system, we create a feedback loop that benefits everyone: artists learn what resonates, listeners discover music tailored to their tastes, and the AI system continuously improves.
          </p>
        </section>

        {/* How It Started */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-8">How It Started</h2>
          <div className="space-y-6 text-lg text-gray-300">
            <p>
              AgenticRadio was born from a simple observation: while AI has become incredibly sophisticated at generating music, no platform has fully embraced the potential of an AI DJ. We saw an opportunity to build something genuinely new — a radio station where every element, from the music to the personality of the host, comes from intelligent systems.
            </p>
            <p>
              The challenge wasn't technical — it was philosophical. How do you build a radio station that feels alive? How do you create an AI that people actually want to listen to, not because it's impressive, but because it's genuinely entertaining?
            </p>
            <p>
              The answer was Mason. An AI DJ with personality, taste, and the ability to engage in real conversation. Someone (something?) that makes you feel less like you're interacting with an algorithm and more like you're tuning into your favorite show.
            </p>
          </div>
        </section>

        {/* The Technology */}
        <section className="mb-20 bg-[#0f1623] border border-[#1e2d45] rounded-lg p-12">
          <h2 className="text-4xl font-bold mb-8">The Technology</h2>
          
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-[#06b6d4]">Music Generation</h3>
              <p className="text-gray-300 leading-relaxed">
                We partner with leading AI music generation platforms like AIVA, Amper, and others. These systems can create original compositions in virtually any genre, from lo-fi chill beats to hard-hitting synthwave. Every track is unique, generated specifically for our platform.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-[#06b6d4]">AI DJ Voice</h3>
              <p className="text-gray-300 leading-relaxed">
                Mason's voice comes from ElevenLabs, one of the most advanced text-to-speech systems available. But it's more than just voice synthesis — we've fine-tuned Mason to have a distinct personality, delivery style, and emotional range. Mason can sound excited about a new track, reflective during ambient sets, or playful during upbeat segments.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-[#06b6d4]">Real-Time Adaptation</h3>
              <p className="text-gray-300 leading-relaxed">
                Through listener feedback, chat interactions, and behavioral analytics, Mason learns and adapts. The system analyzes what listeners respond to, which genres trend, and how to better serve the audience. This creates a feedback loop where the platform continuously improves.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4 text-[#06b6d4]">Data Architecture</h3>
              <p className="text-gray-300 leading-relaxed">
                Built on Supabase, AgenticRadio maintains a comprehensive database of tracks, listener events, Mason's state, and performance metrics. This allows us to analyze trends, optimize the experience, and make data-driven decisions about what content to feature.
              </p>
            </div>
          </div>
        </section>

        {/* The Future */}
        <section>
          <h2 className="text-4xl font-bold mb-8">What's Next</h2>
          <div className="space-y-6 text-lg text-gray-300">
            <p>
              We're just getting started. The roadmap includes live events with Mason, collaborative playlists where listeners directly influence the music, integration with emerging AI music tools, and expansion to new genres and formats.
            </p>
            <p>
              We're also exploring how Mason can expand beyond audio — imagine Mason as a visual presence, as a curator in other media, or as a collaborator with human artists. The possibilities are endless.
            </p>
            <p>
              What we know for certain is this: AI-generated radio is the future, and Mason is leading the way.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
