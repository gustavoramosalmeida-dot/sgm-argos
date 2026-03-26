import { MultivaciaMark } from '@/components/branding/MultivaciaMark'

const footerLinks = [
  { label: 'ARGOS', href: '#argos' },
  { label: 'SGM', href: '#sgm' },
  { label: 'SGP', href: '#sgp' },
  { label: 'SPE', href: '#spe' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-mv-elevated/[0.28]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <MultivaciaMark decorative className="h-11 w-11 shrink-0 opacity-90" />
            <div>
              <p className="font-heading text-sm font-semibold uppercase tracking-[0.18em] text-white">
                MULTIVACIA
              </p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Laboratório de soluções digitais para a operação industrial.
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
                Ecossistema integrado — ARGOS, SGM, SGP e SPE — para gestão de máquinas, produção,
                planejamento e inteligência aplicada ao chão de fábrica.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {footerLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-slate-500 transition-colors duration-200 hover:text-mv-gold"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.06] pt-8 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <a
              href="mailto:contato@multivacia.com"
              className="text-slate-500 transition-colors hover:text-white"
            >
              contato@multivacia.com
            </a>
          </p>
          <p>© {new Date().getFullYear()} Multivacia. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
