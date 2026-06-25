'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { StatusChip } from '@/components/StatusChip'
import type { EquipmentStatus, EquipmentWithAssignee } from '@/lib/types'
import { getInitials } from '@/lib/utils'

const STATUSES: EquipmentStatus[] = ['Available', 'Assigned', 'In repair', 'Retired']

const STATUS_DOT: Record<EquipmentStatus, string> = {
  Available: '#2E9E63',
  Assigned: '#3B72C0',
  'In repair': '#C77F1B',
  Retired: '#9C968B',
}

// Type icons (emoji-free, just a coloured dot per category)
const TYPE_ORDER = [
  'Laptop', 'Desktop', 'Tablet', 'Monitor', 'Printer',
  'Mobile', 'Wi-Fi router', 'Plotter', 'Other',
]

interface Props {
  equipment: EquipmentWithAssignee[]
  onAdd: () => void
}

export function EquipmentList({ equipment, onAdd }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'All'>('All')
  const [typeFilter, setTypeFilter] = useState<string | 'All'>('All')

  // Build type list from actual data, ordered by TYPE_ORDER then alphabetically
  const typeEntries = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of equipment) {
      const t = e.type ?? 'Other'
      counts[t] = (counts[t] ?? 0) + 1
    }
    const types = Object.keys(counts)
    types.sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a)
      const bi = TYPE_ORDER.indexOf(b)
      if (ai !== -1 && bi !== -1) return ai - bi
      if (ai !== -1) return -1
      if (bi !== -1) return 1
      return a.localeCompare(b)
    })
    return types.map((t) => ({ type: t, count: counts[t] }))
  }, [equipment])

  const statusCounts = useMemo(() => {
    const result = {} as Record<EquipmentStatus, number>
    for (const s of STATUSES) result[s] = 0
    for (const e of equipment) {
      if (typeFilter !== 'All' && (e.type ?? 'Other') !== typeFilter) continue
      result[e.status] = (result[e.status] ?? 0) + 1
    }
    return result
  }, [equipment, typeFilter])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return equipment.filter((e) => {
      if (typeFilter !== 'All' && (e.type ?? 'Other') !== typeFilter) return false
      if (statusFilter !== 'All' && e.status !== statusFilter) return false
      if (!q) return true
      return [e.name, e.asset_tag, e.serial, e.type, e.assignee?.name].some((f) =>
        f?.toLowerCase().includes(q)
      )
    })
  }, [equipment, search, statusFilter, typeFilter])

  const toggleStatus = (s: EquipmentStatus) =>
    setStatusFilter((prev) => (prev === s ? 'All' : s))

  const typeTotal = typeFilter === 'All'
    ? equipment.length
    : (typeEntries.find((t) => t.type === typeFilter)?.count ?? 0)

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-semibold tracking-[-0.015em]" style={{ color: '#1B1A17' }}>
            Equipment
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
            {equipment.length} asset{equipment.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[7px] text-[14px] font-semibold text-white shrink-0"
          style={{ backgroundColor: '#C00000' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A30000')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C00000')}
        >
          + Add equipment
        </button>
      </div>

      {/* Two-column layout: sidebar + main */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '220px minmax(0,1fr)' }}>

        {/* ── Type sidebar ── */}
        <div className="flex flex-col gap-1.5">
          {/* All */}
          <button
            onClick={() => setTypeFilter('All')}
            className="flex items-center justify-between px-4 py-[11px] rounded-[10px] text-left transition-colors"
            style={
              typeFilter === 'All'
                ? { backgroundColor: '#1B1A17', color: '#fff' }
                : { backgroundColor: '#fff', color: '#1B1A17', border: '1px solid #E8E5DE' }
            }
          >
            <span className="text-[14px] font-semibold">All equipment</span>
            <span
              className="text-[12px] font-mono font-semibold ml-3 shrink-0"
              style={{ color: typeFilter === 'All' ? '#B5B2AA' : '#9C968B' }}
            >
              {equipment.length}
            </span>
          </button>

          {/* Divider */}
          {typeEntries.length > 0 && (
            <div className="my-1" style={{ borderTop: '1px solid #E8E5DE' }} />
          )}

          {/* Per-type entries */}
          {typeEntries.map(({ type, count }) => {
            const active = typeFilter === type
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className="flex items-center justify-between px-4 py-[11px] rounded-[10px] text-left transition-colors"
                style={
                  active
                    ? { backgroundColor: '#1B1A17', color: '#fff' }
                    : { backgroundColor: '#fff', color: '#1B1A17', border: '1px solid #E8E5DE' }
                }
              >
                <span className="text-[14px] font-semibold">{type}</span>
                <span
                  className="text-[12px] font-mono font-semibold ml-3 shrink-0"
                  style={{ color: active ? '#B5B2AA' : '#9C968B' }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-col gap-5">

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-[14px]">
            {STATUSES.map((s) => {
              const active = statusFilter === s
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className="text-left p-[16px] rounded-[11px] bg-white transition-all"
                  style={{
                    border: active ? '1.5px solid #1B1A17' : '1.5px solid #E3E0D9',
                    boxShadow: '0 1px 2px rgba(20,18,15,.04)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-[9px] h-[9px] rounded-full"
                      style={{ backgroundColor: STATUS_DOT[s] }}
                    />
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono"
                      style={{ color: '#6B6760' }}
                    >
                      {s}
                    </span>
                  </div>
                  <span className="text-[32px] font-semibold leading-none" style={{ color: '#1B1A17' }}>
                    {statusCounts[s]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Table card */}
          <div
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ border: '1px solid #E3E0D9', boxShadow: '0 1px 2px rgba(20,18,15,.04)' }}
          >
            {/* Filter row */}
            <div
              className="flex items-center gap-3 px-5 py-4"
              style={{ borderBottom: '1px solid #F0EEE9' }}
            >
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#9C968B' }}
                />
                <input
                  type="search"
                  placeholder="Search by name, tag, serial, assignee…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-[38px] pr-3 py-[9px] text-[14px] rounded-[8px] outline-none transition-colors"
                  style={{ border: '1px solid #D5D0C7', color: '#1B1A17' }}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(['All', ...STATUSES] as const).map((s) => {
                  const active = statusFilter === s
                  return (
                    <button
                      key={s}
                      onClick={() => (s === 'All' ? setStatusFilter('All') : toggleStatus(s as EquipmentStatus))}
                      className="px-[12px] py-[8px] rounded-[8px] text-[12px] font-semibold transition-colors"
                      style={{
                        backgroundColor: active ? '#1B1A17' : '#fff',
                        color: active ? '#fff' : '#6B6760',
                        border: active ? '1px solid #1B1A17' : '1px solid #E3E0D9',
                      }}
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
              style={{
                gridTemplateColumns: '2.6fr 1.4fr 1.5fr 1.2fr 1.5fr',
                gap: '16px',
                backgroundColor: '#F7F5F1',
                borderBottom: '1px solid #F0EEE9',
              }}
            >
              {['Item', 'Type', 'Serial', 'Status', 'Assignee'].map((col) => (
                <span
                  key={col}
                  className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono"
                  style={{ color: '#9C968B' }}
                >
                  {col}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-[15px] font-medium" style={{ color: '#1B1A17' }}>
                  No equipment matches
                </p>
                <p className="text-[13px]" style={{ color: '#6B6760' }}>
                  Try adjusting your search or filters.
                </p>
                {(search || statusFilter !== 'All') && (
                  <button
                    onClick={() => { setSearch(''); setStatusFilter('All') }}
                    className="text-[13px] font-semibold mt-1"
                    style={{ color: '#C00000' }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filtered.map((item) => (
                <Link
                  key={item.id}
                  href={`/equipment/${item.id}`}
                  className="grid items-center px-5 transition-colors hover:bg-[#FAFAF8]"
                  style={{
                    gridTemplateColumns: '2.6fr 1.4fr 1.5fr 1.2fr 1.5fr',
                    gap: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    borderBottom: '1px solid #F0EEE9',
                  }}
                >
                  <div>
                    <div className="text-[14px] font-semibold leading-tight" style={{ color: '#1B1A17' }}>
                      {item.name}
                    </div>
                    <div className="text-[12px] font-medium font-mono mt-0.5" style={{ color: '#C00000' }}>
                      {item.asset_tag}
                    </div>
                  </div>
                  <span className="text-[14px]" style={{ color: '#1B1A17' }}>
                    {item.type ?? '—'}
                  </span>
                  <span className="text-[13px] font-mono" style={{ color: '#6B6760' }}>
                    {item.serial ?? '—'}
                  </span>
                  <StatusChip status={item.status} />
                  {item.assignee ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold shrink-0"
                        style={{ backgroundColor: '#1B1A17' }}
                      >
                        {getInitials(item.assignee.name)}
                      </span>
                      <span className="text-[13px] truncate" style={{ color: '#1B1A17' }}>
                        {item.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[13px]" style={{ color: '#9C968B' }}>—</span>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
