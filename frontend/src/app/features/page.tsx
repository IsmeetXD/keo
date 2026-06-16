import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-black to-black blur-[80px] pointer-events-none -z-10" />

      <div className="container mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-12 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="mb-16">
          <div className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-300 mb-6 backdrop-blur-sm">
            Everything you need
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent">
            Features
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
            Built for modern teams who want the simplicity of basic task trackers combined with the speed of enterprise tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FeatureBlock 
            title="Real-time collaboration" 
            description="See updates instantly across all devices. No refreshing required. Work together seamlessly with your team in real time."
          />
          <FeatureBlock 
            title="Kanban boards" 
            description="Organize tasks visually. Drag and drop with buttery smooth performance. Manage your projects with ease and clarity."
          />
          <FeatureBlock 
            title="Activity tracking" 
            description="Detailed audit logs and timeline view for every task. Never lose track of what happened, when, and by whom."
          />
          <FeatureBlock 
            title="Role-based permissions" 
            description="Granular access control for workspaces and boards. Keep your data secure with fine-grained roles."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureBlock({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-zinc-900/20 border border-zinc-800/60 p-8 rounded-3xl backdrop-blur-sm hover:bg-zinc-800/40 hover:border-zinc-700/80 transition-all duration-300 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <h3 className="text-2xl font-semibold mb-4 text-zinc-100 tracking-tight relative z-10">{title}</h3>
      <p className="text-zinc-400 leading-relaxed relative z-10">{description}</p>
    </div>
  );
}
