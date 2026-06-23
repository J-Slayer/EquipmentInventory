import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusChip } from '@/components/StatusChip'
import { AssetSticker } from '@/components/AssetSticker'
import { EquipmentDetailClient } from '@/components/EquipmentDetailClient'
import { ChangeStatusCard } from '@/components/ChangeStatusCard'
import { CopyLinkButton } from '@/components/CopyLinkButton'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { EquipmentWithAssignee, AssignmentHistory } from '@/lib/types'
import QRCode from 'qrcode'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EquipmentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: equipment } = await supabase
    .from('equipment')
    .select('*, assignee:people(*)')
    .eq('id', id)
    .single()

  if (!equipment) notFound()

  const { data: history } = await supabase
    .from('assignment_history')
    .select('*, person:people(*)')
    .eq('equipment_id', id)
    .order('created_at', { ascending: false })

  const eq = equipment as unknown as EquipmentWithAssignee
  const historyItems = (history ?? []) as unknown as AssignmentHistory[]

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const publicUrl = `${appUrl}/a/${eq.asset_tag}`
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 200, margin: 1 })

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px]" style={{ color: '#6B6760' }}>
        <Link href="/equipment" className="hover:underline" style={{ color: '#6B6760' }}>
          ‹ Equipment
        </Link>
        <span>/</span>
        <span className="font-mono font-medium" style={{ color: '#1B1A17' }}>
          {eq.asset_tag}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[28px] font-semibold tracking-[-0.01em]" style={{ color: '#1B1A17' }}>
              {eq.name}
            </h1>
            <StatusChip status={eq.status} />
          </div>
          <p className="text-[13px] font-mono mt-1" style={{ color: '#6B6760' }}>
            {[eq.type, eq.serial ? `SN ${eq.serial}` : null].filter(Boolean).join(' · ')}
          </p>
        </div>
        <EquipmentDetailClient equipment={eq} />
      </div>

      {/* Two-column body */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: '1.6fr 1fr' }}
      >
        {/* Left column */}
        <div className="flex flex-col gap-6">
          {/* Record card */}
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
                Record
              </span>
            </div>
            <div className="divide-y" style={{ borderColor: '#F0EEE9' }}>
              {[
                ...(eq.register_no ? [{
                  label: 'Register no.',
                  value: (
                    <span className="font-mono font-semibold" style={{ color: '#C00000' }}>
                      {eq.register_no}
                    </span>
                  ),
                }] : []),
                {
                  label: 'Assigned to',
                  value: eq.assignee ? (
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: '#1B1A17' }}
                      >
                        {eq.assignee.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
                      </span>
                      <span>{eq.assignee.name}</span>
                    </div>
                  ) : <span style={{ color: '#9C968B' }}>Unassigned</span>,
                },
                { label: 'Issue date', value: formatDate(eq.issue_date) },
                { label: 'Serial number', value: eq.serial ? <span className="font-mono">{eq.serial}</span> : '—' },
                { label: 'Location', value: eq.location ?? '—' },
                { label: 'Purchase date', value: formatDate(eq.purchase_date) },
                { label: 'Condition', value: eq.condition ?? '—' },
                ...(eq.make ? [{ label: 'Make', value: eq.make }] : []),
                ...(eq.model ? [{ label: 'Model', value: eq.model }] : []),
                ...(eq.value_incl_vat && eq.value_incl_vat > 0 ? [{
                  label: 'Value (incl. VAT)',
                  value: (
                    <span className="font-mono font-semibold">
                      {formatCurrency(eq.value_incl_vat)} incl. VAT
                    </span>
                  ),
                }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="grid grid-cols-2 gap-4 px-5 py-4">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono"
                    style={{ color: '#9C968B' }}
                  >
                    {label}
                  </span>
                  <span className="text-[14px]" style={{ color: '#1B1A17' }}>
                    {value}
                  </span>
                </div>
              ))}
              {eq.notes && (
                <div className="px-5 py-4">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono mb-2"
                    style={{ color: '#9C968B' }}
                  >
                    Notes
                  </div>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#3D3A35' }}>
                    {eq.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Change status */}
          <ChangeStatusCard equipmentId={eq.id} currentStatus={eq.status} />

          {/* Assignment history */}
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
                Assignment history
              </span>
              <span className="text-[11px] font-mono" style={{ color: '#9C968B' }}>
                {historyItems.length}
              </span>
            </div>
            <div className="px-5 py-4">
              {historyItems.length === 0 ? (
                <p className="text-[13px]" style={{ color: '#9C968B' }}>No history yet.</p>
              ) : (
                <div className="relative">
                  {/* Rail */}
                  <div
                    className="absolute left-[5px] top-3 bottom-3 w-[2px] rounded-full"
                    style={{ backgroundColor: '#ECEAE4' }}
                  />
                  <div className="flex flex-col gap-5">
                    {historyItems.map((entry, i) => (
                      <div key={entry.id} className="flex gap-4 pl-[18px] relative">
                        {/* Dot */}
                        <span
                          className="absolute left-0 top-1 w-[12px] h-[12px] rounded-full border-2 bg-white shrink-0"
                          style={{ borderColor: i === 0 ? '#C00000' : '#ECEAE4' }}
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-semibold" style={{ color: '#1B1A17' }}>
                              {entry.event_type}
                            </span>
                            {(entry as any).person && (
                              <span className="text-[14px]" style={{ color: '#6B6760' }}>
                                → {(entry as any).person.name}
                              </span>
                            )}
                            {i === 0 && (
                              <span
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: '#E4F2EA', color: '#1B7A4B' }}
                              >
                                Current
                              </span>
                            )}
                          </div>
                          {entry.note && (
                            <p className="text-[13px] mt-0.5" style={{ color: '#3D3A35' }}>
                              {entry.note}
                            </p>
                          )}
                          <p className="text-[11px] font-mono mt-1" style={{ color: '#9C968B' }}>
                            {formatDate(entry.event_date)}
                            {entry.actor && ` · by ${entry.actor}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — sticker + actions */}
        <div className="flex flex-col gap-4">
          <AssetSticker
            assetTag={eq.asset_tag}
            name={eq.name}
            type={eq.type}
            serial={eq.serial}
            status={eq.status}
            qrDataUrl={qrDataUrl}
          />

          {/* Sticker actions */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`/print/${eq.id}`}
              target="_blank"
              className="flex items-center justify-center gap-2 px-4 py-[10px] rounded-[7px] text-[13px] font-semibold transition-colors hover:bg-[#F7F5F1]"
              style={{ backgroundColor: '#fff', color: '#1B1A17', border: '1px solid #D5D0C7' }}
            >
              Print label
            </a>
            <CopyLinkButton url={publicUrl} />
          </div>

          <a
            href={`/a/${eq.asset_tag}`}
            target="_blank"
            className="flex items-center justify-center gap-2 px-4 py-[10px] rounded-[7px] text-[13px] font-semibold transition-colors w-full"
            style={{ backgroundColor: '#fff', color: '#1B1A17', border: '1px solid #D5D0C7' }}
          >
            View public page ↗
          </a>
        </div>
      </div>
    </div>
  )
}
