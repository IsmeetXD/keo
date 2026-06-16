"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up")
      }

      // Successful signup
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Image src="/keo.png" alt="Keo" width={40} height={40} className="rounded-md mx-auto mb-6 shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-zinc-400 text-sm">Join forward-thinking teams using Keo</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800/60 p-8 rounded-2xl shadow-xl space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
              <Input 
                id="name" 
                type="text" 
                placeholder="John Doe" 
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 h-11" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 h-11" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="bg-zinc-900 border-zinc-800 text-white h-11" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium mt-2">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 h-11 text-zinc-300">
              Google
            </Button>
            <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 h-11 text-zinc-300">
              GitHub
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
