'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const registered = searchParams.get('registered')
  const authError = searchParams.get('error')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError(
          error.message.includes('Email not confirmed')
            ? 'Please confirm your email first — check your inbox for the confirmation link.'
            : error.message
        )
        setLoading(false)
        return
      }

      if (!data.session) {
        setError('Login failed — no session returned. Please check your credentials.')
        setLoading(false)
        return
      }

      // Hard navigation guarantees cookies are sent fresh to the server
      window.location.href = '/dashboard'

    } catch (err) {
      console.error('Login error:', err)
      setError('Network error — could not reach the authentication server. Check your connection.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 text-sm mt-1">Sign in to continue planning your move</p>
      </div>

      {registered === 'true' && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          ✅ Account created! Check your email to confirm, then sign in.
        </div>
      )}

      {registered === 'confirmed' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          ✅ Email confirmed! You can now sign in.
        </div>
      )}

      {authError && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          ⚠️ Something went wrong. Please try again.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="input pl-10"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="input pl-10"
              autoComplete="current-password"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Sign In <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 font-medium hover:underline">
          Create one
        </Link>
      </p>
    </>
  )
}
