'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { assignEquipmentAction } from '@/app/actions/equipment'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { getInitials } from '@/lib/utils'
import type { EquipmentWithAssignee, Person } from '@/lib/types'

const ACCESSORIES = ['Charger', 'Laptop sleeve', 'Mouse', 'Docking station']

interface Props {
  equipment: EquipmentWithAssignee
  onClose: () => void
}

export function AssignModal({ equipment: eq, onClose }: Props) {
  const [people, setPeople] = useState<Person[]>([])
  const [selectedPerson, setSelectedPerson] = useState<string | null>(eq.assignee_id)
  const [accessories, setAccessories] = useState<string[]>([])
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('people').select('*').order('name').then(({ data }) => {
      if (data) setPeople(data)
    })
  }, [])

  function toggleAccessory(a: string) {
    setAccessories((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPerson) return
    setError(null)
    const note = accessories.length ? `Accessories issued: ${accessories.join(', ')}.` : ''
    startTransition(async () => {
      const result = await assignEquipmentAction(eq.id, selectedPerson, issueDate, note, 'Admin')
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(27,26,23,.55)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[520px] bg-white rounded-[13px] overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: '#1B1A17' }}>Assign device</h2>
            <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
              Select a person to assign {eq.name} to.
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[7px]"
            style={{ backgroundColor: '#F2F0EB', color: '#6B6760' }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 pb-5 flex flex-col gap-4">
            {error && (
              <div className="text-[13px] px-3 py-2 rounded-[7px]" style={{ backgroundColor: '#FBEAE8', color: '#A82018' }}>
                {error}
              </div>
            )}

            {/* Person picker */}
            <div className="flex flex-col gap-[7px]">
              <span className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono" style={{ color: '#6B6760' }}>
                Assign to
              </span>
              <div
                className="rounded-[8px] overflow-y-auto"
                style={{ border: '1px solid #D5D0C7', maxHeight: 220 }}
              >
                {people.length === 0 && (
                  <p className="text-[13px] px-4 py-3" style={{ color: '#9C968B' }}>Loading…</p>
                )}
                {people.map((person) => {
                  const isSelected = selectedPerson === person.id
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setSelectedPerson(person.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{
                        borderBottom: '1px solid #F0EEE9',
                        border: isSelected ? '2px solid #C00000' : undefined,
                        backgroundColor: isSelected ? '#FFF5F5' : undefined,
                      }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full text-white text-[12px] font-bold shrink-0"
                        style={{ backgroundColor: '#1B1A17' }}
                      >
                        {getInitials(person.name)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium" style={{ color: '#1B1A17' }}>{person.name}</div>
                        <div className="text-[12px]" style={{ color: '#6B6760' }}>
                          {[person.job_title, person.department].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      {isSelected && <Check size={16} style={{ color: '#C00000' }} className="shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Issue date */}
            <div className="flex flex-col gap-[7px]">
              <label className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono" style={{ color: '#6B6760' }}>
                Issue date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-[13px] py-[11px] text-[14px] rounded-[8px] outline-none"
                style={{ border: '1px solid #D5D0C7' }}
              />
            </div>

            {/* Accessories */}
            <div className="flex flex-col gap-[7px]">
              <span className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono" style={{ color: '#6B6760' }}>
                Accessories issued
              </span>
              <div className="flex flex-wrap gap-2">
                {ACCESSORIES.map((a) => {
                  const on = accessories.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAccessory(a)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-[7px] text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: on ? '#1B1A17' : '#F7F5F1',
                        color: on ? '#fff' : '#6B6760',
                        border: '1px solid ' + (on ? '#1B1A17' : '#E3E0D9'),
                      }}
                    >
                      {on && <Check size={12} />}
                      {a}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-3 px-6 py-4"
            style={{ backgroundColor: '#FBFAF7', borderTop: '1px solid #F0EEE9' }}
          >
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!selectedPerson || isPending}>
              {isPending ? 'Assigning…' : 'Assign'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
