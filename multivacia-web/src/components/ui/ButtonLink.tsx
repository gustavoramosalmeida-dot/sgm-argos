import type { ReactNode } from 'react'

type ButtonLinkProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'cta'
  className?: string
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mv-gold/80 active:scale-[0.99]'

const variants: Record<NonNullable<ButtonLinkProps['variant']>, string> = {
  primary:
    'px-6 py-3.5 bg-mv-gold text-mv-void shadow-[0_0_0_1px_rgba(201,156,60,0.28),0_10px_36px_-14px_rgba(201,156,60,0.42)] hover:bg-[#d4a94a] hover:shadow-[0_0_0_1px_rgba(212,169,74,0.35),0_14px_44px_-12px_rgba(201,156,60,0.48)]',
  cta:
    'px-5 py-2.5 bg-mv-gold text-mv-void text-[13px] tracking-[0.04em] shadow-[0_0_0_1px_rgba(201,156,60,0.32),0_6px_24px_-10px_rgba(201,156,60,0.5)] hover:bg-[#d4a94a] hover:shadow-[0_0_0_1px_rgba(212,169,74,0.4),0_8px_28px_-8px_rgba(201,156,60,0.55)]',
  secondary:
    'px-6 py-3.5 border border-white/[0.09] bg-mv-elevated/55 text-slate-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] hover:border-mv-navy-mid/40 hover:bg-mv-elevated/85 hover:text-white hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(62,123,170,0.15)]',
  ghost:
    'border border-transparent px-5 py-2.5 text-slate-200 hover:bg-white/[0.05]',
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${className}`.trim()}
    >
      {children}
    </a>
  )
}
