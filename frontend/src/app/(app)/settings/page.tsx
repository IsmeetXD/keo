"use client"

import { useState, useEffect } from "react"
import { User, Mail, Key } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  const [user, setUser] = useState<{name: string, email: string} | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Profile State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(parsed)
        setName(parsed.name)
        setEmail(parsed.email)
      } catch (e) {
        console.error(e)
      }
    }
    setIsLoading(false)
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    const token = localStorage.getItem('token')
    
    try {
      const res = await fetch("http://localhost:3001/api/auth/profile", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name, email })
      })
      
      if (res.ok) {
        const data = await res.json()
        const updatedUser = { name: data.user.name, email: data.user.email }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        alert("Profile updated successfully!")
      } else {
        const err = await res.json()
        alert(err.error || "Failed to update profile")
      }
    } catch (e) {
      alert("An error occurred")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPassword(true)
    const token = localStorage.getItem('token')
    
    try {
      const res = await fetch("http://localhost:3001/api/auth/password", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      
      if (res.ok) {
        alert("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
      } else {
        const err = await res.json()
        alert(err.error || "Failed to update password")
      }
    } catch (e) {
      alert("An error occurred")
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (isLoading) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Settings</h1>
        <p className="text-zinc-400 text-sm">Manage your account preferences and settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
        <div className="md:col-span-1 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-white bg-zinc-900">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card className="bg-zinc-950 border-zinc-800/60">
            <CardHeader>
              <CardTitle className="text-lg text-white">Profile Information</CardTitle>
              <CardDescription className="text-zinc-400">Update your account's profile information and email address.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-zinc-300">Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    required
                    className="max-w-md bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300">Email</Label>
                  <div className="relative max-w-md">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                      id="email" 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="pl-9 bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={isSavingProfile} className="bg-white text-black hover:bg-zinc-200">
                    {isSavingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800/60">
            <CardHeader>
              <CardTitle className="text-lg text-white">Update Password</CardTitle>
              <CardDescription className="text-zinc-400">Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="text-zinc-300">Current Password</Label>
                  <Input 
                    id="current_password" 
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    className="max-w-md bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-zinc-300">New Password</Label>
                  <Input 
                    id="new_password" 
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="max-w-md bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={isSavingPassword} variant="outline" className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900 hover:text-white">
                    <Key className="w-4 h-4 mr-2" />
                    {isSavingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
