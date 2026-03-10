'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Return success — let the client component handle navigation so that
  // the Set-Cookie headers from signInWithPassword are flushed to the browser
  // before the redirect occurs (fixes session-not-persisting bug with @supabase/ssr).
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function register(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
      data: { full_name: fullName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
    })
  }

  // If session exists, email confirmation is disabled — user is auto-logged in.
  const emailConfirmRequired = !data.session

  revalidatePath('/', 'layout')
  return { success: true, emailConfirmRequired }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const target_move_date = formData.get('target_move_date') as string
  const origin_address = formData.get('origin_address') as string
  const destination_address = formData.get('destination_address') as string
  const full_name = formData.get('full_name') as string

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name,
    target_move_date: target_move_date || null,
    origin_address: origin_address || null,
    destination_address: destination_address || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
