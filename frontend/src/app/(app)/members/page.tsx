"use client"

import { useState, useEffect } from "react"
import { Search, Mail, Calendar, Shield, Users, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await fetch("http://localhost:3001/api/members", {
          headers: { "Authorization": `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setMembers(data.members)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Members</h1>
          <p className="text-zinc-400 text-sm">Manage access and view all organization members.</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Search members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center text-sm text-zinc-500">
          Loading members...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="bg-zinc-950 border-zinc-800/60 p-5 flex flex-col group hover:border-zinc-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 font-semibold text-lg uppercase group-hover:border-zinc-700 group-hover:bg-zinc-800 transition-all">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">{member.name}</h3>
                    <div className="flex items-center text-xs text-zinc-500 mt-0.5">
                      <Mail className="w-3 h-3 mr-1" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <button className="text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/60">
                <div className="flex items-center text-xs text-zinc-500">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  Member
                </div>
                <div className="flex items-center text-xs text-zinc-500">
                  <Calendar className="w-3.5 h-3.5 mr-1.5" />
                  Joined {new Date(member.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full h-32 flex items-center justify-center text-sm text-zinc-500">
              No members found.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
