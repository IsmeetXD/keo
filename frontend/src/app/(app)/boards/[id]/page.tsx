"use client"

import { useState, use, useEffect } from "react"
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragEndEvent, 
  DragOverEvent,
  useDroppable
} from "@dnd-kit/core"
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  useSortable 
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, ArrowLeft, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

// Types
type Task = { id: string, title: string, columnId: string }
type Column = { id: string, title: string }

const initialTasks: Task[] = []

function SortableTask({ task, onDelete, onEdit }: { task: Task, onDelete: (id: string) => void, onEdit: (id: string, newTitle: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id, 
    data: { type: "Task", task } 
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1, // Hide original when dragging (overlay is shown)
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="bg-zinc-900 border border-zinc-800 p-3 rounded-md cursor-grab hover:border-zinc-700 transition-colors shadow-sm select-none group relative flex justify-between items-start"
    >
      <p className="text-sm text-zinc-200 pr-2">{task.title}</p>
      
      {/* Action buttons - onPointerDown prevents dnd-kit from starting drag when clicking buttons */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => { const newTitle = prompt("Edit task title:", task.title); if (newTitle && newTitle !== task.title) onEdit(task.id, newTitle) }}
          className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800"
          title="Edit"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => { if (confirm("Delete task?")) onDelete(task.id) }}
          className="text-zinc-500 hover:text-red-400 p-1 rounded hover:bg-zinc-800"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function BoardColumn({ column, tasks, onDeleteTask, onEditTask, onAddTask, onDeleteColumn }: { column: Column, tasks: Task[], onDeleteTask: (id: string) => void, onEditTask: (id: string, newTitle: string) => void, onAddTask: (columnId: string) => void, onDeleteColumn: (id: string) => void }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "Column", column }
  })

  return (
    <div className="flex flex-col bg-zinc-950/50 border border-zinc-800/60 rounded-lg w-72 shrink-0 h-[calc(100vh-14rem)]">
      <div className="p-3 border-b border-zinc-800/60 flex items-center justify-between shrink-0 bg-zinc-950/80 rounded-t-lg">
        <h3 className="font-semibold text-sm text-zinc-300 flex items-center gap-2">
          {column.title}
          <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full text-xs font-medium">
            {tasks.length}
          </span>
        </h3>
        <button 
          onClick={() => { if (confirm(`Delete column "${column.title}" and all its tasks?`)) onDeleteColumn(column.id) }}
          className="text-zinc-500 hover:text-red-400 p-1 rounded-md hover:bg-zinc-800 transition-colors"
          title="Delete Column"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div ref={setNodeRef} className="p-2 flex-1 overflow-y-auto">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 min-h-[150px]">
            {tasks.map(task => (
              <SortableTask key={task.id} task={task} onDelete={onDeleteTask} onEdit={onEditTask} />
            ))}
          </div>
        </SortableContext>
        <Button onClick={() => onAddTask(column.id)} variant="ghost" className="w-full mt-2 text-zinc-500 hover:text-white justify-start hover:bg-zinc-900/50 border border-dashed border-zinc-800">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>
    </div>
  )
}

export default function KanbanBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const [boardData, setBoardData] = useState<any>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  useEffect(() => {
    const fetchBoardDetails = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      
      try {
        const res = await fetch(`http://localhost:3001/api/boards/${unwrappedParams.id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setBoardData(data.board)
          const loadedCols = data.columns.map((c: any) => ({ id: c.id, title: c.name }))
          const loadedTasks = data.tasks.map((t: any) => ({ id: t.id, title: t.title, columnId: t.columnId }))
          setColumns(loadedCols)
          setTasks(loadedTasks)
        }
      } catch (e) {
        console.error(e)
      }
    }
    
    fetchBoardDetails()
  }, [unwrappedParams.id])

  const handleDeleteTask = async (id: string) => {
    setTasks(tasks => tasks.filter(t => t.id !== id))
    const token = localStorage.getItem('token')
    try {
      await fetch(`http://localhost:3001/api/boards/${unwrappedParams.id}/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
    } catch (e) { console.error(e) }
  }

  const handleEditTask = async (id: string, newTitle: string) => {
    setTasks(tasks => tasks.map(t => t.id === id ? { ...t, title: newTitle } : t))
    const token = localStorage.getItem('token')
    try {
      await fetch(`http://localhost:3001/api/boards/${unwrappedParams.id}/tasks/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      })
    } catch (e) { console.error(e) }
  }

  const handleAddTask = async (columnId: string) => {
    const title = prompt("Enter task title:")
    if (!title) return
    const token = localStorage.getItem('token')
    
    const tempId = `temp-${Date.now()}`
    setTasks(tasks => [...tasks, { id: tempId, title, columnId }])
    
    try {
      const res = await fetch(`http://localhost:3001/api/boards/${unwrappedParams.id}/columns/${columnId}/tasks`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ title })
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(tasks => tasks.map(t => t.id === tempId ? { id: data.task.id, title: data.task.title, columnId: data.task.columnId } : t))
      }
    } catch (e) { console.error(e) }
  }

  const handleAddColumn = async () => {
    const title = prompt("Enter column name:")
    if (!title) return
    const token = localStorage.getItem('token')
    
    const tempId = `temp-${Date.now()}`
    setColumns(cols => [...cols, { id: tempId, title }])
    
    try {
      const res = await fetch(`http://localhost:3001/api/boards/${unwrappedParams.id}/columns`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: title })
      })
      if (res.ok) {
        const data = await res.json()
        setColumns(cols => cols.map(c => c.id === tempId ? { id: data.column.id, title: data.column.name } : c))
      }
    } catch (e) { console.error(e) }
  }

  const handleDeleteColumn = async (id: string) => {
    setColumns(cols => cols.filter(c => c.id !== id))
    setTasks(tasks => tasks.filter(t => t.columnId !== id))
    const token = localStorage.getItem('token')
    try {
      await fetch(`http://localhost:3001/api/boards/${unwrappedParams.id}/columns/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
    } catch (e) { console.error(e) }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === "Task"
    const isOverTask = over.data.current?.type === "Task"
    const isOverColumn = over.data.current?.type === "Column"
    
    // Dragging task over another task
    if (isActiveTask && isOverTask) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId)
        const overIndex = tasks.findIndex(t => t.id === overId)
        
        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          const newTasks = [...tasks]
          newTasks[activeIndex].columnId = tasks[overIndex].columnId
          return arrayMove(newTasks, activeIndex, overIndex)
        }
        return arrayMove(tasks, activeIndex, overIndex)
      })
    }

    // Dragging task over empty column space
    if (isActiveTask && isOverColumn) {
      setTasks(tasks => {
        const activeIndex = tasks.findIndex(t => t.id === activeId)
        if (tasks[activeIndex].columnId !== overId) {
          const newTasks = [...tasks]
          newTasks[activeIndex].columnId = String(overId)
          return newTasks
        }
        return tasks
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active } = event
    
    // Using a microtask delay ensures we read the updated `tasks` state
    // after React commits the handleDragOver setState updates.
    setTimeout(async () => {
      setTasks(currentTasks => {
        const updatedTask = currentTasks.find(t => t.id === active.id)
        if (updatedTask) {
          const token = localStorage.getItem('token')
          fetch(`http://localhost:3001/api/boards/${unwrappedParams.id}/tasks/${updatedTask.id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ columnId: updatedTask.columnId })
          }).catch(console.error)
        }
        return currentTasks
      })
    }, 0)
  }

  return (
    <div className="h-full flex flex-col space-y-4 max-w-full overflow-hidden">
      <div className="flex items-center gap-4 border-b border-zinc-800/60 pb-4">
        <Link href="/boards" className="text-zinc-500 hover:text-white transition-colors bg-zinc-950 p-2 rounded-md border border-zinc-800">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">{boardData?.name || "Loading..."}</h1>
          <p className="text-zinc-400 text-xs mt-0.5">ID: {unwrappedParams.id}</p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart} 
          onDragOver={handleDragOver} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full items-start px-1">
            {columns.map(col => (
              <BoardColumn 
                key={col.id} 
                column={col} 
                tasks={tasks.filter(t => t.columnId === col.id)} 
                onDeleteTask={handleDeleteTask}
                onEditTask={handleEditTask}
                onAddTask={handleAddTask}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}
            
            <button onClick={handleAddColumn} className="flex items-center justify-center gap-2 bg-zinc-950/30 border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 w-72 shrink-0 h-14 rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Column</span>
            </button>
          </div>
          
          <DragOverlay>
            {activeTask ? (
              <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-md shadow-2xl rotate-3 opacity-90 cursor-grabbing">
                <p className="text-sm text-zinc-200">{activeTask.title}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
