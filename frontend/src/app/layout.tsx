import type { Metadata } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Manrope({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ouroboros — GenAI Payment Fraud Red/Blue Loop",
  description: "Closed-loop AI system that identifies, generates, and defends against GenAI-era payment fraud.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
