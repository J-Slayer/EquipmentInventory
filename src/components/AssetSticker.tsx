import Image from 'next/image'
import type { EquipmentStatus } from '@/lib/types'

interface AssetStickerProps {
  assetTag: string
  name: string
  type?: string | null
  serial?: string | null
  status: EquipmentStatus
  qrDataUrl?: string
  showPropertyOf?: boolean
  compact?: boolean
}

export function AssetSticker({
  assetTag,
  name,
  type,
  serial,
  qrDataUrl,
  showPropertyOf = true,
  compact = false,
}: AssetStickerProps) {
  return (
    /* Dashed peel frame */
    <div
      className="p-[14px] rounded-[14px]"
      style={{
        border: '1.5px dashed #C7C2B9',
        backgroundColor: '#FBFAF7',
      }}
    >
      {/* Inner sticker card */}
      <div
        className="rounded-[9px] overflow-hidden bg-white"
        style={{ border: '1px solid #E3E0D9' }}
      >
        {/* Ink header bar */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: '#1B1A17' }}
        >
          <div className="flex items-center gap-2">
            <Image
              src="/assets/ts-mono.png"
              alt=""
              width={20}
              height={20}
              className="h-5 w-auto"
            />
            <span className="text-[13px] font-semibold" style={{ color: '#C9C5BD' }}>
              terra strata
            </span>
          </div>
          {showPropertyOf && (
            <span
              className="text-[10px] font-semibold uppercase tracking-[.1em] font-mono"
              style={{ color: '#E0866B' }}
            >
              Property of
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex items-start gap-4 px-4 py-4">
          <div className="flex-1 min-w-0">
            {/* Asset tag */}
            <div
              className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono mb-1"
              style={{ color: '#9C968B' }}
            >
              Asset tag
            </div>
            <div
              className={`font-semibold font-mono leading-none ${compact ? 'text-[20px]' : 'text-[26px]'}`}
              style={{ color: '#1B1A17' }}
            >
              {assetTag}
            </div>
            <div className="text-[13px] font-medium mt-2 leading-snug" style={{ color: '#1B1A17' }}>
              {name}
            </div>
            {(type || serial) && (
              <div className="text-[11px] font-mono mt-1" style={{ color: '#9C968B' }}>
                {[type, serial ? `SN ${serial}` : null].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>

          {/* QR code */}
          <div
            className="shrink-0 rounded-[7px] overflow-hidden flex items-center justify-center"
            style={{ width: 92, height: 92, border: '1px solid #ECEAE4', padding: 5 }}
          >
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt={`QR code for ${assetTag}`} width={82} height={82} />
            ) : (
              <QrPlaceholder size={82} />
            )}
          </div>
        </div>

        {/* Red bottom edge */}
        <div className="h-[5px]" style={{ backgroundColor: '#C00000' }} />
      </div>
    </div>
  )
}

/** Deterministic placeholder grid when QR hasn't loaded */
function QrPlaceholder({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 82 82" fill="none" aria-hidden>
      {/* Finder patterns */}
      <rect x="0" y="0" width="24" height="24" rx="3" fill="#1B1A17" />
      <rect x="3" y="3" width="18" height="18" rx="1" fill="white" />
      <rect x="6" y="6" width="12" height="12" rx="0.5" fill="#1B1A17" />

      <rect x="58" y="0" width="24" height="24" rx="3" fill="#1B1A17" />
      <rect x="61" y="3" width="18" height="18" rx="1" fill="white" />
      <rect x="64" y="6" width="12" height="12" rx="0.5" fill="#1B1A17" />

      <rect x="0" y="58" width="24" height="24" rx="3" fill="#1B1A17" />
      <rect x="3" y="61" width="18" height="18" rx="1" fill="white" />
      <rect x="6" y="64" width="12" height="12" rx="0.5" fill="#1B1A17" />

      {/* Data modules */}
      {[28,32,36,40,44,48,52].map((x) =>
        [0,4,8,12,16,20,24,28,32,36,40,44,48,52,56,60,64,68,72,76].map((y) =>
          Math.abs(x * 7 + y * 13) % 3 === 0 ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill="#1B1A17" />
          ) : null
        )
      )}
      {[0,4,8,12,16,20,24].map((y) =>
        [52,56,60,64,68,72,76].map((x) =>
          Math.abs(x * 11 + y * 7) % 3 === 0 ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill="#1B1A17" />
          ) : null
        )
      )}
    </svg>
  )
}
