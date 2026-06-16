"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, LayoutGrid, Clock, Users, CheckSquare, Pencil, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

// Helper function to format relative time
function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function BoardsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [boards, setBoards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // New board state
  const [newBoardName, setNewBoardName] = useState("")
  const [newBoardDesc, setNewBoardDesc] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchBoards = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch("http://localhost:3001/api/boards", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setBoards(data.boards)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBoards()
  }, [])

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBoardName.trim()) return

    const token = localStorage.getItem('token')
    if (!token) return

    setIsCreating(true)
    try {
      const res = await fetch("http://localhost:3001/api/boards", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newBoardName, description: newBoardDesc })
      })

      if (res.ok) {
        setNewBoardName("")
        setNewBoardDesc("")
        setIsDialogOpen(false)
        fetchBoards() // Refresh the list
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditBoard = async (e: React.MouseEvent, board: any) => {
    e.preventDefault()
    const newName = prompt("Edit board name:", board.name)
    if (!newName) return
    
    const newDesc = prompt("Edit description:", board.description || "")
    if (newDesc === null) return

    if (newName === board.name && newDesc === board.description) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`http://localhost:3001/api/boards/${board.id}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newName, description: newDesc })
      })

      if (res.ok) {
        fetchBoards()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    if (!confirm("Are you sure you want to delete this board? This action cannot be undone.")) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`http://localhost:3001/api/boards/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (res.ok) {
        fetchBoards()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const filteredBoards = boards.filter(board => 
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Boards</h1>
          <p className="text-zinc-400 text-sm">Manage your projects and workflows.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="bg-white text-black hover:bg-zinc-200 font-medium" />}>
            <Plus className="w-4 h-4 mr-2" />
            New Board
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Board</DialogTitle>
              <DialogDescription className="text-zinc-400">
                A board helps you organize tasks, bugs, or feature requests.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBoard} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Name</label>
                <Input 
                  placeholder="e.g. Engineering Roadmap" 
                  value={newBoardName}
                  onChange={e => setNewBoardName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Description <span className="text-zinc-600 font-normal">(Optional)</span></label>
                <Textarea 
                  placeholder="What is this board for?" 
                  value={newBoardDesc}
                  onChange={e => setNewBoardDesc(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 resize-none h-24"
                />
              </div>
              <DialogFooter className="pt-4">
                <DialogClose render={<Button type="button" variant="outline" className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white" />}>
                  Cancel
                </DialogClose>
                <Button type="submit" disabled={isCreating || !newBoardName.trim()} className="bg-white text-black hover:bg-zinc-200">
                  {isCreating ? "Creating..." : "Create Board"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search boards..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card 
          onClick={() => setIsDialogOpen(true)}
          className="bg-zinc-950 border-zinc-800/60 hover:bg-zinc-900/50 transition-colors border-dashed cursor-pointer flex flex-col items-center justify-center min-h-[200px] text-zinc-500 hover:text-white group"
        >
          <div className="w-10 h-10 rounded-full bg-zinc-900 group-hover:bg-zinc-800 flex items-center justify-center mb-3 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-medium text-sm">Create New Board</span>
        </Card>

        {isLoading ? (
          <div className="col-span-full h-32 flex items-center justify-center text-sm text-zinc-500">
            Loading boards...
          </div>
        ) : filteredBoards.length === 0 ? (
          <div className="col-span-full h-32 flex flex-col items-center justify-center text-sm text-zinc-500">
            <p>No boards found.</p>
            {searchQuery && <p className="text-xs mt-1">Try adjusting your search query.</p>}
          </div>
        ) : (
          filteredBoards.map((board) => (
            <Link key={board.id} href={`/boards/${board.id}`}>
              <Card className="bg-zinc-950 border-zinc-800/60 hover:border-zinc-700 p-5 h-full min-h-[200px] flex flex-col transition-all hover:bg-zinc-900/30 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-zinc-700 transition-colors">
                    <LayoutGrid className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      className="text-zinc-500 hover:text-white p-1.5 rounded-md hover:bg-zinc-800 transition-all"
                      onClick={(e) => handleEditBoard(e, board)} 
                      title="Edit Board"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-zinc-500 hover:text-red-400 p-1.5 rounded-md hover:bg-zinc-800 transition-all"
                      onClick={(e) => handleDeleteBoard(e, board.id)} 
                      title="Delete Board"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-white transition-colors">{board.name}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">{board.description || "No description provided."}</p>
                
                <div className="flex items-center justify-between text-xs text-zinc-500 pt-4 border-t border-zinc-800/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {timeAgo(board.updatedAt)}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title={`${board.members} members`}><Users className="w-3.5 h-3.5" /> {board.members}</span>
                    <span className="flex items-center gap-1" title={`${board.tasks} tasks`}><CheckSquare className="w-3.5 h-3.5" /> {board.tasks}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
