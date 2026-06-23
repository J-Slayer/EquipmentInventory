import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatusChip } from '@/components/StatusChip'
import { Info } from 'lucide-react'
import type { LaptopRegisterItem } from '@/lib/types'

export default async function RegisterPage() {
  const supabase = await createClient()

  const [{ data: rows }, { data: nextNoData }] = await Promise.all([
    supabase.from('laptop_register').select('*'),
    supabase.rpc('peek_register_no'),
  ])

  const items = (rows ?? []) as unknown as LaptopRegisterItem[]
  const nextNo = (nextNoData as string | null) ?? 'TS-00001'

  const cols = '1.1fr 2.4fr 1.3fr 1.5fr 1.1fr 1.4fr'
  const headers = ['Reg no.', 'Device', 'Type', 'Serial', 'Status', 'Holder']

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1
            className="text-[27px] font-semibold tracking-[-0.01em]"
            style={{ color: '#1B1A17' }}
          >
            Laptop register
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#6B6760' }}>
            Every laptop gets a permanent number in order of acquisition ·{' '}
            <strong style={{ color: '#1B1A17' }}>{items.length}</strong> registered
          </p>
        </div>

        {/* Next number card */}
        <div
          className="shrink-0 rounded-[9px] px-[14px] py-[9px]"
          style={{ backgroundColor: '#fff', border: '1px solid #E3E0D9' }}
        >
          <div
            className="text-[10px] font-semibold uppercase tracking-[.1em] font-mono mb-1"
            style={{ color: '#9C968B' }}
          >
            Next number
          </div>
          <div className="text-[15px] font-semibold font-mono" style={{ color: '#C00000' }}>
            {nextNo}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 rounded-[9px] px-[14px] py-[11px]"
        style={{ backgroundColor: '#F7F5F1', border: '1px solid #E6E2DA' }}
      >
        <Info size={15} className="shrink-0 mt-[1px]" style={{ color: '#9C968B' }} />
        <p className="text-[13px]" style={{ color: '#6B6760' }}>
          Laptops are numbered{' '}
          <span className="font-mono">TS-00001</span>,{' '}
          <span className="font-mono">TS-00002</span> and so on. The number is assigned once,
          never reused, and stays with the laptop for its whole life.
        </p>
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div
          className="bg-white rounded-[12px] flex flex-col items-center justify-center py-20 gap-4"
          style={{ border: '1px solid #E3E0D9' }}
        >
          <p className="text-[14px]" style={{ color: '#9C968B' }}>
            No laptops registered yet.
          </p>
          <Link
            href="/equipment"
            className="text-[13px] font-medium px-4 py-2 rounded-[7px] transition-colors hover:opacity-90"
            style={{ backgroundColor: '#C00000', color: '#fff' }}
          >
            Add equipment →
          </Link>
        </div>
      ) : (
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ border: '1px solid #E3E0D9' }}
        >
          {/* Column headers */}
          <div
            className="grid px-5 py-3"
            style={{
              gridTemplateColumns: cols,
              gap: '16px',
              backgroundColor: '#F7F5F1',
              borderBottom: '1px solid #F0EEE9',
            }}
          >
            {headers.map((h) => (
              <span
                key={h}
                className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono"
                style={{ color: '#9C968B' }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/equipment/${item.id}`}
              className="grid px-5 transition-colors hover:bg-[#FAFAF8]"
              style={{
                gridTemplateColumns: cols,
                gap: '16px',
                paddingTop: '14px',
                paddingBottom: '14px',
                borderBottom: '1px solid #F0EEE9',
                alignItems: 'center',
              }}
            >
              {/* Reg no. */}
              <span
                className="text-[15px] font-semibold font-mono"
                style={{ color: '#C00000' }}
              >
                {item.register_no}
              </span>

              {/* Device */}
              <div>
                <div className="text-[14px] font-semibold" style={{ color: '#1B1A17' }}>
                  {item.name}
                </div>
                <div
                  className="text-[11px] font-mono font-medium mt-0.5"
                  style={{ color: '#9C968B' }}
                >
                  tag {item.asset_tag}
                </div>
              </div>

              {/* Type */}
              <span className="text-[14px]" style={{ color: '#6B6760' }}>
                {item.type ?? '—'}
              </span>

              {/* Serial */}
              <span className="text-[14px] font-mono" style={{ color: '#6B6760' }}>
                {item.serial ?? '—'}
              </span>

              {/* Status */}
              <StatusChip status={item.status} />

              {/* Holder */}
              <span className="text-[14px]" style={{ color: '#1B1A17' }}>
                {item.holder ?? '—'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
