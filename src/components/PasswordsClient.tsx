'use client'

import { useState, useMemo } from 'react'
import {
  Eye, EyeOff, Copy, Lock, Plus, Pencil, Trash2, Check, Search,
} from 'lucide-react'
import {
  revealPasswordAction,
  deleteLoginAction,
  deleteAccountAction,
} from '@/app/actions/passwords'
import { LoginModal } from '@/components/modals/LoginModal'
import { AccountModal } from '@/components/modals/AccountModal'
import type { PasswordSystem, LoginRow, SharedAccountRow } from '@/lib/types'

interface Props {
  systems: PasswordSystem[]
  logins: LoginRow[]
  accounts: SharedAccountRow[]
}

export function PasswordsClient({ systems, logins, accounts }: Props) {
  const [activeView, setActiveView] = useState<'by-system' | 'shared'>('by-system')
  const [selectedSystemId, setSelectedSystemId] = useState<string>(systems[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [revealedPasswords, setRevealedPasswords] = useState<Map<string, string>>(new Map())
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [editingLogin, setEditingLogin] = useState<LoginRow | null>(null)
  const [editingAccount, setEditingAccount] = useState<SharedAccountRow | null>(null)
  const [deletingLoginId, setDeletingLoginId] = useState<string | null>(null)
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  function switchView(view: 'by-system' | 'shared') {
    setActiveView(view)
    setRevealedPasswords(new Map())
    setSearch('')
  }

  async function revealOne(id: string, kind: 'system_login' | 'shared_account') {
    if (revealedPasswords.has(id)) {
      setRevealedPasswords(prev => { const n = new Map(prev); n.delete(id); return n })
      return
    }
    setRevealingIds(prev => new Set(prev).add(id))
    const result = await revealPasswordAction(id, kind)
    setRevealingIds(prev => { const n = new Set(prev); n.delete(id); return n })
    if (result.password) {
      setRevealedPasswords(prev => new Map(prev).set(id, result.password!))
    }
  }

  async function copyValue(key: string, value: string) {
    await navigator.clipboard.writeText(value)
    setCopiedKey(key)
    // auto-clear clipboard after 30s
    setTimeout(() => navigator.clipboard.writeText('').catch(() => {}), 30_000)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  async function copyPassword(id: string, kind: 'system_login' | 'shared_account') {
    let pw = revealedPasswords.get(id)
    if (!pw) {
      const result = await revealPasswordAction(id, kind)
      if (!result.password) return
      pw = result.password
      setRevealedPasswords(prev => new Map(prev).set(id, pw!))
    }
    await copyValue(`${id}-pw`, pw)
  }

  async function revealAll(ids: string[], kind: 'system_login' | 'shared_account') {
    const unrevealed = ids.filter(id => !revealedPasswords.has(id))
    await Promise.all(unrevealed.map(id => revealOne(id, kind)))
  }

  function hideAll() {
    setRevealedPasswords(new Map())
  }

  // ----- by-system -----
  const systemCounts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const l of logins) c[l.system_id] = (c[l.system_id] ?? 0) + 1
    return c
  }, [logins])

  const systemLogins = useMemo(
    () => logins.filter(l => l.system_id === selectedSystemId),
    [logins, selectedSystemId]
  )

  const filteredLogins = useMemo(() => {
    if (!search) return systemLogins
    const q = search.toLowerCase()
    return systemLogins.filter(
      l =>
        l.first_name.toLowerCase().includes(q) ||
        (l.surname ?? '').toLowerCase().includes(q) ||
        (l.username ?? '').toLowerCase().includes(q)
    )
  }, [systemLogins, search])

  // ----- shared accounts -----
  const filteredAccounts = useMemo(() => {
    if (!search) return accounts
    const q = search.toLowerCase()
    return accounts.filter(
      a =>
        a.service.toLowerCase().includes(q) ||
        (a.username ?? '').toLowerCase().includes(q) ||
        (a.category ?? '').toLowerCase().includes(q) ||
        (a.owner ?? '').toLowerCase().includes(q)
    )
  }, [accounts, search])

  const visibleIds =
    activeView === 'by-system'
      ? filteredLogins.map(l => l.id)
      : filteredAccounts.map(a => a.id)

  const allRevealed =
    visibleIds.length > 0 && visibleIds.every(id => revealedPasswords.has(id))

  const selectedSystem = systems.find(s => s.id === selectedSystemId)

  return (
    <>
      {/* ---- Page ---- */}
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-[27px] font-semibold tracking-[-0.01em]"
                style={{ color: '#1B1A17' }}
              >
                Password register
              </h1>
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[.08em] font-mono"
                style={{ backgroundColor: '#FBEAE8', color: '#A82018' }}
              >
                <Lock size={11} />
                IT admin only
              </span>
            </div>
            <p className="text-[13px] mt-1" style={{ color: '#6B6760' }}>
              Per-person system logins and shared company accounts. Passwords are hidden until you
              reveal them.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => (allRevealed ? hideAll() : revealAll(visibleIds, activeView === 'by-system' ? 'system_login' : 'shared_account'))}
              className="flex items-center gap-2 px-3 py-[9px] rounded-[8px] text-[13px] font-medium transition-colors"
              style={{ backgroundColor: '#fff', color: '#1B1A17', border: '1px solid #D5D0C7' }}
            >
              {allRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
              {allRevealed ? 'Hide all' : 'Reveal all'}
            </button>
            <button
              onClick={() => {
                if (activeView === 'by-system') setShowLoginModal(true)
                else setShowAccountModal(true)
              }}
              className="flex items-center gap-2 px-3 py-[9px] rounded-[8px] text-[13px] font-semibold transition-colors"
              style={{ backgroundColor: '#C00000', color: '#fff' }}
            >
              <Plus size={14} />
              {activeView === 'by-system' ? 'Add login' : 'Add account'}
            </button>
          </div>
        </div>

        {/* Segmented control + search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center p-[3px] rounded-[9px]"
            style={{ backgroundColor: '#E7E3DB' }}
          >
            {(['by-system', 'shared'] as const).map((v) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className="px-4 py-[7px] rounded-[7px] text-[13px] font-semibold transition-all"
                style={
                  activeView === v
                    ? {
                        backgroundColor: '#fff',
                        color: '#1B1A17',
                        boxShadow: '0 1px 4px rgba(0,0,0,.12)',
                      }
                    : { color: '#6B6760' }
                }
              >
                {v === 'by-system' ? 'By system' : 'Shared accounts'}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#9C968B' }}
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={activeView === 'by-system' ? 'Search by name or username…' : 'Search service, category…'}
              className="w-full pl-9 pr-3 py-[9px] text-[14px] rounded-[8px] outline-none bg-white border"
              style={{ borderColor: '#D5D0C7', color: '#1B1A17' }}
            />
          </div>
        </div>

        {/* ---- By system ---- */}
        {activeView === 'by-system' && (
          <div className="grid gap-5" style={{ gridTemplateColumns: '260px minmax(0,1fr)' }}>
            {/* System sidebar */}
            <div className="flex flex-col gap-2">
              {systems.map(sys => {
                const active = sys.id === selectedSystemId
                return (
                  <button
                    key={sys.id}
                    onClick={() => {
                      setSelectedSystemId(sys.id)
                      setRevealedPasswords(new Map())
                    }}
                    className="flex items-center justify-between px-4 py-3 rounded-[10px] text-left transition-colors"
                    style={
                      active
                        ? { backgroundColor: '#1B1A17', color: '#fff' }
                        : {
                            backgroundColor: '#fff',
                            color: '#1B1A17',
                            border: '1px solid #E8E5DE',
                          }
                    }
                  >
                    <div>
                      <div className="text-[14px] font-semibold">{sys.name}</div>
                      {sys.subtitle && (
                        <div
                          className="text-[11px] mt-0.5"
                          style={{ color: active ? '#B5B2AA' : '#9C968B' }}
                        >
                          {sys.subtitle}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[12px] font-mono font-semibold ml-3 shrink-0"
                      style={{ color: active ? '#B5B2AA' : '#9C968B' }}
                    >
                      {systemCounts[sys.id] ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Login table */}
            <div
              className="bg-white rounded-[12px] overflow-hidden self-start"
              style={{ border: '1px solid #E3E0D9' }}
            >
              {/* Table header strip */}
              <div
                className="px-5 py-3"
                style={{ backgroundColor: '#F7F5F1', borderBottom: '1px solid #F0EEE9' }}
              >
                <div className="text-[13px] font-semibold" style={{ color: '#1B1A17' }}>
                  {selectedSystem?.name}
                  {selectedSystem?.subtitle && (
                    <span className="font-normal ml-2" style={{ color: '#9C968B' }}>
                      · {selectedSystem.subtitle} · {systemLogins.length}{' '}
                      {systemLogins.length === 1 ? 'user' : 'users'}
                    </span>
                  )}
                </div>
              </div>

              {/* Column labels */}
              <div
                className="grid px-5 py-2"
                style={{
                  gridTemplateColumns: '1.3fr 1.3fr 2fr 1.6fr 80px',
                  gap: '14px',
                  borderBottom: '1px solid #F0EEE9',
                }}
              >
                {['Name', 'Surname', 'Username', 'Password', ''].map(h => (
                  <span
                    key={h}
                    className="text-[11px] font-semibold uppercase tracking-[.1em] font-mono"
                    style={{ color: '#9C968B' }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {filteredLogins.length === 0 ? (
                <div className="px-5 py-10 text-center text-[13px]" style={{ color: '#9C968B' }}>
                  {search ? 'No matches.' : 'No logins added yet.'}
                </div>
              ) : (
                filteredLogins.map(login => {
                  const pw = revealedPasswords.get(login.id)
                  const revealing = revealingIds.has(login.id)
                  return (
                    <div
                      key={login.id}
                      className="grid px-5 transition-colors hover:bg-[#FAFAF8]"
                      style={{
                        gridTemplateColumns: '1.3fr 1.3fr 2fr 1.6fr 80px',
                        gap: '14px',
                        paddingTop: '13px',
                        paddingBottom: '13px',
                        borderBottom: '1px solid #F0EEE9',
                        alignItems: 'center',
                      }}
                    >
                      <span className="text-[14px] font-medium" style={{ color: '#1B1A17' }}>
                        {login.first_name}
                      </span>
                      <span className="text-[14px]" style={{ color: '#1B1A17' }}>
                        {login.surname ?? '—'}
                      </span>

                      {/* Username */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="text-[13px] font-mono truncate"
                          style={{ color: '#6B6760' }}
                        >
                          {login.username ?? '—'}
                        </span>
                        {login.username && (
                          <CopyBtn
                            done={copiedKey === `${login.id}-user`}
                            onClick={() => copyValue(`${login.id}-user`, login.username!)}
                          />
                        )}
                      </div>

                      {/* Password */}
                      <div className="flex items-center gap-1.5 font-mono text-[13px]" style={{ color: '#1B1A17' }}>
                        <span>{revealing ? '…' : pw ?? '••••••••'}</span>
                        <EyeBtn
                          revealed={!!pw}
                          pending={revealing}
                          onClick={() => revealOne(login.id, 'system_login')}
                        />
                        <CopyBtn
                          done={copiedKey === `${login.id}-pw`}
                          onClick={() => copyPassword(login.id, 'system_login')}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <ActionBtn
                          icon={<Pencil size={13} />}
                          onClick={() => setEditingLogin(login)}
                          label="Edit"
                        />
                        {deletingLoginId === login.id ? (
                          <ConfirmDeleteInline
                            onConfirm={async () => {
                              const r = await deleteLoginAction(login.id)
                              if (r?.error) setDeleteError(r.error)
                              setDeletingLoginId(null)
                            }}
                            onCancel={() => setDeletingLoginId(null)}
                          />
                        ) : (
                          <ActionBtn
                            icon={<Trash2 size={13} />}
                            onClick={() => setDeletingLoginId(login.id)}
                            label="Delete"
                            danger
                          />
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ---- Shared accounts ---- */}
        {activeView === 'shared' && (
          <>
            {filteredAccounts.length === 0 ? (
              <div
                className="bg-white rounded-[12px] flex flex-col items-center justify-center py-20 gap-3"
                style={{ border: '1px solid #E3E0D9' }}
              >
                <p className="text-[14px]" style={{ color: '#9C968B' }}>
                  {search ? 'No accounts match your search.' : 'No shared accounts added yet.'}
                </p>
                {!search && (
                  <button
                    onClick={() => setShowAccountModal(true)}
                    className="text-[13px] font-medium px-4 py-2 rounded-[7px]"
                    style={{ backgroundColor: '#C00000', color: '#fff' }}
                  >
                    Add account →
                  </button>
                )}
              </div>
            ) : (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))' }}
              >
                {filteredAccounts.map(acc => {
                  const pw = revealedPasswords.get(acc.id)
                  const revealing = revealingIds.has(acc.id)
                  return (
                    <div
                      key={acc.id}
                      className="bg-white rounded-[12px] p-[18px] flex flex-col gap-4"
                      style={{ border: '1px solid #E3E0D9' }}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[16px] font-semibold" style={{ color: '#1B1A17' }}>
                            {acc.service}
                          </div>
                          {acc.url && (
                            <div className="text-[11px] font-mono mt-0.5" style={{ color: '#9C968B' }}>
                              {acc.url}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {acc.category && (
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-full font-mono"
                              style={{ backgroundColor: '#F0EEE9', color: '#6B6760' }}
                            >
                              {acc.category}
                            </span>
                          )}
                          <ActionBtn
                            icon={<Pencil size={13} />}
                            onClick={() => setEditingAccount(acc)}
                            label="Edit"
                          />
                          {deletingAccountId === acc.id ? (
                            <ConfirmDeleteInline
                              onConfirm={async () => {
                                const r = await deleteAccountAction(acc.id)
                                if (r?.error) setDeleteError(r.error)
                                setDeletingAccountId(null)
                              }}
                              onCancel={() => setDeletingAccountId(null)}
                            />
                          ) : (
                            <ActionBtn
                              icon={<Trash2 size={13} />}
                              onClick={() => setDeletingAccountId(acc.id)}
                              label="Delete"
                              danger
                            />
                          )}
                        </div>
                      </div>

                      {/* Username */}
                      <div>
                        <div
                          className="text-[10px] font-semibold uppercase tracking-[.1em] font-mono mb-1"
                          style={{ color: '#9C968B' }}
                        >
                          Username
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[13px]" style={{ color: '#6B6760' }}>
                          <span className="truncate">{acc.username ?? '—'}</span>
                          {acc.username && (
                            <CopyBtn
                              done={copiedKey === `${acc.id}-user`}
                              onClick={() => copyValue(`${acc.id}-user`, acc.username!)}
                            />
                          )}
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <div
                          className="text-[10px] font-semibold uppercase tracking-[.1em] font-mono mb-1"
                          style={{ color: '#9C968B' }}
                        >
                          Password
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[13px]" style={{ color: '#1B1A17' }}>
                          <span>{revealing ? '…' : pw ?? '••••••••'}</span>
                          <EyeBtn
                            revealed={!!pw}
                            pending={revealing}
                            onClick={() => revealOne(acc.id, 'shared_account')}
                          />
                          <CopyBtn
                            done={copiedKey === `${acc.id}-pw`}
                            onClick={() => copyPassword(acc.id, 'shared_account')}
                          />
                        </div>
                      </div>

                      {/* Footer */}
                      {(acc.owner || acc.notes) && (
                        <div
                          className="flex items-center gap-2 pt-3 text-[12px]"
                          style={{ borderTop: '1px solid #F0EEE9', color: '#9C968B' }}
                        >
                          {acc.owner && (
                            <>
                              <span
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold shrink-0"
                                style={{ backgroundColor: '#6B6760' }}
                              >
                                {acc.owner.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                              </span>
                              <span>
                                Held by <strong style={{ color: '#3D3A35' }}>{acc.owner}</strong>
                              </span>
                            </>
                          )}
                          {acc.notes && <span className="truncate">{acc.notes}</span>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {deleteError && (
          <div
            className="text-[13px] px-4 py-3 rounded-[8px]"
            style={{ backgroundColor: '#FBEAE8', color: '#A82018' }}
          >
            {deleteError}
          </div>
        )}
      </div>

      {/* ---- Modals ---- */}
      {(showLoginModal || editingLogin) && (
        <LoginModal
          systems={systems}
          defaultSystemId={selectedSystemId}
          login={editingLogin ?? undefined}
          onClose={() => { setShowLoginModal(false); setEditingLogin(null) }}
        />
      )}
      {(showAccountModal || editingAccount) && (
        <AccountModal
          account={editingAccount ?? undefined}
          onClose={() => { setShowAccountModal(false); setEditingAccount(null) }}
        />
      )}
    </>
  )
}

// ---- Small shared controls ----

function EyeBtn({
  revealed,
  pending,
  onClick,
}: {
  revealed: boolean
  pending: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] shrink-0 transition-colors"
      style={{ backgroundColor: '#F2F0EB', color: '#6B6760' }}
      title={revealed ? 'Hide' : 'Reveal'}
    >
      {pending ? (
        <span className="text-[10px] font-mono">…</span>
      ) : revealed ? (
        <EyeOff size={13} />
      ) : (
        <Eye size={13} />
      )}
    </button>
  )
}

function CopyBtn({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] shrink-0 transition-colors"
      style={{ backgroundColor: '#F2F0EB', color: done ? '#1B7A4B' : '#6B6760' }}
      title="Copy"
    >
      {done ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

function ActionBtn({
  icon,
  onClick,
  label,
  danger,
}: {
  icon: React.ReactNode
  onClick: () => void
  label: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-[26px] h-[26px] rounded-[6px] shrink-0 transition-colors"
      style={{
        backgroundColor: '#F2F0EB',
        color: danger ? '#A82018' : '#6B6760',
      }}
      title={label}
    >
      {icon}
    </button>
  )
}

function ConfirmDeleteInline({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onConfirm}
        className="px-2 py-0.5 rounded-[5px] text-[11px] font-semibold"
        style={{ backgroundColor: '#C00000', color: '#fff' }}
      >
        Delete
      </button>
      <button
        onClick={onCancel}
        className="px-2 py-0.5 rounded-[5px] text-[11px] font-semibold"
        style={{ backgroundColor: '#F2F0EB', color: '#6B6760' }}
      >
        ✕
      </button>
    </div>
  )
}
