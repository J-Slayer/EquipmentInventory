'use client'

interface Props {
  url: string
  label?: string
}

export function CopyLinkButton({ url, label = 'Copy link' }: Props) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(url)}
      className="flex items-center justify-center gap-2 px-4 py-[10px] rounded-[7px] text-[13px] font-semibold transition-colors w-full"
      style={{ backgroundColor: '#fff', color: '#1B1A17', border: '1px solid #D5D0C7' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F5F1')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
    >
      {label}
    </button>
  )
}
