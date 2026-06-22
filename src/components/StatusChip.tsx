import type { EquipmentStatus, ContractStatus } from '@/lib/types'

type Status = EquipmentStatus | ContractStatus

const STATUS_CONFIG: Record<Status, { text: string; bg: string; dot: string }> = {
  Available:       { text: '#1B7A4B', bg: '#E4F2EA', dot: '#2E9E63' },
  Assigned:        { text: '#295A99', bg: '#E7EEF8', dot: '#3B72C0' },
  'In repair':     { text: '#94560F', bg: '#F7ECD9', dot: '#C77F1B' },
  Retired:         { text: '#6B6760', bg: '#ECEAE4', dot: '#9C968B' },
  Active:          { text: '#1B7A4B', bg: '#E4F2EA', dot: '#2E9E63' },
  'Expiring soon': { text: '#94560F', bg: '#F7ECD9', dot: '#C77F1B' },
  Expired:         { text: '#A82018', bg: '#FBEAE8', dot: '#D13B30' },
  'No end date':   { text: '#6B6760', bg: '#ECEAE4', dot: '#9C968B' },
}

export function StatusChip({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['Retired']
  return (
    <span
      style={{ backgroundColor: config.bg, color: config.text }}
      className={`inline-flex items-center gap-[7px] rounded-[6px] font-semibold whitespace-nowrap ${
        size === 'sm' ? 'px-[8px] py-[3px] text-[11px]' : 'px-[10px] py-[4px] text-[12px]'
      }`}
    >
      <span
        style={{ backgroundColor: config.dot }}
        className={`rounded-full shrink-0 ${size === 'sm' ? 'w-[6px] h-[6px]' : 'w-[7px] h-[7px]'}`}
      />
      {status}
    </span>
  )
}
