'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { changeStatusAction } from '@/app/actions/equipment'
import type { EquipmentStatus } from '@/lib/types'

const STATUSES: EquipmentStatus[] = ['Available', 'Assigned', 'In repair', 'Retired']

const STATUS_COLORS: Record<EquipmentStatus, { text: string; bg: string }> = {
  Available:   { text: '#1B7A4B', bg: '#E4F2EA' },
  Assigned:    { text: '#295A99', bg: '#E7EEF8' },
  'In repair': { text: '#94560F', bg: '#F7ECD9' },
  Retired:     { text: '#6B6760', bg: '#ECEAE4' },
}

interface Props {
  equipmentId: string
  currentStatus: EquipmentStatus
}

export function ChangeStatusCard({ equipmentId, currentStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(status: EquipmentStatus) {
    if (status === currentStatus || status === 'Assigned') return
    startTransition(async () => {
      await changeStatusAction(equipmentId, status, 'Admin')
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-[12px] overflow-hidden" style={{ border: '1px solid #E3E0D9' }}>
      <div className="px-5 py-3" style={{ backgroundColor: '#F7F5F1', borderBottom: '1px solid #F0EEE9' }}>
        <span className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono" style={{ color: '#9C968B' }}>
          Change status
        </span>
      </div>
      <div className="px-5 py-4 flex gap-2 flex-wrap">
        {STATUSES.map((s) => {
          const isActive = s === currentStatus
          const colors = STATUS_COLORS[s]
          return (
            <button
              key={s}
              onClick={() => handleChange(s)}
              disabled={isPending || s === 'Assigned'}
              title={s === 'Assigned' ? 'Use the Assign button to assign a device' : undefined}
              className="px-3 py-2 rounded-[7px] text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={
                isActive
                  ? { backgroundColor: colors.bg, color: colors.text, border: `1.5px solid ${colors.text}` }
                  : { backgroundColor: '#fff', color: '#6B6760', border: '1px solid #E3E0D9' }
              }
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}
