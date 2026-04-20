'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  if (!email || !password || !role) {
    return { error: 'Please fill out all fields.' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Fetch role from profiles table (more reliable if users are created manually)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const userRole = profile?.role || data.user.user_metadata?.role || 'employee'
  
  if (userRole !== role) {
    // If they try to log in as a role they aren't, log them out and show error
    await supabase.auth.signOut()
    return { error: `You are not authorized as a ${role}.` }
  }

  redirect(`/${role}`)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
