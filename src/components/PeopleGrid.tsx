'use client'

import { useState, useMemo, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { getInitials, formatDate } from '@/lib/utils'
import { markAsLeftAction, reactivatePersonAction } from '@/app/actions/people'
import type { Person, EquipmentWithAssignee } from '@/lib/types'

type StatusFilter = 'Active' | 'Former' | 'All'

interface Props {
  people: Person[]
  equipment: EquipmentWithAssignee[]
  onAdd: () => void
  onEdit: (person: Person) => void
}

export function PeopleGrid({ people, equipment, onAdd, onEdit }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Active')
  const [revealedIdNums, setRevealedIdNums] = useState<Set<string>>(new Set())
  const [confirmLeftId, setConfirmLeftId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const equipmentByPerson = useMemo(() => {
    const map = new Map<string, EquipmentWithAssignee[]>()
    for (const e of equipment) {
      if (e.assignee_id) {
        if (!map.has(e.assignee_id)) map.set(e.assignee_id, [])
        map.get(e.assignee_id)!.push(e)
      }
    }
    return map
  }, [equipment])

  const activeCount = people.filter((p) => p.employment_status === 'Active').length
  const formerCount = people.filter((p) => p.employment_status === 'Former').length

  const filtered = useMemo(() => {
    let result = people
    if (statusFilter !== 'All') result = result.filter((p) => p.employment_status === statusFilter)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.department ?? '').toLowerCase().includes(q) ||
          (p.job_title ?? '').toLowerCase().includes(q) ||
          (p.email ?? '').toLowerCase().includes(q) ||
          (p.employee_no ?? '').toLowerCase().includes(q)
      )
    }
    return result
  }, [people, statusFilter, search])

  function toggleIdReveal(id: string) {
    setRevealedIdNums((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleMarkLeft(person: Person) {
    const holds = equipmentByPerson.get(person.id) ?? []
    if (holds.length > 0) {
      setConfirmLeftId(person.id)
    } else {
      startTransition(async () => {
        await markAsLeftAction(person.id)
        router.refresh()
      })
    }
  }

  function handleReactivate(person: Person) {
    startTransition(async () => {
      await reactivatePersonAction(person.id)
      router.refresh()
    })
  }

  const filterCounts: Record<StatusFilter, number> = {
    Active: activeCount,
    Former: formerCount,
    All: people.length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[27px] font-semibold tracking-[-0.015em]" style={{ color: '#1B1A17' }}>
            People
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
            <strong style={{ color: '#1B1A17' }}>{activeCount}</strong> active ·{' '}
            <strong style={{ color: '#1B1A17' }}>{formerCount}</strong> former
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-[18px] py-[10px] rounded-[7px] text-[14px] font-semibold text-white shrink-0 transition-colors"
          style={{ backgroundColor: '#C00000' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#A30000')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#C00000')}
        >
          + Add person
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status filter */}
        <div className="flex items-center gap-1">
          {(['Active', 'Former', 'All'] as StatusFilter[]).map((s) => {
            const active = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="px-3 py-[7px] rounded-[7px] text-[13px] font-semibold transition-colors"
                style={
                  active
                    ? { backgroundColor: '#1B1A17', color: '#fff' }
                    : { backgroundColor: '#fff', color: '#6B6760', border: '1px solid #E3E0D9' }
                }
              >
                {s}
                <span
                  className="ml-1.5 text-[11px] font-mono"
                  style={{ color: active ? '#B5B2AA' : '#9C968B' }}
                >
                  {filterCounts[s]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="relative max-w-sm flex-1">
          <input
            type="search"
            placeholder="Search people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-[9px] text-[14px] rounded-[8px] outline-none bg-white"
            style={{ border: '1px solid #D5D0C7' }}
          />
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16 }}>
        {filtered.map((person) => {
          const personEquip = equipmentByPerson.get(person.id) ?? []
          const isFormer = person.employment_status === 'Former'
          const idRevealed = revealedIdNums.has(person.id)
          const isConfirmingLeft = confirmLeftId === person.id

          return (
            <div
              key={person.id}
              className="bg-white rounded-[12px] flex flex-col"
              style={{
                border: '1px solid #E3E0D9',
                boxShadow: '0 1px 2px rgba(20,18,15,.04)',
                opacity: isFormer ? 0.85 : 1,
              }}
            >
              <div className="p-5 flex flex-col gap-0 flex-1">
                {/* Header: avatar + name + badge */}
                <div className="flex items-center gap-3 mb-4">
                  <Link href={`/people/${person.id}`} className="shrink-0" tabIndex={-1} aria-hidden>
                    <span
                      className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white text-[16px] font-bold"
                      style={{ backgroundColor: isFormer ? '#9C968B' : '#1B1A17' }}
                    >
                      {getInitials(person.name)}
                    </span>
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/people/${person.id}`}
                        className="text-[16px] font-semibold leading-tight truncate hover:underline"
                        style={{ color: '#1B1A17' }}
                      >
                        {person.name}
                      </Link>
                      <StatusBadge status={person.employment_status} />
                    </div>
                    <div className="text-[12px] mt-0.5 truncate" style={{ color: '#6B6760' }}>
                      {[person.job_title, person.department].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                </div>

                {/* Email */}
                {person.email && (
                  <div className="flex items-center gap-2 mb-3">
                    <Mail size={13} style={{ color: '#9C968B' }} className="shrink-0" />
                    <a
                      href={`mailto:${person.email}`}
                      className="text-[12px] font-mono truncate hover:underline"
                      style={{ color: '#6B6760' }}
                    >
                      {person.email}
                    </a>
                  </div>
                )}

                {/* Employee no. + ID number */}
                {(person.employee_no || person.id_number) && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {person.employee_no && (
                      <div>
                        <div
                          className="text-[10px] font-semibold uppercase tracking-[.08em] font-mono mb-0.5"
                          style={{ color: '#9C968B' }}
                        >
                          Emp. no.
                        </div>
                        <div className="text-[12px] font-mono font-medium" style={{ color: '#1B1A17' }}>
                          {person.employee_no}
                        </div>
                      </div>
                    )}
                    {person.id_number && (
                      <div>
                        <div
                          className="text-[10px] font-semibold uppercase tracking-[.08em] font-mono mb-0.5"
                          style={{ color: '#9C968B' }}
                        >
                          ID number
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-mono font-medium" style={{ color: '#1B1A17' }}>
                            {idRevealed ? person.id_number : '•••••••••••••'}
                          </span>
                          <button
                            onClick={() => toggleIdReveal(person.id)}
                            className="shrink-0"
                            style={{ color: '#9C968B' }}
                            title={idRevealed ? 'Hide ID' : 'Show ID'}
                          >
                            {idRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Left date for former employees */}
                {isFormer && person.left_date && (
                  <div className="text-[11px] font-mono mb-3" style={{ color: '#9C968B' }}>
                    Left {formatDate(person.left_date)}
                  </div>
                )}

                {/* Divider */}
                <div className="mb-3" style={{ borderTop: '1px solid #F0EEE9' }} />

                {/* Equipment */}
                <div className="flex-1">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono mb-2"
                    style={{ color: '#9C968B' }}
                  >
                    Equipment · {personEquip.length}
                  </div>
                  {personEquip.length === 0 ? (
                    <div
                      className="flex items-center justify-center py-3 rounded-[8px] text-[13px]"
                      style={{ border: '1.5px dashed #E3E0D9', color: '#9C968B' }}
                    >
                      No equipment assigned
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {personEquip.map((e) => (
                        <Link
                          key={e.id}
                          href={`/equipment/${e.id}`}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[12px] transition-colors hover:bg-[#F7F5F1]"
                          style={{ border: '1px solid #E3E0D9' }}
                        >
                          <span className="font-mono font-medium" style={{ color: '#C00000' }}>
                            {e.asset_tag}
                          </span>
                          <span style={{ color: '#6B6760' }}>{e.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card footer */}
              {isConfirmingLeft ? (
                <div
                  className="px-5 py-4 rounded-b-[12px]"
                  style={{ backgroundColor: '#FFFBF0', borderTop: '1px solid #F0EEE9' }}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle size={14} className="shrink-0 mt-[1px]" style={{ color: '#B45309' }} />
                    <p className="text-[12px]" style={{ color: '#6B6760' }}>
                      <strong style={{ color: '#1B1A17' }}>{person.name}</strong> still holds{' '}
                      <strong style={{ color: '#C00000' }}>{personEquip.length}</strong>{' '}
                      {personEquip.length === 1 ? 'item' : 'items'}. Consider reassigning before marking as left.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmLeftId(null)
                        startTransition(async () => {
                          await markAsLeftAction(person.id)
                          router.refresh()
                        })
                      }}
                      disabled={isPending}
                      className="flex-1 py-2 rounded-[7px] text-[13px] font-semibold"
                      style={{ backgroundColor: '#C00000', color: '#fff' }}
                    >
                      Mark as left anyway
                    </button>
                    <button
                      onClick={() => setConfirmLeftId(null)}
                      className="flex-1 py-2 rounded-[7px] text-[13px] font-medium"
                      style={{ border: '1px solid #E3E0D9', color: '#6B6760' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex gap-2 px-5 py-4 rounded-b-[12px]"
                  style={{ borderTop: '1px solid #F0EEE9' }}
                >
                  <button
                    onClick={() => onEdit(person)}
                    className="flex-1 py-2 rounded-[7px] text-[13px] font-medium transition-colors"
                    style={{ border: '1px solid #E3E0D9', color: '#6B6760' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5F1')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                  >
                    Edit
                  </button>
                  {isFormer ? (
                    <button
                      onClick={() => handleReactivate(person)}
                      disabled={isPending}
                      className="flex-1 py-2 rounded-[7px] text-[13px] font-medium transition-colors"
                      style={{ border: '1px solid #E3E0D9', color: '#1B7A4B' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0FAF4')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkLeft(person)}
                      disabled={isPending}
                      className="flex-1 py-2 rounded-[7px] text-[13px] font-medium transition-colors"
                      style={{ border: '1px solid #E3E0D9', color: '#6B6760' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5F1')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                    >
                      Mark as left
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-[15px] font-medium" style={{ color: '#1B1A17' }}>
              {search ? 'No people found' : statusFilter === 'Former' ? 'No former employees' : 'No active employees'}
            </p>
            <p className="text-[13px]" style={{ color: '#6B6760' }}>
              {search ? 'Try adjusting your search.' : 'Add a person to get started.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'Active' | 'Former' }) {
  const isActive = status === 'Active'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={
        isActive
          ? { backgroundColor: '#E4F2EA', color: '#1B7A4B' }
          : { backgroundColor: '#ECEAE4', color: '#6B6760' }
      }
    >
      <span
        className="w-[6px] h-[6px] rounded-full shrink-0"
        style={{ backgroundColor: isActive ? '#2E9E63' : '#9C968B' }}
      />
      {status}
    </span>
  )
}
