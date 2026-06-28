"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { GripVertical, Plus, Smile, Image as ImageIcon, MessageSquare, MoreHorizontal, Calendar, ArrowRight, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const EMOJIS = ["📝", "🎯", "🚀", "💡", "✨", "📌", "✅", "🔥", "💻", "🎨", "🌟", "📚"]
const COVERS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=2000&q=80"
]

type Task = {
  id: string;
  text: string;
  completed: boolean;
}

export default function TasksPage() {
  const [title, setTitle] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])

  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  
  // New states for Notion-like features
  const [icon, setIcon] = useState<string | null>(null)
  const [cover, setCover] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [comments, setComments] = useState<string[]>([])
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial data
  useEffect(() => {
    const fetchTasksPage = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const res = await fetch("http://localhost:3001/api/tasks", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.page) {
            setTitle(data.page.title || "")
            setIcon(data.page.icon || null)
            setCover(data.page.cover || null)
            if (data.items && data.items.length > 0) setTasks(data.items.map((i: any) => ({ id: i.id || Math.random().toString(), text: i.text, completed: i.completed })))
            if (data.comments) setComments(data.comments)
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasksPage()
  }, [])

  // Auto-save debounced
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const saveToDb = useCallback(async (currentData: any) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      await fetch("http://localhost:3001/api/tasks/sync", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(currentData)
      })
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    if (isLoading) return // don't save during initial load
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      saveToDb({ title, cover, icon, items: tasks, comments })
    }, 1000)
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [title, cover, icon, tasks, comments, isLoading, saveToDb])

  const handleAddCover = () => {
    // Pick a random cover that isn't the current one (if possible)
    let nextCover = cover;
    while (nextCover === cover) {
      nextCover = COVERS[Math.floor(Math.random() * COVERS.length)]
    }
    setCover(nextCover)
  }

  const handleAddComment = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newComment.trim()) {
      setComments([...comments, newComment.trim()])
      setNewComment("")
      setShowCommentInput(false)
    }
  }

  const handleTaskChange = (id: string, text: string) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, text } : t)))
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const newTask = { id: Math.random().toString(36).substring(7), text: "", completed: false }
      const newTasks = [...tasks]
      newTasks.splice(index + 1, 0, newTask)
      setTasks(newTasks)
      
      // We could ideally focus the next input here, but setting state and focusing requires 
      // a bit more ref logic. We'll keep it simple for now.
      setTimeout(() => {
        const nextInput = document.getElementById(`task-input-${newTask.id}`)
        if (nextInput) {
          nextInput.focus()
        }
      }, 10)
    } else if (e.key === 'Backspace' && tasks[index].text === "") {
      e.preventDefault()
      if (tasks.length > 1) {
        const newTasks = tasks.filter(t => t.id !== id)
        setTasks(newTasks)
        setTimeout(() => {
          const prevIndex = index > 0 ? index - 1 : 0
          const prevInput = document.getElementById(`task-input-${newTasks[prevIndex].id}`)
          if (prevInput) {
            prevInput.focus()
          }
        }, 10)
      }
    }
  }

  const addTaskAtBottom = () => {
    const newTask = { id: Math.random().toString(36).substring(7), text: "", completed: false }
    setTasks([...tasks, newTask])
    setTimeout(() => {
      const nextInput = document.getElementById(`task-input-${newTask.id}`)
      if (nextInput) {
        nextInput.focus()
      }
    }, 10)
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Cover Image */}
      {cover && (
        <div className="w-full h-48 md:h-64 relative group">
          <img src={cover} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button 
              onClick={handleAddCover}
              className="bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors"
            >
              Change cover
            </button>
            <button 
              onClick={() => setCover(null)}
              className="bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-10 px-4 md:px-8 pb-32 relative">
        {/* Icon */}
        {icon && (
          <div className="relative group w-max mt-[-4rem] mb-4">
            <div className="text-6xl md:text-7xl bg-zinc-950 p-2 rounded-xl relative z-10 cursor-pointer" onClick={() => setShowIconPicker(!showIconPicker)}>
              {icon}
            </div>
            <button 
              onClick={() => setIcon(null)}
              className="absolute -top-2 -right-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
              <X className="w-3 h-3" />
            </button>
            
            {showIconPicker && (
              <div className="absolute top-full left-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl z-30 grid grid-cols-4 gap-2 w-max">
                {EMOJIS.map(e => (
                  <button 
                    key={e} 
                    onClick={() => { setIcon(e); setShowIconPicker(false) }}
                    className="text-2xl hover:bg-zinc-800 p-2 rounded-md transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-6 mb-8 group">
          <div className="flex items-center gap-4 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity h-6">
            {!icon && (
              <button 
                onClick={() => setIcon(EMOJIS[0])}
                className="flex items-center gap-1.5 text-sm hover:bg-zinc-900 px-2 py-1 rounded-md transition-colors"
              >
                <Smile className="w-4 h-4" /> Add icon
              </button>
            )}
            {!cover && (
              <button 
                onClick={handleAddCover}
                className="flex items-center gap-1.5 text-sm hover:bg-zinc-900 px-2 py-1 rounded-md transition-colors"
              >
                <ImageIcon className="w-4 h-4" /> Add cover
              </button>
            )}
            <button 
              onClick={() => { setShowCommentInput(true); setTimeout(() => document.getElementById('comment-input')?.focus(), 50) }}
              className="flex items-center gap-1.5 text-sm hover:bg-zinc-900 px-2 py-1 rounded-md transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Add comment
            </button>
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Tasks"
            className="text-4xl md:text-5xl font-bold bg-transparent outline-none placeholder:text-zinc-700 text-white w-full"
          />
          
          {/* Simple Description */}
          <p className="text-zinc-400">
            A space to manage your daily tasks, ideas, and goals. Press <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-xs text-zinc-300">Enter</kbd> to add a new task, or <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-xs text-zinc-300">Backspace</kbd> to remove an empty one.
          </p>

          {/* Comments Section */}
          {comments.length > 0 && (
            <div className="space-y-3 mt-4">
              {comments.map((comment, i) => (
                <div key={i} className="flex gap-3 text-sm text-zinc-300 bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50">
                  <MessageSquare className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                  <p>{comment}</p>
                </div>
              ))}
            </div>
          )}

          {showCommentInput && (
            <div className="flex items-center gap-2 mt-2">
              <MessageSquare className="w-4 h-4 text-zinc-500" />
              <input 
                id="comment-input"
                type="text" 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={handleAddComment}
                onBlur={() => { if(!newComment) setShowCommentInput(false) }}
                placeholder="Type a comment and press Enter..."
                className="bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none flex-1 py-1"
              />
            </div>
          )}
        </div>
      
      {/* Divider */}
      <div className="w-full h-px bg-zinc-800/60 mb-8"></div>

      {/* Tasks List */}
      <div className="space-y-1">
        {tasks.map((task, index) => (
          <div 
            key={task.id} 
            className="flex items-start gap-2 group/task relative py-1 rounded-md transition-colors hover:bg-zinc-900/30"
            onMouseEnter={() => setHoveredTaskId(task.id)}
            onMouseLeave={() => setHoveredTaskId(null)}
          >
            {/* Hover handles */}
            <div 
              className={cn(
                "absolute -left-12 top-1.5 flex items-center gap-0.5 transition-opacity duration-200",
                hoveredTaskId === task.id ? "opacity-100" : "opacity-0"
              )}
            >
              <button 
                className="text-zinc-500 hover:text-white p-0.5 rounded hover:bg-zinc-800 transition-colors"
                onClick={() => {
                  const newTask = { id: Math.random().toString(36).substring(7), text: "", completed: false }
                  const newTasks = [...tasks]
                  newTasks.splice(index + 1, 0, newTask)
                  setTasks(newTasks)
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
              <button className="text-zinc-500 hover:text-white p-0.5 rounded hover:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Checkbox */}
            <button
              onClick={() => toggleTask(task.id)}
              className={cn(
                "mt-1 w-5 h-5 flex-shrink-0 rounded-[4px] border flex items-center justify-center transition-all cursor-pointer",
                task.completed 
                  ? "bg-blue-500 border-blue-500 text-white" 
                  : "border-zinc-500 hover:border-zinc-400 bg-transparent"
              )}
            >
              {task.completed && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Task Content */}
            <input
              id={`task-input-${task.id}`}
              type="text"
              value={task.text}
              onChange={(e) => handleTaskChange(task.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, task.id, index)}
              placeholder="To-do..."
              className={cn(
                "flex-1 bg-transparent border-none outline-none text-[15px] leading-6 py-0.5 transition-colors",
                task.completed ? "text-zinc-500 line-through" : "text-zinc-200"
              )}
            />
          </div>
        ))}

        {/* Empty add row */}
        <div 
          className="flex items-start gap-2 py-1 mt-1 group/empty cursor-text"
          onClick={addTaskAtBottom}
        >
          <div className="mt-1 w-5 h-5 flex-shrink-0 rounded-[4px] border border-transparent flex items-center justify-center opacity-0 group-hover/empty:opacity-100 transition-opacity">
            <Plus className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex-1 text-[15px] leading-6 py-0.5 text-zinc-500 placeholder:text-zinc-600 outline-none">
            Click to add a task...
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
