'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createContractAction(data: {
  name: string
  type?: string
  provider?: string
  account_number?: string
  monthly_cost: number
  data_gb?: number
  start_date?: string
  renewal_date?: string
  holder?: string
  holder_id?: string
  linked_equipment_id?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('contracts').insert(data)
  if (error) return { error: error.message }
  revalidatePath('/contracts')
  return { success: true }
}

export async function updateContractAction(
  id: string,
  data: Partial<{
    name: string
    type: string
    provider: string
    account_number: string
    monthly_cost: number
    data_gb: number | null
    start_date: string
    renewal_date: string | null
    holder: string
    holder_id: string | null
    linked_equipment_id: string | null
    notes: string
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('contracts').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/contracts')
  return { success: true }
}

export async function deleteContractAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contracts').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/contracts')
  return { success: true }
}
