"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to log in")
      }

      // Successful login
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800/60 p-8 rounded-2xl shadow-xl space-y-6">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {registered && !error && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            Account created successfully! Please log in.
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-zinc-300">Password</Label>
            <Link href="/forgot-password" className="text-xs text-zinc-400 hover:text-white">Forgot password?</Link>
          </div>
          <Input 
            id="password" 
            type="password" 
            className="bg-zinc-900 border-zinc-800 text-white h-11" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium">
          {isLoading ? "Signing In..." : "Sign In"}
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
        <Button variant="outline" type="button" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 h-11 text-zinc-300">
          Google
        </Button>
        <Button variant="outline" type="button" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 h-11 text-zinc-300">
          GitHub
        </Button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to home
      </Link>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Image src="/keo.png" alt="Keo" width={40} height={40} className="rounded-md mx-auto mb-6 shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-zinc-400 text-sm">Enter your credentials to access your workspace</p>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-zinc-500 border-t-white rounded-full animate-spin" /></div>}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-white hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
