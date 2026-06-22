import { createClient } from '@/lib/supabase/server'
import { EquipmentList } from '@/components/EquipmentList'
import { EquipmentModalWrapper } from '@/components/modals/EquipmentModalWrapper'
import type { EquipmentWithAssignee } from '@/lib/types'

export default async function EquipmentPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('equipment')
    .select('*, assignee:people(*)')
    .order('created_at', { ascending: false })

  const equipment = (data ?? []) as unknown as EquipmentWithAssignee[]

  return <EquipmentModalWrapper equipment={equipment} />
}
