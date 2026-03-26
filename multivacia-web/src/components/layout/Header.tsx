import { useEffect, useState } from 'react'
import { MultivaciaLogo } from '@/components/branding/MultivaciaLogo'
import { ButtonLink } from '@/components/ui/ButtonLink'

const navItems = [
  { label: 'ARGOS', href: '#argos' },
  { label: 'SGM', href: '#sgm' },
  { label: 'SGP', href: '#sgp' },
  { label: 'SPE', href: '#spe' },
  { label: 'Contato', href: '#contato' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ease-out ${
        scrolled
          ? 'border-white/[0.09] bg-mv-void/[0.94] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.82)] backdrop-blur-xl backdrop-saturate-150'
          : 'border-white/[0.05] bg-mv-void/72 backdrop-blur-lg'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-mv-gold/20 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex min-h-[3.65rem] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <MultivaciaLogo />

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Principal">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative rounded-lg px-3 py-2 text-[13px] font-medium text-slate-500 transition-colors duration-200 hover:text-slate-100"
            >
              <span className="relative z-10">{item.label}</span>
              <span
                className="absolute inset-x-2.5 -bottom-px h-px scale-x-0 bg-gradient-to-r from-transparent via-mv-gold/60 to-transparent opacity-0 transition-[transform,opacity] duration-200 ease-out group-hover:scale-x-100 group-hover:opacity-100"
                aria-hidden
              />
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2.5">
          <ButtonLink href="#" variant="cta" className="hidden sm:inline-flex">
            Entrar
          </ButtonLink>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-mv-elevated/35 text-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-mv-navy-mid/35 hover:bg-mv-elevated/65 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
                <path fill="currentColor" d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className="border-t border-white/[0.06] bg-mv-void/[0.98] px-4 py-4 shadow-[0_20px_48px_-16px_rgba(0,0,0,0.88)] backdrop-blur-xl md:hidden"
        >
          <nav className="flex flex-col gap-0.5" aria-label="Mobile">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <ButtonLink href="#" variant="cta" className="mt-3 w-full sm:hidden">
              Entrar
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
