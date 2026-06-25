'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const remember = formData.get('remember_me') === 'on'

  let supabase
  try {
    supabase = await createClient()
  } catch {
    return { error: 'Could not connect. Please check your connection and try again.' }
  }

  let signInError
  try {
    const result = await supabase.auth.signInWithPassword({ email, password })
    signInError = result.error
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }

  if (signInError) {
    const msg =
      signInError.message.toLowerCase().includes('invalid login') ||
      signInError.message.toLowerCase().includes('invalid credentials') ||
      signInError.message.toLowerCase().includes('email not confirmed')
        ? 'Incorrect email or password. Please try again.'
        : signInError.message
    return { error: msg }
  }

  // If "keep me signed in" is unchecked, convert Supabase auth cookies to session cookies
  if (!remember) {
    const cookieStore = await cookies()
    for (const { name, value } of cookieStore.getAll()) {
      if (name.startsWith('sb-')) {
        cookieStore.set(name, value, { path: '/', httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
      }
    }
  }

  redirect('/equipment')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}
