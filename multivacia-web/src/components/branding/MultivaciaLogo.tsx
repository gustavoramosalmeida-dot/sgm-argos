import { MultivaciaMark } from '@/components/branding/MultivaciaMark'

type MultivaciaLogoProps = {
  className?: string
}

export function MultivaciaLogo({ className = '' }: MultivaciaLogoProps) {
  return (
    <a
      href="#inicio"
      className={`group flex min-w-0 items-center gap-3 rounded-xl py-1 pr-1 transition-[opacity] duration-200 sm:gap-3.5 ${className}`.trim()}
    >
      <span className="relative flex shrink-0 rounded-xl p-0.5 ring-1 ring-white/[0.06] transition-[box-shadow,ring-color] duration-200 group-hover:ring-mv-navy-mid/35 group-hover:shadow-[0_0_24px_-8px_rgba(62,123,170,0.35)]">
        <MultivaciaMark decorative className="h-9 w-9 sm:h-10 sm:w-10" />
      </span>
      <span className="min-w-0 text-left leading-tight">
        <span className="block font-heading text-[12px] font-semibold uppercase tracking-[0.2em] text-white transition-colors duration-200 group-hover:text-slate-100 sm:text-[13px]">
          MULTIVACIA
        </span>
        <span className="mt-1 hidden max-w-[16rem] text-[9px] font-medium uppercase leading-snug tracking-[0.2em] text-slate-500 sm:block">
          Laboratório de soluções digitais
        </span>
      </span>
    </a>
  )
}
