'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addUserAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function deleteUserAction(userId: string) {
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function changePasswordAction(formData: FormData) {
  const password = formData.get('password') as string
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}
