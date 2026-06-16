import { Card } from "@/components/ui/card"
import { CheckCircle2, Clock, Activity } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Dashboard</h1>
        <p className="text-zinc-400 text-sm">Here's an overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-950 border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center gap-3 text-zinc-400">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="font-medium text-sm">Tasks Completed</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-white">0</div>
            <div className="flex items-center text-xs text-zinc-500 font-medium">
              No data yet
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center gap-3 text-zinc-400">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-sm">In Progress</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-white">0</div>
            <div className="flex items-center text-xs text-zinc-500 font-medium">
              Across 0 boards
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800/60 p-5 space-y-4">
          <div className="flex items-center gap-3 text-zinc-400">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-sm">Active Members</span>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold text-white">1</div>
            <div className="flex items-center text-xs text-zinc-500 font-medium">
              Just you
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Card className="bg-zinc-950 border-zinc-800/60 p-12 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-500">No recent activity to show.</p>
            <p className="text-xs text-zinc-600 mt-1">Actions taken by your team will appear here.</p>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">My Tasks</h2>
          <Card className="bg-zinc-950 border-zinc-800/60 p-12 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-500">You have no tasks assigned to you.</p>
            <p className="text-xs text-zinc-600 mt-1">Tasks assigned to you will appear here.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
