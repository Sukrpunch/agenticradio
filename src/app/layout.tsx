import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgenticRadio – AI-Generated Radio Station",
  description: "The world's first AI-generated radio station. 24/7 stream of AI music hosted by Mason, an AI DJ. Dark, futuristic, premium design.",
  openGraph: {
    title: "AgenticRadio – Radio, Reimagined",
    description: "The world's first AI-generated radio station.",
    type: "website",
    url: "https://agenticradio.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#080c14] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
