import { createClient } from '@/lib/supabase/server'
import { PeoplePageClient } from '@/components/PeoplePageClient'
import type { EquipmentWithAssignee, Person } from '@/lib/types'

export default async function PeoplePage() {
  const supabase = await createClient()

  const [{ data: people }, { data: equipment }] = await Promise.all([
    supabase.from('people').select('*').order('name'),
    supabase.from('equipment').select('*, assignee:people(*)').eq('status', 'Assigned'),
  ])

  return (
    <PeoplePageClient
      people={(people ?? []) as Person[]}
      equipment={(equipment ?? []) as unknown as EquipmentWithAssignee[]}
    />
  )
}
