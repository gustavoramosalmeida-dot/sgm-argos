import { MultivaciaMark } from '@/components/branding/MultivaciaMark'
import { ButtonLink } from '@/components/ui/ButtonLink'

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden border-b border-white/[0.05] pt-[5.5rem] pb-28 sm:pt-[7rem] sm:pb-36"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-mv-void-deep via-mv-void to-[#0a101c]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 85% 60% at 12% 18%, rgba(28, 78, 126, 0.38), transparent 55%), radial-gradient(ellipse 65% 50% at 88% 72%, rgba(62, 123, 170, 0.14), transparent 52%), radial-gradient(ellipse 45% 35% at 50% 100%, rgba(201, 156, 60, 0.06), transparent 50%)',
        }}
      />
      <div className="mv-mesh-circuit pointer-events-none absolute inset-0 opacity-[0.75]" aria-hidden />
      <div className="mv-hex-soft pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light" aria-hidden />
      <div className="mv-grain" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_50%,rgba(0,0,0,0)_0%,rgba(7,11,18,0.5)_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-[42rem] lg:max-w-[46rem] mv-hero-enter">
          {/* Assinatura institucional — portal Multivacia */}
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-5 shadow-[0_24px_64px_-40px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.07)] backdrop-blur-[6px] sm:p-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <span className="relative shrink-0 rounded-xl p-0.5 ring-1 ring-white/[0.08]">
                <MultivaciaMark decorative className="h-[3.25rem] w-[3.25rem] sm:h-[4rem] sm:w-[4rem]" />
              </span>
              <div className="min-w-0 border-l border-white/[0.1] pl-4 sm:pl-5">
                <p className="font-heading text-[12px] font-semibold uppercase tracking-[0.24em] text-[#f8fafc] sm:text-[13px]">
                  MULTIVACIA
                </p>
                <p className="mt-2 text-[10px] font-medium uppercase leading-relaxed tracking-[0.18em] text-slate-500 sm:text-[11px] sm:tracking-[0.2em]">
                  Laboratório de soluções digitais
                </p>
              </div>
            </div>
          </div>

          {/* Destaque ARGOS — plataforma principal */}
          <div className="mt-12 flex items-center gap-4 sm:mt-14">
            <span className="h-px w-12 bg-gradient-to-r from-mv-gold/70 via-mv-gold/35 to-transparent sm:w-16" aria-hidden />
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.36em] text-mv-gold/95 sm:text-[11px]">
              ARGOS
            </p>
          </div>
          <h1 className="mt-5 font-heading text-[clamp(2.15rem,4.8vw,3.65rem)] font-bold leading-[1.06] tracking-[-0.035em] text-[#fafbfc]">
            Plataforma de execução e resultado
          </h1>
          <p className="mt-8 text-[1.02rem] font-normal leading-[1.65] text-slate-400 sm:text-[1.125rem] sm:leading-[1.7]">
            A Multivacia reúne gestão de máquinas, produção, planejamento e inteligência aplicada
            num mesmo ecossistema — para que a rotina do chão de fábrica vire informação, padrão e
            decisão, e não só urgência do dia.
          </p>
          <div className="mt-12 flex flex-col gap-3.5 sm:mt-14 sm:flex-row sm:items-center sm:gap-4">
            <ButtonLink href="#ecossistema" variant="primary">
              Conhecer o ecossistema
            </ButtonLink>
            <ButtonLink href="#" variant="secondary">
              Entrar
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
