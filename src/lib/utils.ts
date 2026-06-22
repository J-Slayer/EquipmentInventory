export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getDaysLabel(days: number | null): { text: string; urgent: boolean } {
  if (days === null) return { text: '', urgent: false }
  if (days < 0) return { text: `${Math.abs(days)} days ago`, urgent: true }
  if (days === 0) return { text: 'today', urgent: true }
  if (days === 1) return { text: 'tomorrow', urgent: true }
  return { text: `in ${days} days`, urgent: days <= 30 }
}

/** Auto-generate an asset tag from prefix, type, and current sequence */
export function suggestAssetTag(prefix: string, type: string, sequence: number): string {
  const typeMap: Record<string, string> = {
    Laptop: 'LT',
    Desktop: 'DT',
    Tablet: 'TB',
    'Two-way radio': 'RD',
    'Survey instrument': 'SV',
    'Survey drone': 'SV',
    Plotter: 'PL',
    Instrument: 'IN',
    'Rugged tablet': 'TB',
    Mobile: 'MB',
    Other: 'OT',
  }
  const code = typeMap[type] ?? 'OT'
  return `${prefix}${code}-${String(sequence).padStart(4, '0')}`
}
