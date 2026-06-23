import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusChip } from '@/components/StatusChip'
import { PersonDetailClient } from '@/components/PersonDetailClient'
import { IdRevealToggle } from '@/components/IdRevealToggle'
import { getInitials, formatDate } from '@/lib/utils'
import type { Person, Equipment } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

const EVENT_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  Assigned:             { dot: '#3B72C0', bg: '#E7EEF8', text: '#295A99' },
  'Checked in':         { dot: '#2E9E63', bg: '#E4F2EA', text: '#1B7A4B' },
  Available:            { dot: '#2E9E63', bg: '#E4F2EA', text: '#1B7A4B' },
  'In repair':          { dot: '#C77F1B', bg: '#F7ECD9', text: '#94560F' },
  Retired:              { dot: '#9C968B', bg: '#ECEAE4', text: '#6B6760' },
  'Added to inventory': { dot: '#9C968B', bg: '#ECEAE4', text: '#6B6760' },
  Edited:               { dot: '#9C968B', bg: '#ECEAE4', text: '#6B6760' },
}

type HistoryEntry = {
  id: string
  equipment_id: string
  event_type: string
  note: string | null
  actor: string | null
  event_date: string
  created_at: string
  equipment: { id: string; name: string; asset_tag: string } | null
}

export default async function PersonDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: personData }, { data: assignedData }, { data: historyData }] = await Promise.all([
    supabase.from('people').select('*').eq('id', id).single(),
    supabase.from('equipment').select('*').eq('assignee_id', id),
    supabase
      .from('assignment_history')
      .select('*, equipment(id, name, asset_tag)')
      .eq('person_id', id)
      .order('created_at', { ascending: false }),
  ])

  if (!personData) notFound()

  const person = personData as Person
  const currentDevices = (assignedData ?? []) as Equipment[]
  const history = (historyData ?? []) as HistoryEntry[]
  const isFormer = person.employment_status === 'Former'

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]" style={{ color: '#6B6760' }}>
        <Link href="/people" className="hover:underline" style={{ color: '#6B6760' }}>
          ‹ People
        </Link>
        <span>/</span>
        <span className="font-medium" style={{ color: '#1B1A17' }}>{person.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <span
            className="inline-flex items-center justify-center w-[62px] h-[62px] rounded-full text-white text-[22px] font-bold shrink-0"
            style={{ backgroundColor: isFormer ? '#9C968B' : '#1B1A17' }}
          >
            {getInitials(person.name)}
          </span>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-[27px] font-semibold tracking-[-0.015em]"
                style={{ color: '#1B1A17' }}
              >
                {person.name}
              </h1>
              <StatusBadge status={person.employment_status} />
              {isFormer && person.left_date && (
                <span className="text-[12px] font-mono" style={{ color: '#9C968B' }}>
                  Left {formatDate(person.left_date)}
                </span>
              )}
            </div>
            {(person.job_title || person.department) && (
              <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
                {[person.job_title, person.department].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>
        <PersonDetailClient person={person} />
      </div>

      {/* Identity card */}
      {(person.employee_no || person.id_number || person.email || person.department) && (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ border: '1px solid #E3E0D9' }}
        >
          <div
            className="px-5 py-3"
            style={{ backgroundColor: '#F7F5F1', borderBottom: '1px solid #F0EEE9' }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono"
              style={{ color: '#9C968B' }}
            >
              Identity
            </span>
          </div>
          <div
            className="grid gap-5 px-5 py-5"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
          >
            {person.employee_no && (
              <IdentityField label="Employee no.">
                <span className="font-mono">{person.employee_no}</span>
              </IdentityField>
            )}
            {person.id_number && (
              <IdentityField label="ID number">
                <IdRevealToggle value={person.id_number} />
              </IdentityField>
            )}
            {person.email && (
              <IdentityField label="Email">
                <a
                  href={`mailto:${person.email}`}
                  className="font-mono hover:underline block truncate"
                  style={{ color: '#1B1A17' }}
                  title={person.email}
                >
                  {person.email}
                </a>
              </IdentityField>
            )}
            {person.department && (
              <IdentityField label="Department">
                {person.department}
              </IdentityField>
            )}
          </div>
        </div>
      )}

      {/* Two-column body */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1.2fr' }}>
        {/* Currently assigned */}
        <div
          className="bg-white rounded-[12px] overflow-hidden self-start"
          style={{ border: '1px solid #E3E0D9' }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ backgroundColor: '#F7F5F1', borderBottom: '1px solid #F0EEE9' }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono"
              style={{ color: '#9C968B' }}
            >
              Currently assigned
            </span>
            <span className="text-[11px] font-mono" style={{ color: '#9C968B' }}>
              {currentDevices.length}
            </span>
          </div>
          {currentDevices.length === 0 ? (
            <div
              className="flex items-center justify-center mx-5 my-5 py-8 rounded-[8px] text-[13px]"
              style={{ border: '1.5px dashed #E3E0D9', color: '#9C968B' }}
            >
              No equipment currently assigned
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#F0EEE9' }}>
              {currentDevices.map((e) => (
                <Link
                  key={e.id}
                  href={`/equipment/${e.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-[14px] transition-colors hover:bg-[#F7F5F1]"
                >
                  <div className="min-w-0">
                    <div
                      className="text-[14px] font-medium truncate"
                      style={{ color: '#1B1A17' }}
                    >
                      {e.name}
                    </div>
                    <div
                      className="text-[11px] font-mono font-semibold mt-0.5"
                      style={{ color: '#C00000' }}
                    >
                      {e.asset_tag}
                    </div>
                  </div>
                  <StatusChip status={e.status} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Device history */}
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ border: '1px solid #E3E0D9' }}
        >
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ backgroundColor: '#F7F5F1', borderBottom: '1px solid #F0EEE9' }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono"
              style={{ color: '#9C968B' }}
            >
              Device history
            </span>
            <span className="text-[11px] font-mono" style={{ color: '#9C968B' }}>
              {history.length} {history.length === 1 ? 'event' : 'events'}
            </span>
          </div>
          <div className="px-5 py-4">
            {history.length === 0 ? (
              <p className="text-[13px]" style={{ color: '#9C968B' }}>
                No device history for this person yet.
              </p>
            ) : (
              <div className="relative">
                {/* Timeline rail */}
                <div
                  className="absolute left-[5px] top-3 bottom-3 w-[2px] rounded-full"
                  style={{ backgroundColor: '#ECEAE4' }}
                />
                <div className="flex flex-col gap-5">
                  {history.map((entry) => {
                    const colors =
                      EVENT_COLORS[entry.event_type] ?? EVENT_COLORS['Edited']
                    return (
                      <div key={entry.id} className="flex gap-4 pl-[18px] relative">
                        {/* Dot */}
                        <span
                          className="absolute left-0 top-[5px] w-[12px] h-[12px] rounded-full border-2 bg-white shrink-0"
                          style={{ borderColor: colors.dot }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="inline-flex items-center px-2 py-[2px] rounded-[5px] text-[11px] font-semibold whitespace-nowrap"
                              style={{ backgroundColor: colors.bg, color: colors.text }}
                            >
                              {entry.event_type}
                            </span>
                            {entry.equipment && (
                              <Link
                                href={`/equipment/${entry.equipment.id}`}
                                className="text-[13px] font-medium hover:underline truncate"
                                style={{ color: '#1B1A17' }}
                              >
                                {entry.equipment.name}
                              </Link>
                            )}
                            {entry.equipment && (
                              <span
                                className="text-[11px] font-mono font-semibold shrink-0"
                                style={{ color: '#C00000' }}
                              >
                                {entry.equipment.asset_tag}
                              </span>
                            )}
                          </div>
                          {entry.note && (
                            <p
                              className="text-[13px] mt-0.5"
                              style={{ color: '#3D3A35' }}
                            >
                              {entry.note}
                            </p>
                          )}
                          <p
                            className="text-[11px] font-mono mt-1"
                            style={{ color: '#9C968B' }}
                          >
                            {formatDate(entry.event_date)}
                            {entry.actor && ` · by ${entry.actor}`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'Active' | 'Former' }) {
  const isActive = status === 'Active'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[12px] font-semibold"
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

function IdentityField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div
        className="text-[10px] font-semibold uppercase tracking-[.08em] font-mono mb-1"
        style={{ color: '#9C968B' }}
      >
        {label}
      </div>
      <div className="text-[14px] font-medium" style={{ color: '#1B1A17' }}>
        {children}
      </div>
    </div>
  )
}
