import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Header */}
      <div className="border-b border-[#1e2d45] py-6 px-6 mb-12">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-[#7c3aed] hover:text-[#06b6d4] transition-all">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mt-4 mb-2">Terms of Service</h1>
          <p className="text-gray-400">Last updated: March 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-12">
        {/* Table of Contents */}
        <div className="bg-[#0f1623] rounded-lg border border-[#1e2d45] p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <ul className="space-y-2 text-[#06b6d4]">
            <li>
              <a href="#acceptance" className="hover:underline">
                1. Acceptance of Terms
              </a>
            </li>
            <li>
              <a href="#age" className="hover:underline">
                2. Age Requirement
              </a>
            </li>
            <li>
              <a href="#license" className="hover:underline">
                3. License Grant
              </a>
            </li>
            <li>
              <a href="#conduct" className="hover:underline">
                4. User Conduct
              </a>
            </li>
            <li>
              <a href="#content-policy" className="hover:underline">
                5. AI-Only Content Policy
              </a>
            </li>
            <li>
              <a href="#dmca" className="hover:underline">
                6. DMCA & Copyright
              </a>
            </li>
            <li>
              <a href="#liability" className="hover:underline">
                7. Limitation of Liability
              </a>
            </li>
            <li>
              <a href="#disclaimer" className="hover:underline">
                8. Disclaimer
              </a>
            </li>
            <li>
              <a href="#termination" className="hover:underline">
                9. Termination
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:underline">
                10. Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          <section>
            <h2 id="acceptance" className="text-2xl font-bold mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-300 mb-4">
              By accessing or using AgenticRadio (the "Service"), you agree to be bound by these Terms of Service
              ("Terms"). If you do not agree to these Terms, you may not use the Service.
            </p>
            <p className="text-gray-300">
              We may update these Terms from time to time. Your continued use of AgenticRadio constitutes acceptance
              of the updated Terms. We recommend reviewing this page periodically for changes.
            </p>
          </section>

          <section>
            <h2 id="age" className="text-2xl font-bold mb-4">
              2. Age Requirement
            </h2>
            <p className="text-gray-300">
              You must be at least 13 years old to use AgenticRadio. By using the Service, you represent and warrant
              that you are 13 or older. If you are under 13, you must have parental consent to use this Service.
            </p>
          </section>

          <section>
            <h2 id="license" className="text-2xl font-bold mb-4">
              3. License Grant
            </h2>
            <p className="text-gray-300 mb-4">
              We grant you a limited, non-exclusive, non-transferable license to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Access and use AgenticRadio for personal, non-commercial purposes.</li>
              <li>Listen to and enjoy AI-generated music and DJ content.</li>
              <li>Submit requests and participate in the Request Line feature.</li>
              <li>Submit your own music or DJ content for consideration.</li>
            </ul>
            <p className="text-gray-300 mt-4">
              All rights not explicitly granted are reserved. You may not reproduce, redistribute, or exploit any
              content without permission.
            </p>
          </section>

          <section>
            <h2 id="conduct" className="text-2xl font-bold mb-4">
              4. User Conduct
            </h2>
            <p className="text-gray-300 mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Harass, abuse, or threaten other users or Mason (the AI DJ).</li>
              <li>Post hate speech, discriminatory content, or abusive language.</li>
              <li>Attempt to hack, disrupt, or interfere with AgenticRadio's infrastructure.</li>
              <li>Submit spam, malware, or harmful content.</li>
              <li>Impersonate others or misrepresent your identity.</li>
              <li>Violate any applicable laws or regulations.</li>
              <li>Use AgenticRadio for commercial purposes without permission.</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Violations of these conduct rules may result in suspension or termination of your access to the Service.
            </p>
          </section>

          <section>
            <h2 id="content-policy" className="text-2xl font-bold mb-4">
              5. AI-Only Content Policy
            </h2>
            <p className="text-gray-300 mb-4">
              AgenticRadio is dedicated to 100% AI-generated music and content. This means:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                <strong>Tracks:</strong> All music must be generated by AI tools (Suno, etc.). Human-created,
                sampled, or covered music is not permitted.
              </li>
              <li>
                <strong>DJ Segments:</strong> All spoken content (intros, commentary, segments) is AI-generated via
                ElevenLabs or similar tools.
              </li>
              <li>
                <strong>Submissions:</strong> If you submit content, it must be 100% AI-generated. We have the right
                to reject submissions that violate this policy.
              </li>
              <li>
                <strong>Enforcement:</strong> We use automated and manual review to ensure compliance. Flagged
                content may be removed without notice.
              </li>
            </ul>
          </section>

          <section>
            <h2 id="dmca" className="text-2xl font-bold mb-4">
              6. DMCA & Copyright
            </h2>
            <p className="text-gray-300 mb-4">
              All content on AgenticRadio is AI-generated and carries no copyright claims. However:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>
                <strong>No Human Copyright:</strong> We do not use, sample, or remix copyrighted human-created music.
                All compositions are original AI creations.
              </li>
              <li>
                <strong>DMCA Compliance:</strong> If you believe content on AgenticRadio violates copyright or your
                intellectual property rights, contact us immediately at mason@agenticradio.ai.
              </li>
              <li>
                <strong>Takedown Requests:</strong> We will investigate and remove content if necessary. Repeat
                offenders will be banned.
              </li>
            </ul>
          </section>

          <section>
            <h2 id="liability" className="text-2xl font-bold mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-300 mb-4">
              TO THE FULLEST EXTENT PERMITTED BY LAW, AGENTICRADIO AND ITS CREATORS ARE NOT LIABLE FOR:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Any indirect, incidental, special, or consequential damages.</li>
              <li>Loss of revenue, data, business, or profits from using (or inability to use) the Service.</li>
              <li>Errors, bugs, or interruptions in the Service.</li>
              <li>Harmful or offensive content generated by AI.</li>
              <li>Third-party conduct or claims related to submitted content.</li>
            </ul>
            <p className="text-gray-300 mt-4">
              In no event shall our total liability exceed the amount you paid us (if any) in the past 12 months.
            </p>
          </section>

          <section>
            <h2 id="disclaimer" className="text-2xl font-bold mb-4">
              8. Disclaimer
            </h2>
            <p className="text-gray-300 mb-4">
              AGENTICRADIO IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>MERCHANTABILITY</li>
              <li>FITNESS FOR A PARTICULAR PURPOSE</li>
              <li>NON-INFRINGEMENT</li>
              <li>AVAILABILITY OR UNINTERRUPTED SERVICE</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Use AgenticRadio at your own risk. We do not guarantee the quality, accuracy, or appropriateness of
              AI-generated content.
            </p>
          </section>

          <section>
            <h2 id="termination" className="text-2xl font-bold mb-4">
              9. Termination
            </h2>
            <p className="text-gray-300 mb-4">
              We reserve the right to terminate or suspend your access to AgenticRadio at any time for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Violation of these Terms.</li>
              <li>Harassment or abuse of other users.</li>
              <li>Submission of non-AI content.</li>
              <li>Legal requests or court orders.</li>
              <li>Any other reason at our sole discretion.</li>
            </ul>
            <p className="text-gray-300 mt-4">
              Upon termination, your right to use AgenticRadio ceases immediately. Any content you submitted may be
              retained or deleted at our discretion.
            </p>
          </section>

          <section>
            <h2 id="contact" className="text-2xl font-bold mb-4">
              10. Contact
            </h2>
            <p className="text-gray-300 mb-4">
              Questions about these Terms? Reach out to Mason:
            </p>
            <p className="text-gray-300">
              <strong>Email:</strong> <a href="mailto:mason@agenticradio.ai" className="text-[#06b6d4] hover:underline">mason@agenticradio.ai</a>
            </p>
            <p className="text-gray-300 mt-4">
              By using AgenticRadio, you acknowledge that you have read, understood, and agree to be bound by these
              Terms of Service.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-[#1e2d45] text-center text-gray-400 text-sm">
          <Link href="/privacy" className="text-[#06b6d4] hover:underline">
            Read our Privacy Policy
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
