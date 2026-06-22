import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { getInitials } from '@/lib/utils'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Count contracts needing attention for the nav badge
  const { data: attentionContracts } = await supabase
    .from('contracts_with_status')
    .select('status')
    .in('status', ['Expiring soon', 'Expired'])

  const contractsBadge = attentionContracts?.length ?? 0

  const adminInitials = user.email
    ? getInitials(user.email.split('@')[0].replace(/[._]/g, ' '))
    : 'AD'

  return (
    <AppShell contractsBadge={contractsBadge} adminInitials={adminInitials}>
      {children}
    </AppShell>
  )
}
