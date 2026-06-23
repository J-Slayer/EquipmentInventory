import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import SettingsClient from '@/components/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data } = await admin.auth.admin.listUsers()
  const users = data?.users ?? []

  return (
    <div className="px-8 py-8">
      <h1 className="text-[22px] font-semibold text-[#1B1A17] mb-6">Settings</h1>
      <SettingsClient currentUser={user} users={users} />
    </div>
  )
}
