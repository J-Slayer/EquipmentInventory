'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, Search, CalendarDays } from 'lucide-react'
import { StatusChip } from '@/components/StatusChip'
import { formatDate, formatCurrency, getDaysLabel } from '@/lib/utils'
import type { ContractStatus, ContractWithStatus } from '@/lib/types'

const STATUSES: ContractStatus[] = ['Active', 'Expiring soon', 'Expired', 'No end date']

const STATUS_DOT: Record<ContractStatus, string> = {
  Active:          '#2E9E63',
  'Expiring soon': '#C77F1B',
  Expired:         '#D13B30',
  'No end date':   '#9C968B',
}

const STATUS_TEXT_COLOR: Record<ContractStatus, string> = {
  Active:          '#1B7A4B',
  'Expiring soon': '#94560F',
  Expired:         '#A82018',
  'No end date':   '#9C968B',
}

interface Props {
  contracts: ContractWithStatus[]
  onAdd: () => void
  onEdit: (contract: ContractWithStatus) => void
}

export function ContractsList({ contracts, onAdd, onEdit }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ContractStatus | 'All'>('All')

  const counts = useMemo(() => {
    const r = {} as Record<ContractStatus, number>
    for (const s of STATUSES) r[s] = 0
    for (const c of contracts) r[c.status] = (r[c.status] ?? 0) + 1
    return r
  }, [contracts])

  const attentionContracts = useMemo(
    () => contracts.filter((c) => c.status === 'Expiring soon' || c.status === 'Expired'),
    [contracts]
  )

  const totalMonthly = useMemo(() => contracts.reduce((sum, c) => sum + c.monthly_cost, 0), [contracts])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return contracts.filter((c) => {
      if (filter !== 'All' && c.status !== filter) return false
      if (!q) return true
      return [c.name, c.provider, c.account_number, c.type, c.holder].some((f) =>
        f?.toLowerCase().includes(q)
      )
    })
  }, [contracts, search, filter])

  const toggleFilter = (s: ContractStatus) => setFilter((prev) => (prev === s ? 'All' : s))

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-semibold tracking-[-0.015em]" style={{ color: '#1B1A17' }}>
            Contracts
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
            {contracts.length} contract{contracts.length !== 1 ? 's' : ''} · {formatCurrency(totalMonthly)} / mo approx
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[7px] text-[14px] font-semibold text-white shrink-0 transition-colors"
          style={{ backgroundColor: '#C00000' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A30000')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C00000')}
        >
          + Add contract
        </button>
      </div>

      {/* Attention banner */}
      {attentionContracts.length > 0 && (
        <div
          className="rounded-[12px] p-[18px]"
          style={{ backgroundColor: '#FCEFEC', border: '1px solid #F1D5CE' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} style={{ color: '#C00000' }} />
            <span className="text-[14px] font-semibold" style={{ color: '#1B1A17' }}>
              {attentionContracts.length} contract{attentionContracts.length !== 1 ? 's' : ''} need attention
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {attentionContracts.map((c) => {
              const { text: dayLabel } = getDaysLabel(c.days_until)
              return (
                <button
                  key={c.id}
                  onClick={() => onEdit(c)}
                  className="flex items-center justify-between gap-4 bg-white rounded-[9px] px-4 py-3 text-left transition-colors hover:bg-[#F7F5F1]"
                  style={{ border: '1px solid #E3E0D9' }}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="w-[7px] h-[7px] rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: STATUS_DOT[c.status] }}
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate" style={{ color: '#1B1A17' }}>{c.name}</div>
                      <div className="text-[11px]" style={{ color: '#6B6760' }}>
                        {[c.type, c.holder].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[12px] font-medium" style={{ color: '#1B1A17' }}>{formatDate(c.renewal_date)}</div>
                    <div className="text-[11px]" style={{ color: STATUS_TEXT_COLOR[c.status] }}>{dayLabel}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-[14px]">
        {STATUSES.map((s) => {
          const active = filter === s
          return (
            <button
              key={s}
              onClick={() => toggleFilter(s)}
              className="text-left p-[16px] rounded-[11px] bg-white transition-all"
              style={{ border: active ? '1.5px solid #1B1A17' : '1.5px solid #E3E0D9', boxShadow: '0 1px 2px rgba(20,18,15,.04)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-[9px] h-[9px] rounded-full" style={{ backgroundColor: STATUS_DOT[s] }} />
                <span className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono" style={{ color: '#6B6760' }}>{s}</span>
              </div>
              <span className="text-[32px] font-semibold leading-none" style={{ color: '#1B1A17' }}>{counts[s]}</span>
            </button>
          )
        })}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[12px] overflow-hidden" style={{ border: '1px solid #E3E0D9', boxShadow: '0 1px 2px rgba(20,18,15,.04)' }}>
        {/* Filter row */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #F0EEE9' }}>
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#9C968B' }} />
            <input
              type="search"
              placeholder="Search contracts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-[38px] pr-3 py-[9px] text-[14px] rounded-[8px] outline-none"
              style={{ border: '1px solid #D5D0C7' }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(['All', ...STATUSES] as const).map((s) => {
              const active = filter === s
              return (
                <button
                  key={s}
                  onClick={() => (s === 'All' ? setFilter('All') : toggleFilter(s as ContractStatus))}
                  className="px-[12px] py-[8px] rounded-[8px] text-[12px] font-semibold transition-colors"
                  style={{ backgroundColor: active ? '#1B1A17' : '#fff', color: active ? '#fff' : '#6B6760', border: active ? '1px solid #1B1A17' : '1px solid #E3E0D9' }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Table header */}
        <div
          className="grid px-5 py-3"
          style={{ gridTemplateColumns: '2.4fr 1.1fr 0.7fr 1.4fr 1.5fr 1.1fr 52px', gap: '14px', backgroundColor: '#F7F5F1', borderBottom: '1px solid #F0EEE9' }}
        >
          {['Contract', 'Type', 'Data', 'Holder', 'Renewal', 'Status', ''].map((col, i) => (
            <span key={i} className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono" style={{ color: '#9C968B' }}>{col}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-[15px] font-medium" style={{ color: '#1B1A17' }}>No contracts match</p>
            <p className="text-[13px]" style={{ color: '#6B6760' }}>Try adjusting your search or filters.</p>
            {(search || filter !== 'All') && (
              <button onClick={() => { setSearch(''); setFilter('All') }} className="text-[13px] font-semibold mt-1" style={{ color: '#C00000' }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((c) => {
            const { text: dayLabel, urgent } = getDaysLabel(c.days_until)
            const dayColor = urgent ? STATUS_TEXT_COLOR[c.status] : '#9C968B'
            return (
              <div
                key={c.id}
                onClick={() => onEdit(c)}
                className="grid items-center px-5 cursor-pointer transition-colors hover:bg-[#FAFAF8]"
                style={{ gridTemplateColumns: '2.4fr 1.1fr 0.7fr 1.4fr 1.5fr 1.1fr 52px', gap: '14px', paddingTop: '14px', paddingBottom: '14px', borderBottom: '1px solid #F0EEE9' }}
              >
                {/* Contract */}
                <div>
                  <div className="text-[14px] font-semibold" style={{ color: '#1B1A17' }}>{c.name}</div>
                  <div className="text-[12px] font-mono mt-0.5" style={{ color: '#6B6760' }}>
                    {[c.provider, c.account_number].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {/* Type */}
                <span className="text-[13px]" style={{ color: '#6B6760' }}>{c.type ?? '—'}</span>
                {/* Data */}
                <span className="text-[13px] font-mono" style={{ color: c.data_gb ? '#1B1A17' : '#9C968B' }}>
                  {c.data_gb ? `${c.data_gb} GB` : '—'}
                </span>
                {/* Holder */}
                <span className="text-[13px]" style={{ color: '#1B1A17' }}>{c.holder ?? '—'}</span>
                {/* Renewal */}
                <div>
                  <div className="text-[13px] font-medium" style={{ color: '#1B1A17' }}>{c.renewal_date ? formatDate(c.renewal_date) : '—'}</div>
                  {dayLabel && <div className="text-[11px] mt-0.5" style={{ color: dayColor }}>{dayLabel}</div>}
                </div>
                {/* Status */}
                <StatusChip status={c.status} />
                {/* Calendar */}
                <div className="flex justify-end">
                  {c.renewal_date && (
                    <a
                      href={generateCalendarUrl(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center w-[38px] h-[38px] rounded-[8px] transition-colors hover:bg-[#F7F5F1]"
                      style={{ border: '1px solid #E3E0D9', color: '#6B6760' }}
                      aria-label="Add reminder to calendar"
                    >
                      <CalendarDays size={15} />
                    </a>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function generateCalendarUrl(c: ContractWithStatus) {
  const title = encodeURIComponent(`Renew: ${c.name}`)
  const date = (c.renewal_date ?? '').replace(/-/g, '')
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}/${date}`
}
