'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, User, ArrowRight, Loader2, MailCheck } from 'lucide-react'

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('full_name') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName },
        },
      })

      if (error) {
        setError(
          error.message.toLowerCase().includes('email')
            ? 'Could not send confirmation email — Supabase free tier allows 3 emails/hour. Wait an hour or disable "Confirm email" in your Supabase Auth settings.'
            : error.message
        )
        setLoading(false)
        return
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
        })
      }

      if (data.session) {
        window.location.href = '/dashboard'
      } else {
        setEmailSent(true)
        setLoading(false)
      }
    } catch (err) {
      console.error('Register error:', err)
      setError('Network error — could not reach the authentication server.')
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MailCheck className="w-7 h-7 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-500 text-sm mb-6">
          We sent a confirmation link to your email address. Click it to activate your account, then come back to sign in.
        </p>
        <Link href="/login" className="btn-primary inline-flex items-center gap-2">
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-slate-500 text-sm mt-1">Start planning your perfect move</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="full_name">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              placeholder="Jane Smith"
              className="input pl-10"
              autoComplete="name"
            />
          </div>
        </div>

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
              minLength={8}
              placeholder="Min. 8 characters"
              className="input pl-10"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="confirm_password">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              placeholder="••••••••"
              className="input pl-10"
              autoComplete="new-password"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Create Account <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
