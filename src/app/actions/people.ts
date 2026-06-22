'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPersonAction(data: {
  name: string
  job_title?: string
  department?: string
  email?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('people').insert(data)
  if (error) return { error: error.message }
  revalidatePath('/people')
  return { success: true }
}

export async function updatePersonAction(
  id: string,
  data: Partial<{ name: string; job_title: string; department: string; email: string }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('people').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/people')
  return { success: true }
}

export async function deletePersonAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('people').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/people')
  return { success: true }
}
