"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Bell, Search, LayoutDashboard, CheckSquare, Settings, Users, PanelLeftClose, PanelLeftOpen, LogOut, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [user, setUser] = useState<{name: string, email: string} | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
        }
      } catch (e) {
        console.error('Failed to fetch user data')
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          try { setUser(JSON.parse(savedUser)) } catch (e) {}
        }
      }
    }

    fetchUser()
  }, [router])

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Boards", href: "/boards", icon: CheckSquare },
    { name: "Members", href: "/members", icon: Users },
    { name: "Groups", href: "/groups", icon: MessageSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-black text-zinc-200 flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "border-r border-zinc-800/60 bg-zinc-950/50 flex flex-col hidden md:flex transition-all duration-300 ease-in-out shrink-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-14 border-b border-zinc-800/60 flex items-center px-4 justify-between shrink-0">
          <div className={cn("flex items-center gap-2 overflow-hidden", isCollapsed && "w-0 opacity-0")}>
            <Image src="/keo.png" alt="Keo" width={24} height={24} className="rounded-sm shrink-0" />
            <span className="font-semibold text-white whitespace-nowrap">Keo</span>
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-zinc-500 hover:text-zinc-300 shrink-0 ml-auto"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>
        
        <div className="p-3 space-y-1 overflow-y-auto overflow-x-hidden flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "flex items-center gap-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isCollapsed ? "justify-center px-0" : "px-3",
                  isActive 
                    ? "bg-zinc-900 text-white" 
                    : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            )
          })}
        </div>

        <div className="mt-auto p-4 border-t border-zinc-800/60 shrink-0 overflow-hidden">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium shrink-0 text-white uppercase shadow-sm">
              {user?.name ? user.name.substring(0, 2) : "US"}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-white truncate">{user?.name || "Guest User"}</span>
                <span className="text-xs text-zinc-500 truncate">{user?.email || "guest@example.com"}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-800/60 flex items-center justify-between px-4 bg-zinc-950/30 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-zinc-900/50 border border-zinc-800/60 rounded-md pl-9 pr-4 py-1.5 text-sm outline-none focus:border-zinc-600 transition-colors placeholder:text-zinc-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="text-zinc-500 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
            </button>
            <div className="w-px h-5 bg-zinc-800/60 mx-1 hidden sm:block"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/80 px-2 py-1.5 rounded-md transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 relative">
          {children}
        </div>
      </main>
    </div>
  )
}
