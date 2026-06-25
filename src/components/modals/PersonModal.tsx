'use client'

import { useState, useTransition } from 'react'
import { X } from 'lucide-react'
import { createPersonAction, updatePersonAction } from '@/app/actions/people'
import { Button } from '@/components/ui/Button'
import type { Person } from '@/lib/types'

const DEPARTMENTS = ['Head Office', 'Site']

interface Props {
  person?: Person
  onClose: () => void
}

export function PersonModal({ person, onClose }: Props) {
  const isEdit = !!person
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    const data = {
      name: fd.get('name') as string,
      job_title: fd.get('job_title') as string || undefined,
      department: fd.get('department') as string || undefined,
      email: fd.get('email') as string || undefined,
      employee_no: fd.get('employee_no') as string || undefined,
      id_number: fd.get('id_number') as string || undefined,
      employment_status: (fd.get('employment_status') as 'Active' | 'Former') || 'Active',
    }
    startTransition(async () => {
      const result = isEdit
        ? await updatePersonAction(person.id, data)
        : await createPersonAction(data)
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
        className="w-full max-w-[480px] bg-white rounded-[13px] overflow-hidden"
        style={{ boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-5">
          <div>
            <h2 className="text-[18px] font-semibold" style={{ color: '#1B1A17' }}>
              {isEdit ? 'Edit person' : 'Add person'}
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: '#6B6760' }}>
              {isEdit ? 'Update this employee record.' : 'Create an employee record.'}
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

            <Field label="Full name" required>
              <input name="name" defaultValue={person?.name} required className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Job title">
                <input name="job_title" defaultValue={person?.job_title ?? ''} className={inputCls} />
              </Field>
              <Field label="Department">
                <select name="department" defaultValue={person?.department ?? ''} className={inputCls}>
                  <option value="">Select…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Email">
              <input name="email" type="email" defaultValue={person?.email ?? ''} className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Employee no.">
                <input
                  name="employee_no"
                  defaultValue={person?.employee_no ?? ''}
                  placeholder="TS-EMP-0000"
                  className={`${inputCls} font-mono`}
                />
              </Field>
              <Field label="Employment status">
                <select
                  name="employment_status"
                  defaultValue={person?.employment_status ?? 'Active'}
                  className={inputCls}
                >
                  <option value="Active">Active</option>
                  <option value="Former">Former</option>
                </select>
              </Field>
            </div>

            <Field label="ID number">
              <input
                name="id_number"
                defaultValue={person?.id_number ?? ''}
                placeholder="13-digit SA ID"
                className={`${inputCls} font-mono`}
                maxLength={13}
              />
            </Field>
          </div>

          <div
            className="flex justify-end gap-3 px-6 py-4"
            style={{ backgroundColor: '#FBFAF7', borderTop: '1px solid #F0EEE9' }}
          >
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Save person'}
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
