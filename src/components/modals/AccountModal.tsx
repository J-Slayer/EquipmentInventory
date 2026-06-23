'use client'

import { useState, useTransition } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { createAccountAction, updateAccountAction } from '@/app/actions/passwords'
import { Button } from '@/components/ui/Button'
import type { SharedAccountRow } from '@/lib/types'

const CATEGORIES = [
  'AI', 'Cloud / DB', 'Cloud / Admin', 'Software',
  'Finance', 'Security / Admin', 'Insurance', 'Other',
]

interface Props {
  account?: SharedAccountRow
  onClose: () => void
}

export function AccountModal({ account, onClose }: Props) {
  const isEdit = !!account
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = isEdit
        ? await updateAccountAction(account.id, {
            service: fd.get('service') as string,
            category: fd.get('category') as string || undefined,
            username: fd.get('username') as string || undefined,
            password: fd.get('password') as string || undefined,
            url: fd.get('url') as string || undefined,
            owner: fd.get('owner') as string || undefined,
            notes: fd.get('notes') as string || undefined,
          })
        : await createAccountAction({
            service: fd.get('service') as string,
            category: fd.get('category') as string || undefined,
            username: fd.get('username') as string || undefined,
            password: fd.get('password') as string,
            url: fd.get('url') as string || undefined,
            owner: fd.get('owner') as string || undefined,
            notes: fd.get('notes') as string || undefined,
          })

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
        <div className="flex items-start justify-between px-6 pt-6 pb-5">
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: '#1B1A17' }}>
              {isEdit ? 'Edit account' : 'Add shared account'}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
              {isEdit ? 'Update this service account.' : 'Add a company-wide service account.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-[7px] transition-colors"
            style={{ backgroundColor: '#F2F0EB', color: '#6B6760' }}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 flex flex-col gap-4 pb-5">
            {error && (
              <div className="text-[13px] px-3 py-2 rounded-[7px]" style={{ backgroundColor: '#FBEAE8', color: '#A82018' }}>
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Service" required>
                <input name="service" defaultValue={account?.service} required className={inputCls} placeholder="Supabase" />
              </Field>
              <Field label="Category">
                <select name="category" defaultValue={account?.category ?? ''} className={inputCls}>
                  <option value="">Select…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <Field label="URL">
              <input name="url" defaultValue={account?.url ?? ''} placeholder="supabase.com" className={`${inputCls} font-mono`} />
            </Field>

            <Field label="Username / email">
              <input name="username" defaultValue={account?.username ?? ''} className={`${inputCls} font-mono`} />
            </Field>

            <Field label={isEdit ? 'New password (leave blank to keep)' : 'Password'} required={!isEdit}>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required={!isEdit}
                  className={`${inputCls} pr-10 font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#9C968B' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <Field label="Held by">
              <input name="owner" defaultValue={account?.owner ?? ''} placeholder="Company" className={inputCls} />
            </Field>

            <Field label="Notes">
              <textarea name="notes" defaultValue={account?.notes ?? ''} rows={2} className={`${inputCls} resize-none`} />
            </Field>
          </div>

          <div
            className="flex justify-end gap-3 px-6 py-4"
            style={{ backgroundColor: '#FBFAF7', borderTop: '1px solid #F0EEE9' }}
          >
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add account'}
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

const inputCls =
  'w-full px-[13px] py-[11px] text-[14px] rounded-[8px] outline-none transition-colors bg-white border border-[#D5D0C7]'
