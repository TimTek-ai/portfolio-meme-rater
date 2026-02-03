import type { Metadata, Viewport } from "next";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Meme Rater",
  description: "Turn your portfolio gains and losses into viral memes. Made for r/wallstreetbets degenerates.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Portfolio Meme Rater",
    description: "Turn your portfolio gains and losses into viral memes 📈📉",
    url: "https://portfolio-meme-rater.vercel.app",
    siteName: "Portfolio Meme Rater",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Meme Rater",
    description: "Turn your portfolio gains and losses into viral memes 📈📉",
  },
  keywords: ["meme generator", "wallstreetbets", "stocks", "portfolio", "investing", "loss porn", "gains"],
};

export const viewport: Viewport = {
  themeColor: "#1f2937",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="bg-gray-900 text-white min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
