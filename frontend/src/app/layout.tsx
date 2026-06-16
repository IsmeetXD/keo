import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
import "./globals.css";
import { Providers } from "@/components/providers";


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keo | Project Management",
  description: "Project management built for modern teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-black text-zinc-50 selection:bg-zinc-800 font-sans`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
