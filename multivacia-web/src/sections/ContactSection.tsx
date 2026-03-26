import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'

export function ContactSection() {
  return (
    <section id="contato" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-mv-elevated/90 via-mv-void to-mv-void-deep shadow-[0_36px_96px_-52px_rgba(0,0,0,0.95)]">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_82%_12%,rgba(201,156,60,0.11),transparent_52%),radial-gradient(ellipse_60%_50%_at_12%_88%,rgba(28,78,126,0.32),transparent_50%)]"
              aria-hidden
            />
            <div className="mv-grain opacity-[0.05]" aria-hidden />
            <div
              className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-mv-gold/12 blur-3xl"
              aria-hidden
            />
            <div className="relative px-7 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-16">
              <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.26em] text-mv-gold/90 sm:text-[11px]">
                Próximo passo
              </p>
              <h2 className="mt-5 max-w-[22rem] font-heading text-[1.9rem] font-semibold leading-[1.12] tracking-[-0.025em] text-[#fafbfc] sm:max-w-2xl sm:text-[2.35rem] sm:leading-[1.1] md:text-4xl">
                Vamos conversar sobre a próxima fase da operação?
              </h2>
              <p className="mt-7 max-w-2xl text-[0.98rem] leading-[1.65] text-slate-500 sm:text-lg sm:leading-relaxed">
                Tecnologia e método só geram valor quando entram no ritmo da sua planta. Conheça o
                ecossistema Multivacia e veja como ARGOS, SGM, SGP e SPE se encaixam no que você já
                construiu na operação.
              </p>
              <div className="mt-12 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4">
                <ButtonLink href="mailto:contato@multivacia.com" variant="primary">
                  Falar conosco
                </ButtonLink>
                <ButtonLink href="#" variant="secondary">
                  Entrar
                </ButtonLink>
              </div>
              <p className="mt-12 text-xs text-slate-600">
                Contato:{' '}
                <a
                  href="mailto:contato@multivacia.com"
                  className="text-slate-500 underline-offset-4 transition-colors hover:text-slate-200 hover:underline"
                >
                  contato@multivacia.com
                </a>{' '}
                (institucional)
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
