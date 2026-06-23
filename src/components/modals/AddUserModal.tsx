'use client'

import { useState, useTransition } from 'react'
import { addUserAction } from '@/app/actions/users'
import { X, Eye, EyeOff } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function AddUserModal({ onClose }: Props) {
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await addUserAction(fd)
      if (result?.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-[440px] mx-4 shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3E0D9]">
          <h2 className="text-[15px] font-semibold text-[#1B1A17]">Add admin user</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F5F1] text-[#6B6760]"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-medium text-[#6B6760] uppercase tracking-wide block mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="user@terrastrata.co.za"
                className="w-full h-[38px] rounded-lg px-3 text-[14px] border border-[#D5D0C7] focus:outline-none focus:ring-2 focus:ring-[#C00000] bg-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-[#6B6760] uppercase tracking-wide block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full h-[38px] rounded-lg px-3 pr-9 text-[14px] border border-[#D5D0C7] focus:outline-none focus:ring-2 focus:ring-[#C00000] bg-white"
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
            {error && <p className="text-[12px] text-[#C00000]">{error}</p>}
          </div>
          <div className="px-6 py-4 border-t border-[#E3E0D9] flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-[38px] px-4 bg-white border border-[#D5D0C7] text-[#1B1A17] text-[13px] font-medium rounded-lg hover:bg-[#F7F5F1] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-[38px] px-4 bg-[#C00000] hover:bg-[#A30000] text-white text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? 'Adding…' : 'Add user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
