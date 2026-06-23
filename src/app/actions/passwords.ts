'use server'

import { createClient } from '@/lib/supabase/server'
import { encryptPassword, decryptPassword } from '@/lib/encrypt'
import { revalidatePath } from 'next/cache'

async function getActor(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email ?? 'unknown'
}

async function logAudit(actor: string, action: string, credKind: string, credId: string) {
  const supabase = await createClient()
  await supabase
    .from('credential_audit')
    .insert({ actor, action, cred_kind: credKind, cred_id: credId })
}

export async function revealPasswordAction(
  id: string,
  kind: 'system_login' | 'shared_account'
): Promise<{ password?: string; error?: string }> {
  const supabase = await createClient()
  const actor = await getActor()
  const table = kind === 'system_login' ? 'system_logins' : 'shared_accounts'

  const { data, error } = await supabase
    .from(table)
    .select('password_enc')
    .eq('id', id)
    .single()

  if (error || !data) return { error: 'Not found' }

  try {
    const plain = decryptPassword((data as { password_enc: string }).password_enc)
    await logAudit(actor, 'reveal', kind, id)
    return { password: plain }
  } catch {
    return { error: 'Decryption failed' }
  }
}

export async function createLoginAction(data: {
  system_id: string
  first_name: string
  surname?: string
  username?: string
  password: string
}) {
  const supabase = await createClient()
  const actor = await getActor()

  const username =
    data.username ||
    `${data.first_name.toLowerCase()}.${(data.surname ?? '').toLowerCase()}@terrastrata.co.za`

  const { data: created, error } = await supabase
    .from('system_logins')
    .insert({
      system_id: data.system_id,
      first_name: data.first_name,
      surname: data.surname || null,
      username,
      password_enc: encryptPassword(data.password),
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  await logAudit(actor, 'create', 'system_login', (created as { id: string }).id)
  revalidatePath('/passwords')
  return { success: true }
}

export async function updateLoginAction(
  id: string,
  data: { first_name?: string; surname?: string; username?: string; password?: string }
) {
  const supabase = await createClient()
  const actor = await getActor()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.first_name !== undefined) update.first_name = data.first_name
  if (data.surname !== undefined) update.surname = data.surname
  if (data.username !== undefined) update.username = data.username
  if (data.password) update.password_enc = encryptPassword(data.password)

  const { error } = await supabase.from('system_logins').update(update).eq('id', id)
  if (error) return { error: error.message }

  await logAudit(actor, 'update', 'system_login', id)
  revalidatePath('/passwords')
  return { success: true }
}

export async function deleteLoginAction(id: string) {
  const supabase = await createClient()
  const actor = await getActor()
  await logAudit(actor, 'delete', 'system_login', id)
  const { error } = await supabase.from('system_logins').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/passwords')
  return { success: true }
}

export async function createAccountAction(data: {
  service: string
  category?: string
  username?: string
  password: string
  url?: string
  owner?: string
  notes?: string
}) {
  const supabase = await createClient()
  const actor = await getActor()

  const { data: created, error } = await supabase
    .from('shared_accounts')
    .insert({
      service: data.service,
      category: data.category || null,
      username: data.username || null,
      password_enc: encryptPassword(data.password),
      url: data.url || null,
      owner: data.owner || null,
      notes: data.notes || null,
    })
    .select('id')
    .single()

  if (error) return { error: error.message }
  await logAudit(actor, 'create', 'shared_account', (created as { id: string }).id)
  revalidatePath('/passwords')
  return { success: true }
}

export async function updateAccountAction(
  id: string,
  data: {
    service?: string
    category?: string
    username?: string
    password?: string
    url?: string
    owner?: string
    notes?: string
  }
) {
  const supabase = await createClient()
  const actor = await getActor()

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.service !== undefined) update.service = data.service
  if (data.category !== undefined) update.category = data.category
  if (data.username !== undefined) update.username = data.username
  if (data.password) update.password_enc = encryptPassword(data.password)
  if (data.url !== undefined) update.url = data.url
  if (data.owner !== undefined) update.owner = data.owner
  if (data.notes !== undefined) update.notes = data.notes

  const { error } = await supabase.from('shared_accounts').update(update).eq('id', id)
  if (error) return { error: error.message }

  await logAudit(actor, 'update', 'shared_account', id)
  revalidatePath('/passwords')
  return { success: true }
}

export async function deleteAccountAction(id: string) {
  const supabase = await createClient()
  const actor = await getActor()
  await logAudit(actor, 'delete', 'shared_account', id)
  const { error } = await supabase.from('shared_accounts').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/passwords')
  return { success: true }
}
