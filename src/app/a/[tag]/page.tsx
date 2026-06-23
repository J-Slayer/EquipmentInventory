import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Lock, MapPin, User, CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AssetSticker } from '@/components/AssetSticker'
import { StatusChip } from '@/components/StatusChip'
import { formatDate } from '@/lib/utils'
import type { PublicAsset } from '@/lib/types'
import QRCode from 'qrcode'

interface Props {
  params: Promise<{ tag: string }>
}

export default async function PublicAssetPage({ params }: Props) {
  const { tag } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('public_asset')
    .select('*')
    .eq('asset_tag', tag)
    .single()

  if (!data) notFound()

  const asset = data as PublicAsset

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const publicUrl = `${appUrl}/a/${asset.asset_tag}`
  const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 200, margin: 1 })

  const publicFields = [
    { icon: User, label: 'Assigned to', value: asset.assignee_name ?? 'Unassigned' },
    { icon: MapPin, label: 'Location', value: asset.location ?? '—' },
    { icon: CalendarDays, label: 'Issue date', value: formatDate(asset.issue_date) },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Tiny header */}
      <header
        className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid #E3E0D9' }}
      >
        <div className="flex items-center gap-2">
          <Image src="/assets/ts-mono.png" alt="" width={20} height={20} className="h-5 w-auto" />
          <span className="text-[13px] font-medium" style={{ color: '#6B6760' }}>
            terra strata · asset lookup
          </span>
        </div>
        <span
          className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 rounded-full"
          style={{ backgroundColor: '#F7F5F1', color: '#6B6760', border: '1px solid #E3E0D9' }}
        >
          <Lock size={10} />
          Read-only
        </span>
      </header>

      {/* Page content — narrow column, mobile-first */}
      <div className="max-w-[480px] mx-auto px-5 py-8">
        {/* Status + name */}
        <div className="flex flex-col items-center text-center gap-3 mb-6">
          <StatusChip status={asset.status} />
          <h1 className="text-[22px] font-semibold leading-tight" style={{ color: '#1B1A17' }}>
            {asset.name}
          </h1>
          {(asset.type || asset.serial) && (
            <p className="text-[13px] font-mono" style={{ color: '#6B6760' }}>
              {[asset.type, asset.serial ? `SN ${asset.serial}` : null].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Sticker */}
        <div className="mb-6 max-w-[300px] mx-auto">
          <AssetSticker
            assetTag={asset.asset_tag}
            name={asset.name}
            type={asset.type}
            serial={asset.serial}
            status={asset.status}
            qrDataUrl={qrDataUrl}
            compact
          />
        </div>

        {/* Public fields */}
        <div
          className="bg-white rounded-[12px] overflow-hidden mb-6"
          style={{ border: '1px solid #E3E0D9' }}
        >
          {publicFields.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-4"
              style={{ borderBottom: i < publicFields.length - 1 ? '1px solid #F0EEE9' : undefined }}
            >
              <Icon size={14} style={{ color: '#9C968B' }} className="shrink-0" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono mb-0.5" style={{ color: '#9C968B' }}>
                  {label}
                </div>
                <div className="text-[14px]" style={{ color: '#1B1A17' }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* IT contact footer */}
        <div
          className="rounded-[12px] px-4 py-4 text-center"
          style={{ backgroundColor: '#F7F5F1', border: '1px solid #E3E0D9' }}
        >
          <p className="text-[13px] leading-relaxed" style={{ color: '#6B6760' }}>
            Found this device? It belongs to Terra Strata Construction.
          </p>
          <p className="text-[13px] mt-1" style={{ color: '#6B6760' }}>
            Please contact IT —{' '}
            <a href="mailto:it@terrastrata.co.za" className="font-medium hover:underline" style={{ color: '#1B1A17' }}>
              it@terrastrata.co.za
            </a>
          </p>
        </div>

        {/* IT admin sign in link */}
        <div className="text-center mt-6">
          <Link href="/login" className="text-[12px]" style={{ color: '#9C968B' }}>
            IT staff sign in →
          </Link>
        </div>
      </div>
    </div>
  )
}
