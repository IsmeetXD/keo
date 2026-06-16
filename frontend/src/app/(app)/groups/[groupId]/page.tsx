"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, MoreVertical, Info, Trash2, X, UserMinus } from "lucide-react"

type Message = {
  id: string
  content: string
  createdAt: string
  userId: string
  userName: string
  userAvatar?: string
}

type Group = {
  id: string
  name: string
  description: string
  creatorId: string
}

export default function GroupChatPage() {
  const { groupId } = useParams()
  const router = useRouter()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editGroupName, setEditGroupName] = useState("")
  const [editGroupDesc, setEditGroupDesc] = useState("")
  const [members, setMembers] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Get current user ID from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUserId(user.id)
      } catch (e) {}
    }

    fetchGroupDetails()
    fetchMessages()

    // Short-polling for messages every 3 seconds
    const intervalId = setInterval(() => {
      fetchMessages(true)
    }, 3000)

    return () => clearInterval(intervalId)
  }, [groupId])

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom()
    }
  }, [messages, isLoading])

  const fetchGroupDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setGroup(data.group)
        setEditGroupName(data.group.name)
        setEditGroupDesc(data.group.description || "")
      } else {
        router.push("/groups")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchMessages = async (silent = false) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch (e) {
      console.error(e)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      userId: currentUserId || "",
      userName: "You",
    }
    
    setMessages(prev => [...prev, tempMessage])
    setNewMessage("")
    setTimeout(scrollToBottom, 100)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: tempMessage.content })
      })
      
      if (res.ok) {
        const data = await res.json()
        // Replace temp message with actual message from server
        setMessages(prev => prev.map(m => m.id === tempId ? data.message : m))
      } else {
        // Remove temp message if failed
        setMessages(prev => prev.filter(m => m.id !== tempId))
      }
    } catch (e) {
      console.error(e)
      setMessages(prev => prev.filter(m => m.id !== tempId))
    }
  }

  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group? All messages will be lost.")) return;
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        router.push("/groups")
      } else {
        alert("Failed to delete group.")
      }
    } catch (e) {
      console.error("Delete error:", e)
    }
  }

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}/members`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members)
      }
    } catch (e) {
      console.error("Fetch members error:", e)
    }
  }

  const handleOpenInfo = () => {
    fetchMembers()
    setShowInfoModal(true)
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this user from the group?")) return
    
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== memberId))
      } else {
        alert("Failed to remove member")
      }
    } catch (e) {
      console.error("Remove member error:", e)
    }
  }

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editGroupName.trim()) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:3001/api/groups/${groupId}`, {
        method: "PUT",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: editGroupName, description: editGroupDesc })
      })
      if (res.ok) {
        const data = await res.json()
        setGroup(data.group)
        setShowEditModal(false)
      } else {
        alert("Failed to update group")
      }
    } catch (e) {
      console.error("Update group error:", e)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading && !group) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-5xl mx-auto border border-zinc-800/60 rounded-xl overflow-hidden bg-zinc-950/50 shadow-2xl relative">
      {/* Chat Header */}
      <div className="h-16 border-b border-zinc-800/60 bg-zinc-900/80 px-4 flex items-center justify-between shrink-0 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 overflow-hidden">
          <Link 
            href="/groups"
            className="p-2 -ml-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 flex items-center justify-center text-white font-medium shrink-0 shadow-inner">
            {group?.name?.substring(0, 2).toUpperCase() || "GR"}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-white font-medium truncate">{group?.name}</h2>
            <span className="text-xs text-zinc-400 truncate">{messages.length} messages</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {group?.creatorId === currentUserId && (
            <button 
              onClick={handleDeleteGroup}
              className="p-2 rounded-full hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition-colors"
              title="Delete Group"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleOpenInfo}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title="Group Info"
          >
            <Info className="w-5 h-5" />
          </button>
          {group?.creatorId === currentUserId && (
            <button 
              onClick={() => setShowEditModal(true)}
              className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Edit Group"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/noise.png')] bg-repeat opacity-[0.99]">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <div className="bg-zinc-900/50 px-4 py-2 rounded-full text-sm mb-2 border border-zinc-800">
              No messages yet
            </div>
            <p className="text-xs">Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMe = message.userId === currentUserId
            const showName = !isMe && (index === 0 || messages[index - 1].userId !== message.userId)
            
            return (
              <div 
                key={message.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
              >
                {showName && (
                  <span className="text-xs text-zinc-500 ml-1 mb-1 font-medium">
                    {message.userName}
                  </span>
                )}
                <div 
                  className={`relative max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm
                    ${isMe 
                      ? 'bg-white text-black rounded-br-sm' 
                      : 'bg-zinc-800 text-zinc-100 rounded-bl-sm border border-zinc-700/50'
                    }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className={`text-[10px] text-right mt-1 opacity-60 ${isMe ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {formatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-zinc-900/80 border-t border-zinc-800/60 backdrop-blur-md shrink-0 z-10">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-end gap-2 bg-zinc-950 border border-zinc-800/80 rounded-xl p-1 shadow-inner focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600 transition-all"
        >
          <textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
            placeholder="Write a message..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none text-white text-sm px-3 py-3 resize-none outline-none focus:ring-0"
            rows={1}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className={`p-3 rounded-lg mb-1 mr-1 transition-all ${
              newMessage.trim() 
                ? 'bg-white text-black hover:bg-zinc-200' 
                : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-center mt-2">
          <span className="text-[10px] text-zinc-600">Press Enter to send, Shift + Enter for new line</span>
        </div>
      </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-white">Group Info</h2>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-zinc-300 text-sm bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                  {group?.description || "No description provided."}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
                  Members ({members.length})
                </h3>
                <div className="space-y-2">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-white font-medium shrink-0 shadow-sm">
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-white truncate flex items-center gap-2">
                            {member.name}
                            {member.role === 'admin' && (
                              <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold">Admin</span>
                            )}
                          </span>
                          <span className="text-xs text-zinc-500 truncate">{member.email}</span>
                        </div>
                      </div>
                      
                      {group?.creatorId === currentUserId && member.id !== currentUserId && (
                        <button 
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                          title="Remove user"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Edit Group Settings</h2>
              <form onSubmit={handleUpdateGroup}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Group Name</label>
                    <input 
                      type="text" 
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                    <textarea 
                      value={editGroupDesc}
                      onChange={(e) => setEditGroupDesc(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-none h-24"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Save Changes
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
