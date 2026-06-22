'use client'

import { useState } from 'react'
import { EquipmentList } from '@/components/EquipmentList'
import { EquipmentModal } from '@/components/modals/EquipmentModal'
import type { EquipmentWithAssignee } from '@/lib/types'

interface Props {
  equipment: EquipmentWithAssignee[]
}

export function EquipmentModalWrapper({ equipment }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <EquipmentList equipment={equipment} onAdd={() => setModalOpen(true)} />
      {modalOpen && <EquipmentModal onClose={() => setModalOpen(false)} />}
    </>
  )
}
