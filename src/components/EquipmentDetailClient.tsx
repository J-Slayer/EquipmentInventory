'use client'

import { useState, useTransition } from 'react'
import { checkInEquipmentAction, deleteEquipmentAction } from '@/app/actions/equipment'
import { Button } from '@/components/ui/Button'
import { EquipmentModal } from '@/components/modals/EquipmentModal'
import { AssignModal } from '@/components/modals/AssignModal'
import { useRouter } from 'next/navigation'
import type { EquipmentWithAssignee } from '@/lib/types'

interface Props {
  equipment: EquipmentWithAssignee
}

export function EquipmentDetailClient({ equipment: eq }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<'edit' | 'assign' | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCheckIn() {
    startTransition(async () => {
      await checkInEquipmentAction(eq.id, 'Admin')
      router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`Delete ${eq.name}? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteEquipmentAction(eq.id)
      router.push('/equipment')
    })
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap shrink-0">
        {eq.status !== 'Assigned' && (
          <Button onClick={() => setModal('assign')}>Assign</Button>
        )}
        {eq.status === 'Assigned' && (
          <Button variant="secondary" onClick={handleCheckIn} disabled={isPending}>
            Check in
          </Button>
        )}
        <Button variant="secondary" onClick={() => setModal('edit')}>Edit</Button>
        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>Delete</Button>
      </div>

      {modal === 'edit' && (
        <EquipmentModal equipment={eq} onClose={() => { setModal(null); router.refresh() }} />
      )}
      {modal === 'assign' && (
        <AssignModal equipment={eq} onClose={() => { setModal(null); router.refresh() }} />
      )}
    </>
  )
}
