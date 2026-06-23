'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPersonAction(data: {
  name: string
  job_title?: string
  department?: string
  email?: string
  employee_no?: string
  id_number?: string
  employment_status?: 'Active' | 'Former'
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('people').insert({
    ...data,
    employment_status: data.employment_status ?? 'Active',
  })
  if (error) return { error: error.message }
  revalidatePath('/people')
  return { success: true }
}

export async function updatePersonAction(
  id: string,
  data: Partial<{
    name: string
    job_title: string
    department: string
    email: string
    employee_no: string
    id_number: string
    employment_status: 'Active' | 'Former'
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('people').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/people')
  return { success: true }
}

export async function markAsLeftAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('people')
    .update({
      employment_status: 'Former',
      left_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/people')
  return { success: true }
}

export async function reactivatePersonAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('people')
    .update({ employment_status: 'Active', left_date: null })
    .eq('id', id)
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
