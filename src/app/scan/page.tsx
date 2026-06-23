import Image from 'next/image'
import Link from 'next/link'
import { QrCode } from 'lucide-react'

export default function ScanLandingPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ backgroundColor: '#EDEBE6' }}
    >
      <div className="flex flex-col items-center text-center max-w-[480px] w-full">
        {/* Logo */}
        <Image
          src="/assets/ts-lockup-light.png"
          alt="Terra Strata"
          width={200}
          height={60}
          className="h-12 w-auto mb-10"
        />

        {/* QR glyph tile */}
        <div
          className="flex items-center justify-center w-[108px] h-[108px] rounded-[20px] mb-8"
          style={{ backgroundColor: '#F7F5F1', border: '1px solid #E3E0D9' }}
        >
          <QrCode size={52} style={{ color: '#9C968B' }} />
        </div>

        {/* Heading */}
        <h1
          className="text-[30px] font-semibold tracking-[-0.015em] mb-3"
          style={{ color: '#1B1A17', maxWidth: '18ch' }}
        >
          Scan an asset's QR code to see its details
        </h1>

        {/* Supporting text */}
        <p
          className="text-[15px] leading-relaxed mb-6"
          style={{ color: '#6B6760', maxWidth: '46ch' }}
        >
          Each piece of equipment has a unique QR label. Scan it to view the asset details
          — no login required.
        </p>

        {/* Info pill */}
        <div
          className="flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-full mb-10"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3E0D9', color: '#6B6760' }}
        >
          No login needed — pages are read-only. IT staff sign in to manage assets.
        </div>

        {/* IT sign in */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-[20px] py-[12px] rounded-[8px] text-[14px] font-semibold transition-colors"
          style={{ backgroundColor: '#1B1A17', color: '#fff' }}
        >
          IT staff sign in →
        </Link>
      </div>
    </div>
  )
}
