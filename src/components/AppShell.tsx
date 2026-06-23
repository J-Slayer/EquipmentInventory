'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings } from 'lucide-react'

interface AppShellProps {
  children: React.ReactNode
  contractsBadge?: number
  adminInitials?: string
}

export function AppShell({ children, contractsBadge = 0, adminInitials = 'PV' }: AppShellProps) {
  const pathname = usePathname()

  const navItems = [
    { label: 'Equipment', href: '/equipment' },
    { label: 'Register', href: '/register' },
    { label: 'People', href: '/people' },
    { label: 'Contracts', href: '/contracts', badge: contractsBadge > 0 ? contractsBadge : undefined },
    { label: 'Passwords', href: '/passwords' },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDEBE6' }}>
      <header className="sticky top-0 z-40 bg-white" style={{ borderBottom: '1px solid #E0DCD3' }}>
        <div
          className="max-w-[1180px] mx-auto px-6 flex items-center gap-8"
          style={{ paddingTop: '13px', paddingBottom: '13px' }}
        >
          {/* Logo */}
          <Link href="/equipment" className="flex items-center gap-2 shrink-0">
            <Image
              src="/assets/ts-mono.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-auto"
            />
            <span className="text-[15px] font-semibold" style={{ color: '#1B1A17' }}>
              terra strata
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1 flex-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-1.5 px-3 py-2 text-[14px] font-medium transition-colors rounded-[6px]"
                  style={{ color: isActive ? '#1B1A17' : '#6B6760' }}
                >
                  {item.label}
                  {item.badge !== undefined && (
                    <span
                      className="flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-white text-[11px] font-bold"
                      style={{ backgroundColor: '#C00000' }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                      style={{ backgroundColor: '#C00000' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/settings"
              className="flex items-center justify-center w-[38px] h-[38px] bg-white rounded-[8px] transition-colors hover:bg-[#F7F5F1]"
              style={{ border: '1px solid #E3E0D9', color: '#6B6760' }}
              aria-label="Settings"
            >
              <Settings size={16} />
            </Link>
            <div
              className="flex items-center justify-center w-[38px] h-[38px] rounded-full text-white text-[13px] font-bold select-none cursor-default"
              style={{ backgroundColor: '#1B1A17' }}
              title="Admin"
            >
              {adminInitials}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-6 py-8 pb-20">
        {children}
      </main>
    </div>
  )
}
