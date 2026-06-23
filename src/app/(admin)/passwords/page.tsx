import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PasswordsClient } from '@/components/PasswordsClient'
import type { PasswordSystem, LoginRow, SharedAccountRow } from '@/lib/types'

export default async function PasswordsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: systems }, { data: logins }, { data: accounts }] = await Promise.all([
    supabase.from('password_systems').select('*').order('sort_order'),
    supabase
      .from('system_logins')
      .select('id, system_id, first_name, surname, username, updated_at')
      .order('first_name'),
    supabase
      .from('shared_accounts')
      .select('id, service, category, username, url, owner, notes, updated_at')
      .order('service'),
  ])

  return (
    <PasswordsClient
      systems={(systems ?? []) as PasswordSystem[]}
      logins={(logins ?? []) as LoginRow[]}
      accounts={(accounts ?? []) as SharedAccountRow[]}
    />
  )
}
