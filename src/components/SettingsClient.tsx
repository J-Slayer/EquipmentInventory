'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteUserAction, changePasswordAction } from '@/app/actions/users'
import AddUserModal from '@/components/modals/AddUserModal'
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Props {
  currentUser: User
  users: User[]
}

export default function SettingsClient({ currentUser, users }: Props) {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete(userId: string) {
    if (!confirm('Remove this admin user? They will lose access immediately.')) return
    startTransition(async () => {
      const result = await deleteUserAction(userId)
      if (result?.error) alert(result.error)
      else router.refresh()
    })
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwError('')
    const fd = new FormData(e.currentTarget)
    const pw = fd.get('password') as string
    const confirm = fd.get('confirm') as string
    if (pw !== confirm) { setPwError('Passwords do not match'); return }
    startTransition(async () => {
      const result = await changePasswordAction(fd)
      if (result?.error) setPwError(result.error)
      else { setPwSuccess(true); setShowPasswordForm(false) }
    })
  }

  const inputCls =
    'w-full h-[38px] rounded-lg px-3 text-[14px] border border-[#D5D0C7] focus:outline-none focus:ring-2 focus:ring-[#C00000] bg-white'

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* My profile */}
      <div className="bg-white rounded-xl border border-[#E3E0D9] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E3E0D9]">
          <h2 className="text-[14px] font-semibold text-[#1B1A17]">My profile</h2>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <div className="text-[11px] font-medium text-[#6B6760] uppercase tracking-wide mb-1">Email</div>
            <div className="text-[14px] text-[#1B1A17]">{currentUser.email}</div>
          </div>

          {pwSuccess && (
            <div className="text-[13px] text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              Password updated successfully.
            </div>
          )}

          {!showPasswordForm ? (
            <button
              onClick={() => { setShowPasswordForm(true); setPwSuccess(false) }}
              className="text-[13px] font-medium text-[#C00000] hover:underline w-fit"
            >
              Change password
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3 max-w-sm">
              <div>
                <label className="text-[11px] font-medium text-[#6B6760] uppercase tracking-wide block mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    minLength={6}
                    className={inputCls + ' pr-9'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B6760] hover:text-[#1B1A17]"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#6B6760] uppercase tracking-wide block mb-1.5">
                  Confirm password
                </label>
                <input name="confirm" type="password" required className={inputCls} />
              </div>
              {pwError && <p className="text-[12px] text-[#C00000]">{pwError}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-[38px] px-4 bg-[#C00000] hover:bg-[#A30000] text-white text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Saving…' : 'Save password'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasswordForm(false); setPwError('') }}
                  className="h-[38px] px-4 bg-white border border-[#D5D0C7] text-[#1B1A17] text-[13px] font-medium rounded-lg hover:bg-[#F7F5F1] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Admin users */}
      <div className="bg-white rounded-xl border border-[#E3E0D9] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E3E0D9] flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold text-[#1B1A17]">Admin users</h2>
            <p className="text-[12px] text-[#6B6760] mt-0.5">Users who can log in and manage this system.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-[34px] px-3 flex items-center gap-1.5 bg-[#C00000] hover:bg-[#A30000] text-white text-[13px] font-medium rounded-lg transition-colors"
          >
            <Plus size={14} />
            Add user
          </button>
        </div>
        <div className="divide-y divide-[#F0EDE8]">
          {users.map((u) => (
            <div key={u.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#1B1A17] truncate">{u.email}</span>
                  {u.id === currentUser.id && (
                    <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F0EDE8] text-[#6B6760]">
                      You
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-[#6B6760] mt-0.5">
                  Joined{' '}
                  {new Date(u.created_at).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {u.last_sign_in_at && (
                    <>
                      {' · Last login '}
                      {new Date(u.last_sign_in_at).toLocaleDateString('en-ZA', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </>
                  )}
                </div>
              </div>
              {u.id !== currentUser.id && (
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={isPending}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#6B6760] hover:text-[#C00000] hover:bg-[#FCF0F0] transition-colors disabled:opacity-40"
                  title="Remove user"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddUserModal
          onClose={() => {
            setShowAddModal(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
