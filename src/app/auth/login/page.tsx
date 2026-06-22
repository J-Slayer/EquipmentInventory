'use client'

import Image from 'next/image'
import { useState, useTransition } from 'react'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#EDEBE6' }}
    >
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/ts-lockup-light.png"
            alt="Terra Strata"
            width={160}
            height={48}
            className="h-10 w-auto"
          />
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-[12px] overflow-hidden"
          style={{ border: '1px solid #E3E0D9', boxShadow: '0 1px 3px rgba(20,18,15,.05)' }}
        >
          <div className="px-7 pt-7 pb-6">
            <h1 className="text-[20px] font-semibold mb-1" style={{ color: '#1B1A17' }}>
              Asset Register
            </h1>
            <p className="text-[13px]" style={{ color: '#6B6760' }}>
              Sign in to manage equipment and contracts.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-7 pb-7 flex flex-col gap-4">
            {error && (
              <div
                className="text-[13px] px-3 py-2 rounded-[7px]"
                style={{ backgroundColor: '#FBEAE8', color: '#A82018' }}
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-[7px]">
              <label
                htmlFor="email"
                className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono"
                style={{ color: '#6B6760' }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-[13px] py-[11px] text-[14px] rounded-[8px] outline-none transition-colors"
                style={{
                  border: '1px solid #D5D0C7',
                  color: '#1B1A17',
                  backgroundColor: '#fff',
                }}
              />
            </div>

            <div className="flex flex-col gap-[7px]">
              <label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-[.08em] font-mono"
                style={{ color: '#6B6760' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-[13px] py-[11px] text-[14px] rounded-[8px] outline-none transition-colors"
                style={{
                  border: '1px solid #D5D0C7',
                  color: '#1B1A17',
                  backgroundColor: '#fff',
                }}
              />
            </div>

            <Button type="submit" className="w-full mt-1" disabled={isPending}>
              {isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
