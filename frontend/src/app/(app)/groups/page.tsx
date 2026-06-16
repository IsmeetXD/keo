"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Users, Plus, MessageSquare, DoorOpen } from "lucide-react"

type Group = {
  id: string
  name: string
  description: string
  isMember: boolean
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDesc, setNewGroupDesc] = useState("")

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch("http://localhost:3001/api/groups", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setGroups(data.groups)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const handleJoin = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups/${id}/join`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        fetchGroups()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc })
      })
      if (res.ok) {
        setShowCreateModal(false)
        setNewGroupName("")
        setNewGroupDesc("")
        fetchGroups()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Groups</h1>
          <p className="text-zinc-400 text-sm mt-1">Join a group to start chatting with your team.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800/60 border-dashed rounded-lg bg-zinc-950/30">
          <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No groups yet</h3>
          <p className="text-zinc-500 text-sm mb-4">Create the first group to start chatting.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-md transition-colors"
          >
            Create Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium text-white truncate pr-4">{group.name}</h3>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
              <p className="text-zinc-400 text-sm flex-1 mb-6 line-clamp-2">
                {group.description || "No description provided."}
              </p>
              
              {group.isMember ? (
                <Link 
                  href={`/groups/${group.id}`}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Chat
                </Link>
              ) : (
                <button 
                  onClick={() => handleJoin(group.id)}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <DoorOpen className="w-4 h-4" />
                  Join Group
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Group</h2>
              <form onSubmit={handleCreateGroup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Group Name</label>
                    <input 
                      type="text" 
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                      placeholder="e.g. Engineering Team"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Description (Optional)</label>
                    <textarea 
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-none h-24"
                      placeholder="What is this group for?"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
