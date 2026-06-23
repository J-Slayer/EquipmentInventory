'use client'

import { useState, useTransition, useEffect } from 'react'
import { X } from 'lucide-react'
import { createContractAction, updateContractAction } from '@/app/actions/contracts'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import type { Contract, Person, Equipment } from '@/lib/types'

const CONTRACT_TYPES = ['Data / SIM', 'Phone', 'Software', 'Insurance', 'Lease', 'Other']

interface Props {
  contract?: Contract
  onClose: () => void
}

export function ContractModal({ contract: ct, onClose }: Props) {
  const isEdit = !!ct
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('people').select('id, name').order('name'),
      supabase.from('equipment').select('id, name, asset_tag').order('name'),
    ]).then(([{ data: p }, { data: e }]) => {
      if (p) setPeople(p as Person[])
      if (e) setEquipment(e as Equipment[])
    })
  }, [])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get('name') as string,
      type: fd.get('type') as string || undefined,
      provider: fd.get('provider') as string || undefined,
      account_number: fd.get('account_number') as string || undefined,
      monthly_cost: parseFloat(fd.get('monthly_cost') as string) || 0,
      data_gb: fd.get('data_gb') ? parseFloat(fd.get('data_gb') as string) : undefined,
      start_date: fd.get('start_date') as string || undefined,
      renewal_date: fd.get('renewal_date') as string || undefined,
      holder: fd.get('holder') as string || undefined,
      holder_id: fd.get('holder_id') as string || undefined,
      linked_equipment_id: fd.get('linked_equipment_id') as string || undefined,
      notes: fd.get('notes') as string || undefined,
    }
    startTransition(async () => {
      const result = isEdit
        ? await updateContractAction(ct.id, data)
        : await createContractAction(data)
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
        className="w-full max-w-[560px] bg-white rounded-[13px] overflow-hidden max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-5 shrink-0">
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: '#1B1A17' }}>
              {isEdit ? 'Edit contract' : 'Add contract'}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
              {isEdit ? 'Update this contract.' : 'Register a service contract.'}
            </p>
          </div>
          <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-[7px]" style={{ backgroundColor: '#F2F0EB', color: '#6B6760' }} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 pb-5 flex flex-col gap-4 overflow-y-auto flex-1">
            {error && (
              <div className="text-[13px] px-3 py-2 rounded-[7px]" style={{ backgroundColor: '#FBEAE8', color: '#A82018' }}>{error}</div>
            )}

            <Field label="Contract name" required>
              <input name="name" defaultValue={ct?.name} required className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <select name="type" defaultValue={ct?.type ?? ''} className={inputCls}>
                  <option value="">Select type…</option>
                  {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Provider">
                <input name="provider" defaultValue={ct?.provider ?? ''} className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Account number">
                <input name="account_number" defaultValue={ct?.account_number ?? ''} className={`${inputCls} font-mono`} />
              </Field>
              <Field label="Monthly cost (R)">
                <input name="monthly_cost" type="number" step="0.01" min="0" defaultValue={ct?.monthly_cost ?? 0} className={`${inputCls} font-mono`} />
              </Field>
              <Field label="Data (GB)">
                <input name="data_gb" type="number" step="0.1" min="0" defaultValue={ct?.data_gb ?? ''} placeholder="—" className={`${inputCls} font-mono`} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date">
                <input name="start_date" type="date" defaultValue={ct?.start_date ?? ''} className={inputCls} />
              </Field>
              <Field label="Renewal / end date">
                <input name="renewal_date" type="date" defaultValue={ct?.renewal_date ?? ''} className={inputCls} placeholder="Leave blank = no end date" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Holder">
                <input name="holder" defaultValue={ct?.holder ?? 'Company'} className={inputCls} placeholder="Company or person name" />
              </Field>
              <Field label="Holder (person)">
                <select name="holder_id" defaultValue={ct?.holder_id ?? ''} className={inputCls}>
                  <option value="">Company / no person</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Linked device">
              <select name="linked_equipment_id" defaultValue={ct?.linked_equipment_id ?? ''} className={inputCls}>
                <option value="">No device</option>
                {equipment.map((e) => <option key={e.id} value={e.id}>{e.asset_tag} — {e.name}</option>)}
              </select>
            </Field>

            <Field label="Notes">
              <textarea name="notes" defaultValue={ct?.notes ?? ''} rows={3} className={`${inputCls} resize-none`} />
            </Field>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 shrink-0" style={{ backgroundColor: '#FBFAF7', borderTop: '1px solid #F0EEE9' }}>
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Save contract'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-[7px]">
      <label className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono" style={{ color: '#6B6760' }}>
        {label}{required && <span className="text-[#C00000] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-[13px] py-[11px] text-[14px] rounded-[8px] outline-none bg-white border border-[#D5D0C7]'
