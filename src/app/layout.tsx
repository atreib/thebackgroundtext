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
  title: "The Background Text",
  description: "Make your own hollywood-like pictures for free",
  metadataBase: new URL("https://thebackgroundtext.andretreib.com"),
  authors: [{ name: "Andre Treib", url: "https://andretreib.com" }],
  creator: "Andre Treib",
  publisher: "Andre Treib",
  applicationName: "The Background Text",
  keywords: [
    "image extraction",
    "text to image",
    "background removal",
    "text behind image",
    "text in the background",
    "hollywood pictures",
    "marketing pictures",
    "free pictures",
  ],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo-white.png",
    shortcut: "/logo-white.png",
    apple: "/logo-white.png",
  },
  openGraph: {
    title: "The Background Text",
    description: "Make your own hollywood-like pictures for free",
    url: "https://thebackgroundtext.andretreib.com",
    siteName: "The Background Text",
    images: [
      {
        url: "/logo-white.png",
        width: 800,
        height: 600,
        alt: "The Background Text",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Background Text",
    description: "Make your own hollywood-like pictures for free",
    images: ["/logo-white.png"],
    creator: "@treibthedev",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
