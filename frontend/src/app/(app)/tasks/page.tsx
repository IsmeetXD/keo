"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { GripVertical, Plus, Smile, Image as ImageIcon, MessageSquare, MoreHorizontal, Calendar, ArrowRight, Check, X, Loader2, Trash2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const EMOJIS = ["📝", "🎯", "🚀", "💡", "✨", "📌", "✅", "🔥", "💻", "🎨", "🌟", "📚"]
const COVERS = [
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23ff7eb3' /%3E%3Cstop offset='100%25' stop-color='%23ff758c' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g1)' /%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%234facfe' /%3E%3Cstop offset='100%25' stop-color='%2300f2fe' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g2)' /%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23c471ed' /%3E%3Cstop offset='100%25' stop-color='%23f64f59' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g3)' /%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2311998e' /%3E%3Cstop offset='100%25' stop-color='%2338ef7d' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g4)' /%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='g5' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23141e30' /%3E%3Cstop offset='100%25' stop-color='%23243b55' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g5)' /%3E%3C/svg%3E"
]

type Task = {
  id: string;
  text: string;
  completed: boolean;
}

function SortableTask({ 
  task, 
  index, 
  hoveredTaskId, 
  setHoveredTaskId, 
  toggleTask, 
  handleTaskChange, 
  handleKeyDown, 
  deleteTask, 
  addTaskAtNextIndex 
}: {
  task: Task;
  index: number;
  hoveredTaskId: string | null;
  setHoveredTaskId: (id: string | null) => void;
  toggleTask: (id: string) => void;
  handleTaskChange: (id: string, text: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, id: string, index: number) => void;
  deleteTask: (id: string) => void;
  addTaskAtNextIndex: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 group/task relative py-1 rounded-md transition-colors hover:bg-zinc-900/30",
        isDragging && "opacity-50"
      )}
      onMouseEnter={() => setHoveredTaskId(task.id)}
      onMouseLeave={() => setHoveredTaskId(null)}
    >
      {/* Hover handles */}
      <div 
        className={cn(
          "absolute -left-12 top-1.5 flex items-center gap-0.5 transition-opacity duration-200",
          hoveredTaskId === task.id || isDragging ? "opacity-100" : "opacity-0"
        )}
      >
        <button 
          className="text-zinc-500 hover:text-white p-0.5 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
          onClick={() => addTaskAtNextIndex(index)}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button 
          {...attributes} 
          {...listeners} 
          className="text-zinc-500 hover:text-white p-0.5 rounded hover:bg-zinc-800 transition-colors cursor-grab active:cursor-grabbing"
        >
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

      {/* Delete Button */}
      <button
        onClick={() => deleteTask(task.id)}
        className="mt-1 text-zinc-500 hover:text-red-500 p-0.5 rounded hover:bg-zinc-800 transition-all opacity-0 group-hover/task:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function TasksPage() {
  const [title, setTitle] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])

  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  
  // New states for Notion-like features
  const [icon, setIcon] = useState<string | null>(null)
  const [cover, setCover] = useState<string | null>(null)
  const [showIconPicker, setShowIconPicker] = useState(false)
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [customCoverUrl, setCustomCoverUrl] = useState("")
  const [comments, setComments] = useState<string[]>([])
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null)
  const [editCommentText, setEditCommentText] = useState("")

  const handleEditComment = (index: number) => {
    setEditingCommentIndex(index)
    setEditCommentText(comments[index])
  }

  const handleSaveComment = (index: number) => {
    if (!editCommentText.trim()) {
      handleRemoveComment(index)
    } else {
      const newComments = [...comments]
      newComments[index] = editCommentText.trim()
      setComments(newComments)
    }
    setEditingCommentIndex(null)
  }

  const handleRemoveComment = (index: number) => {
    setComments(comments.filter((_, i) => i !== index))
    if (editingCommentIndex === index) setEditingCommentIndex(null)
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setCover(event.target.result as string)
          setShowCoverPicker(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

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

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex(t => t.id === active.id);
        const newIndex = items.findIndex(t => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

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
          <div className={cn("absolute top-4 right-4 transition-opacity flex gap-2", showCoverPicker ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
            <button 
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors"
            >
              Change cover
            </button>
            <button 
              onClick={() => { setCover(null); setShowCoverPicker(false); }}
              className="bg-zinc-900/80 hover:bg-zinc-800 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-sm transition-colors"
            >
              Remove
            </button>
          </div>

          {showCoverPicker && (
            <div className="absolute top-14 right-4 bg-zinc-900 border border-zinc-800 rounded-lg p-3 shadow-xl z-30 w-72">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-zinc-300 font-medium">Gallery</div>
                <button onClick={() => setShowCoverPicker(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {COVERS.map(c => (
                  <button 
                    key={c}
                    onClick={() => { setCover(c); setShowCoverPicker(false); }}
                    className="h-16 rounded-md overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all border border-zinc-800"
                  >
                    <img src={c} alt="Cover option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-zinc-300 mb-2 font-medium">Upload</div>
              <div className="mb-4">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-1.5 rounded-md transition-colors border border-zinc-700"
                >
                  Choose an image
                </button>
              </div>

              <div className="text-sm text-zinc-300 mb-2 font-medium">Custom Link</div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customCoverUrl}
                  onChange={(e) => setCustomCoverUrl(e.target.value)}
                  placeholder="Paste an image URL..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-2 py-1 text-sm text-white outline-none focus:border-zinc-700"
                />
                <button
                  onClick={() => { if(customCoverUrl) { setCover(customCoverUrl); setShowCoverPicker(false); setCustomCoverUrl(""); } }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1 rounded-md transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto py-10 px-4 md:px-8 pb-32 relative">
        {/* Icon */}
        {icon && (
          <div className={cn("relative group w-max mb-4", cover ? "mt-[-4rem]" : "mt-0")}>
            <div 
              className="w-20 h-20 md:w-24 md:h-24 text-6xl md:text-7xl bg-zinc-950 flex items-center justify-center rounded-xl relative z-10 cursor-pointer shadow-sm border border-zinc-900/50" 
              onClick={() => setShowIconPicker(!showIconPicker)}
            >
              <span className="block leading-none">{icon}</span>
            </div>
            <button 
              onClick={() => setIcon(null)}
              className="absolute -top-2 -right-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md"
            >
              <X className="w-3.5 h-3.5" />
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
                <div key={i} className="flex gap-3 text-sm text-zinc-300 bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50 group/comment relative pr-16">
                  <MessageSquare className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                  {editingCommentIndex === i ? (
                    <input
                      autoFocus
                      type="text"
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveComment(i)
                        else if (e.key === 'Escape') setEditingCommentIndex(null)
                      }}
                      onBlur={() => handleSaveComment(i)}
                      className="flex-1 bg-transparent border-none outline-none text-zinc-200 p-0"
                    />
                  ) : (
                    <p className="flex-1 whitespace-pre-wrap">{comment}</p>
                  )}
                  
                  {editingCommentIndex !== i && (
                    <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditComment(i)}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleRemoveComment(i)}
                        className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
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
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {tasks.map((task, index) => (
              <SortableTask
                key={task.id}
                task={task}
                index={index}
                hoveredTaskId={hoveredTaskId}
                setHoveredTaskId={setHoveredTaskId}
                toggleTask={toggleTask}
                handleTaskChange={handleTaskChange}
                handleKeyDown={handleKeyDown}
                deleteTask={deleteTask}
                addTaskAtNextIndex={(idx) => {
                  const newTask = { id: Math.random().toString(36).substring(7), text: "", completed: false }
                  const newTasks = [...tasks]
                  newTasks.splice(idx + 1, 0, newTask)
                  setTasks(newTasks)
                  setTimeout(() => {
                    const nextInput = document.getElementById(`task-input-${newTask.id}`)
                    if (nextInput) {
                      nextInput.focus()
                    }
                  }, 10)
                }}
              />
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
        </SortableContext>
      </DndContext>
      </div>
    </div>
  )
}
