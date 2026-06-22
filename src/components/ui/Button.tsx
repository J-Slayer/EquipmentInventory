import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon'
  size?: 'sm' | 'md'
}

const VARIANTS = {
  primary:     'bg-[#C00000] text-white hover:bg-[#A30000] border border-transparent',
  secondary:   'bg-white text-[#1B1A17] border border-[#D5D0C7] hover:bg-[#F7F5F1]',
  ghost:       'bg-transparent text-[#1B1A17] border border-transparent hover:bg-[#F7F5F1]',
  destructive: 'bg-white text-[#C00000] border border-[#E8C9C9] hover:bg-[#FFF5F5]',
  icon:        'w-[38px] h-[38px] bg-white text-[#6B6760] border border-[#E3E0D9] rounded-[8px] hover:bg-[#F7F5F1]',
}

const SIZES = {
  sm: 'px-[10px] py-[7px] text-[13px]',
  md: 'px-[18px] py-[11px] text-[14px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-[7px] transition-colors cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        variant !== 'icon' ? SIZES[size] : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
