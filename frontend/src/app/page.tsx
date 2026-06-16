"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, CheckCircle2, Layout, Zap, Users, Shield, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-black/50 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/keo.png" alt="Keo" width={24} height={24} className="rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            <span className="font-semibold text-lg tracking-tight">Keo</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ className: "bg-white text-black hover:bg-zinc-200 font-medium rounded-full px-5 h-9" })}>
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="relative w-full pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center">
          <div className="container mx-auto px-4 text-center z-10 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-300 mb-8 backdrop-blur-md shadow-2xl hover:bg-zinc-800/80 hover:border-zinc-700 transition-all cursor-pointer group"
            >
              <span className="flex h-2 w-2 rounded-full bg-green-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
              100% Open Source & Self-Hostable
              <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight"
            >
              Open-source project management <br className="hidden md:block"/> you completely control.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Keo is a modern, collaborative project management platform. The ultimate open-source, self-hostable alternative to Trello, Jira, and Linear.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup" className={buttonVariants({ size: "lg", className: "h-12 px-8 bg-white text-black hover:bg-zinc-200 w-full sm:w-auto rounded-full font-medium shadow-[0_0_40px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95" })}>
                Deploy Your Own <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="https://github.com/IsmeetXD/keo" target="_blank" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 px-8 border-zinc-700 hover:bg-zinc-800 w-full sm:w-auto rounded-full text-white font-medium backdrop-blur-sm transition-all hover:border-zinc-500" })}>
                View GitHub
              </Link>
            </motion.div>
          </div>
          
          {/* Mesh gradient background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/30 via-black to-black blur-[80px] pointer-events-none -z-10" />
        </section>

        {/* Dashboard Preview Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.3 }}
          className="w-full max-w-6xl mx-auto px-4 relative z-20 -mt-8 mb-32 perspective-[2000px]"
        >
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/90 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden transform-gpu hover:shadow-[0_0_80px_rgba(255,255,255,0.05)] transition-all duration-700 ease-out hover:-translate-y-2">
            <div className="h-12 border-b border-zinc-800/60 flex items-center px-4 gap-2 bg-zinc-900/50 relative">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="w-full bg-zinc-950 flex">
              <Image 
                src="/dashboard.png" 
                alt="Keo Dashboard Preview" 
                width={1600}
                height={900}
                className="w-full h-auto opacity-90 transition-opacity hover:opacity-100"
                priority
              />
            </div>
          </div>
        </motion.section>

        {/* Feature Grid */}
        <section id="features" className="w-full py-32 bg-zinc-950/50 border-t border-zinc-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Enterprise features, zero lock-in</h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Host it yourself and keep complete ownership of your team's data.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <FeatureCard 
                icon={<Zap className="h-6 w-6" />}
                title="Real-time collaboration"
                description="See updates instantly across all devices. No refreshing required."
                index={0}
              />
              <FeatureCard 
                icon={<Layout className="h-6 w-6" />}
                title="Kanban boards"
                description="Organize tasks visually. Drag and drop with buttery smooth performance."
                index={1}
              />
              <FeatureCard 
                icon={<CheckCircle2 className="h-6 w-6" />}
                title="Activity tracking"
                description="Detailed audit logs and timeline view for every task."
                index={2}
              />
              <FeatureCard 
                icon={<Shield className="h-6 w-6" />}
                title="Role-based permissions"
                description="Granular access control for workspaces and boards."
                index={3}
              />
              <FeatureCard 
                icon={<Layers className="h-6 w-6" />}
                title="File attachments"
                description="Upload and preview images, documents, and assets securely."
                index={4}
              />
              <FeatureCard 
                icon={<Users className="h-6 w-6" />}
                title="Notifications"
                description="Stay in the loop with a unified inbox for mentions and assignments."
                index={5}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-40 relative overflow-hidden flex justify-center">
          <div className="container mx-auto px-4 text-center z-10 relative">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">Take back control of your data.</h2>
            <p className="text-xl text-zinc-400 mb-10">Deploy Keo in minutes on your own infrastructure.</p>
            <Link href="https://github.com/IsmeetXD/keo" target="_blank" className={buttonVariants({ size: "lg", className: "h-12 px-8 bg-white text-black hover:bg-zinc-200 rounded-full font-medium text-base" })}>
              Fork on GitHub
            </Link>
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black pointer-events-none" />
        </section>
      </main>

      <footer className="border-t border-zinc-900 bg-black py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Image src="/keo.png" alt="Keo" width={20} height={20} className="rounded-sm" />
            <span className="font-medium">Keo</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © 2026 Keo Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="https://github.com/IsmeetXD/keo" className="text-zinc-500 hover:text-white transition-colors">
              <span className="font-medium">GitHub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, index }: { icon: React.ReactNode, title: string, description: string, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="p-8 rounded-3xl border border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-800/40 hover:border-zinc-700/80 transition-all duration-300 group cursor-default shadow-lg hover:shadow-2xl hover:shadow-zinc-900/50 backdrop-blur-sm relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
      <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center mb-6 text-zinc-100 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative z-10">
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-3 text-zinc-100 tracking-tight relative z-10">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed relative z-10">{description}</p>
    </motion.div>
  );
}
