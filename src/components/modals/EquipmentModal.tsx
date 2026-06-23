'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createEquipmentAction, updateEquipmentAction } from '@/app/actions/equipment'
import { Button } from '@/components/ui/Button'
import type { Equipment, EquipmentStatus } from '@/lib/types'

const TYPES = [
  'Laptop', 'Desktop', 'Tablet', 'Rugged tablet', 'Two-way radio',
  'Survey instrument', 'Survey drone', 'Plotter', 'Instrument',
  'Mobile', 'Other',
]

const STATUSES: EquipmentStatus[] = ['Available', 'Assigned', 'In repair', 'Retired']

interface Props {
  equipment?: Equipment
  onClose: () => void
}

export function EquipmentModal({ equipment: eq, onClose }: Props) {
  const isEdit = !!eq
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const rawValue = (fd.get('value_incl_vat') as string).replace(/[^\d.]/g, '')
    const data = {
      asset_tag: fd.get('asset_tag') as string,
      name: fd.get('name') as string,
      type: fd.get('type') as string || undefined,
      serial: fd.get('serial') as string || undefined,
      status: (fd.get('status') as EquipmentStatus) || 'Available',
      make: fd.get('make') as string || undefined,
      model: fd.get('model') as string || undefined,
      value_incl_vat: rawValue ? parseFloat(rawValue) : undefined,
      location: fd.get('location') as string || undefined,
      purchase_date: fd.get('purchase_date') as string || undefined,
      condition: fd.get('condition') as string || undefined,
      notes: fd.get('notes') as string || undefined,
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateEquipmentAction(eq.id, data)
        : await createEquipmentAction(data)
      if (result?.error) {
        setError(result.error)
      } else if (!isEdit && (result as any)?.register_no) {
        setSuccessMsg(`Laptop added · ${(result as any).register_no}`)
        setTimeout(() => onClose(), 1800)
      } else {
        onClose()
      }
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
        <div className="flex items-start justify-between px-6 pt-6 pb-5">
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: '#1B1A17' }}>
              {isEdit ? 'Edit equipment' : 'Add equipment'}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
              {isEdit ? 'Update this asset record.' : 'Register a new asset in the inventory.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[7px] transition-colors"
            style={{ backgroundColor: '#F2F0EB', color: '#6B6760' }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 flex flex-col gap-4 pb-5">
            {successMsg && (
              <div
                className="text-[13px] px-3 py-2 rounded-[7px] font-medium"
                style={{ backgroundColor: '#E4F2EA', color: '#1B7A4B' }}
              >
                {successMsg}
              </div>
            )}
            {error && (
              <div
                className="text-[13px] px-3 py-2 rounded-[7px]"
                style={{ backgroundColor: '#FBEAE8', color: '#A82018' }}
              >
                {error}
              </div>
            )}

            <Field label="Item name" required>
              <input name="name" defaultValue={eq?.name} required className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <select name="type" defaultValue={eq?.type ?? ''} className={inputCls}>
                  <option value="">Select type…</option>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Asset tag">
                <input
                  name="asset_tag"
                  defaultValue={eq?.asset_tag}
                  required
                  className={`${inputCls} font-mono`}
                  style={{ color: '#C00000' }}
                  placeholder="TS-LT-0001"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Serial number">
                <input name="serial" defaultValue={eq?.serial ?? ''} className={`${inputCls} font-mono`} />
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={eq?.status ?? 'Available'} className={inputCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Make">
                <input name="make" defaultValue={(eq as any)?.make ?? ''} placeholder="e.g. HP" className={inputCls} />
              </Field>
              <Field label="Model">
                <input name="model" defaultValue={(eq as any)?.model ?? ''} placeholder="e.g. ProBook 450 G9" className={inputCls} />
              </Field>
              <Field label="Value (incl. VAT)">
                <input
                  name="value_incl_vat"
                  defaultValue={(eq as any)?.value_incl_vat > 0 ? (eq as any).value_incl_vat : ''}
                  placeholder="R 0"
                  className={`${inputCls} font-mono`}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Location">
                <input name="location" defaultValue={eq?.location ?? ''} className={inputCls} />
              </Field>
              <Field label="Purchase date">
                <input name="purchase_date" type="date" defaultValue={eq?.purchase_date ?? ''} className={inputCls} />
              </Field>
            </div>

            <Field label="Condition">
              <input name="condition" defaultValue={eq?.condition ?? ''} placeholder="e.g. Good · charger + sleeve" className={inputCls} />
            </Field>

            <Field label="Notes">
              <textarea
                name="notes"
                defaultValue={eq?.notes ?? ''}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-3 px-6 py-4"
            style={{ backgroundColor: '#FBFAF7', borderTop: '1px solid #F0EEE9' }}
          >
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add equipment'}
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
      <label
        className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono"
        style={{ color: '#6B6760' }}
      >
        {label}{required && <span className="text-[#C00000] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full px-[13px] py-[11px] text-[14px] rounded-[8px] outline-none transition-colors bg-white border border-[#D5D0C7]'
