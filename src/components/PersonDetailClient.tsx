'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PersonModal } from '@/components/modals/PersonModal'
import type { Person } from '@/lib/types'

interface Props {
  person: Person
}

export function PersonDetailClient({ person }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)

  function handleClose() {
    setEditing(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[7px] text-[14px] font-semibold transition-colors shrink-0"
        style={{ backgroundColor: '#fff', color: '#1B1A17', border: '1px solid #D5D0C7' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5F1')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
      >
        Edit
      </button>
      {editing && <PersonModal person={person} onClose={handleClose} />}
    </>
  )
}
