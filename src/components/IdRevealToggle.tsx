'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function IdRevealToggle({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono font-medium" style={{ color: '#1B1A17' }}>
        {revealed ? value : '•••••••••••••'}
      </span>
      <button
        onClick={() => setRevealed((r) => !r)}
        style={{ color: '#9C968B' }}
        title={revealed ? 'Hide ID' : 'Show ID'}
      >
        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}
