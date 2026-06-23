'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EquipmentStatus } from '@/lib/types'

export async function createEquipmentAction(data: {
  asset_tag: string
  name: string
  type?: string
  serial?: string
  status: EquipmentStatus
  make?: string
  model?: string
  value_incl_vat?: number
  location?: string
  purchase_date?: string
  condition?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: created, error } = await supabase
    .from('equipment')
    .insert(data as any)
    .select('register_no')
    .single()
  if (error) return { error: error.message }
  revalidatePath('/equipment')
  revalidatePath('/register')
  return { success: true, register_no: (created as any)?.register_no as string | null }
}

export async function updateEquipmentAction(
  id: string,
  data: Partial<{
    name: string
    type: string
    serial: string
    status: EquipmentStatus
    make: string
    model: string
    value_incl_vat: number
    location: string
    purchase_date: string
    condition: string
    notes: string
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase.from('equipment').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/equipment')
  revalidatePath('/register')
  revalidatePath(`/equipment/${id}`)
  return { success: true }
}

export async function deleteEquipmentAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('equipment').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/equipment')
  revalidatePath('/register')
  return { success: true }
}

export async function assignEquipmentAction(
  equipmentId: string,
  personId: string,
  issueDate: string,
  note: string,
  actor: string
) {
  const supabase = await createClient()

  const { error: eqError } = await supabase
    .from('equipment')
    .update({ status: 'Assigned', assignee_id: personId, issue_date: issueDate })
    .eq('id', equipmentId)

  if (eqError) return { error: eqError.message }

  await supabase.from('assignment_history').insert({
    equipment_id: equipmentId,
    event_type: 'Assigned',
    person_id: personId,
    note,
    actor,
    event_date: issueDate,
  })

  revalidatePath('/equipment')
  revalidatePath(`/equipment/${equipmentId}`)
  return { success: true }
}

export async function checkInEquipmentAction(equipmentId: string, actor: string) {
  const supabase = await createClient()

  const { error: eqError } = await supabase
    .from('equipment')
    .update({ status: 'Available', assignee_id: null, issue_date: null })
    .eq('id', equipmentId)

  if (eqError) return { error: eqError.message }

  await supabase.from('assignment_history').insert({
    equipment_id: equipmentId,
    event_type: 'Checked in',
    note: 'Device returned and checked in.',
    actor,
    event_date: new Date().toISOString().split('T')[0],
  })

  revalidatePath('/equipment')
  revalidatePath(`/equipment/${equipmentId}`)
  return { success: true }
}

export async function changeStatusAction(
  equipmentId: string,
  status: EquipmentStatus,
  actor: string
) {
  const supabase = await createClient()

  const update: Record<string, unknown> = { status }
  if (status !== 'Assigned') {
    update.assignee_id = null
    update.issue_date = null
  }

  const { error } = await supabase.from('equipment').update(update).eq('id', equipmentId)
  if (error) return { error: error.message }

  await supabase.from('assignment_history').insert({
    equipment_id: equipmentId,
    event_type: status,
    actor,
    event_date: new Date().toISOString().split('T')[0],
  })

  revalidatePath('/equipment')
  revalidatePath(`/equipment/${equipmentId}`)
  return { success: true }
}
