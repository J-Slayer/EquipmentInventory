'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PeopleGrid } from '@/components/PeopleGrid'
import { PersonModal } from '@/components/modals/PersonModal'
import type { Person, EquipmentWithAssignee } from '@/lib/types'

interface Props {
  people: Person[]
  equipment: EquipmentWithAssignee[]
}

export function PeoplePageClient({ people, equipment }: Props) {
  const router = useRouter()
  const [editPerson, setEditPerson] = useState<Person | null>(null)
  const [adding, setAdding] = useState(false)

  function handleClose() {
    setAdding(false)
    setEditPerson(null)
    router.refresh()
  }

  return (
    <>
      <PeopleGrid
        people={people}
        equipment={equipment}
        onAdd={() => setAdding(true)}
        onEdit={(p) => setEditPerson(p)}
      />
      {(adding || editPerson) && (
        <PersonModal person={editPerson ?? undefined} onClose={handleClose} />
      )}
    </>
  )
}
