import Link from "next/link";
import { Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0f1623] border-t border-[#1e2d45] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Section */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="text-[#7c3aed] font-semibold mb-4">AgenticRadio</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The world's first AI-generated radio station. Built by Chris Mercer + Mason (AI) at Intragentic.com
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/listen" className="hover:text-[#06b6d4] transition-all duration-200">
                  Listen
                </Link>
              </li>
              <li>
                <Link href="/request" className="hover:text-[#06b6d4] transition-all duration-200">
                  Request Line
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-[#06b6d4] transition-all duration-200">
                  Submit
                </Link>
              </li>
              <li>
                <Link href="/channels" className="hover:text-[#06b6d4] transition-all duration-200">
                  Channels
                </Link>
              </li>
              <li>
                <Link href="/creators" className="hover:text-[#06b6d4] transition-all duration-200">
                  For Creators
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Developers</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/developers" className="hover:text-[#06b6d4] transition-all duration-200">
                  API Docs
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#06b6d4] transition-all duration-200">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#06b6d4] transition-all duration-200">
                  Community
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#06b6d4] transition-all duration-200">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Follow</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-[#06b6d4] transition-all duration-200 flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter/X
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#06b6d4] transition-all duration-200">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#06b6d4] transition-all duration-200">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#1e2d45] pt-8">
          <div className="text-center text-gray-500 text-sm space-y-4">
            <div className="flex justify-center gap-6 text-xs">
              <Link href="/privacy" className="hover:text-[#06b6d4] transition-all">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-[#06b6d4] transition-all">
                Terms of Service
              </Link>
            </div>
            <p>© 2026 AgenticRadio.ai — Built by Intragentic.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
