import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black blur-[80px] pointer-events-none -z-10" />

      <div className="container mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="mb-16">
          <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-300 mb-6 backdrop-blur-sm">
            Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent">
            About Keo
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed mb-12">
            Keo was built for modern teams who want the simplicity of basic task trackers combined with the speed and capabilities of enterprise project management tools.
          </p>
          
          <div className="bg-zinc-900/20 border border-zinc-800/60 p-8 md:p-12 rounded-3xl backdrop-blur-sm relative overflow-hidden group hover:border-zinc-700/80 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-3xl font-semibold mb-6 text-zinc-100 tracking-tight relative z-10">Our Mission</h2>
            <p className="text-zinc-400 text-lg leading-relaxed relative z-10">
              We believe that software should get out of your way. Our mission is to create a project management platform that feels invisible, allowing your team to focus entirely on the work that matters. No bloat, no complex onboarding—just pure productivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
