import { SectionHeading } from '@/components/ui/SectionHeading'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { EcosystemGlyph } from '@/components/ui/EcosystemGlyph'
import { Reveal } from '@/components/ui/Reveal'
import { ecosystemProducts } from '@/data/ecosystem'

export function EcosystemSection() {
  return (
    <section
      id="ecossistema"
      className="relative border-b border-white/[0.05] bg-gradient-to-b from-mv-void via-[#0c1422] to-mv-void py-20 sm:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 50% 38% at 50% 0%, rgba(28, 78, 126, 0.22), transparent 58%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Ecossistema"
            title="Um ecossistema que cobre a operação de ponta a ponta"
            description="Cada plataforma responde por uma camada: ativos, produção, planejamento e inteligência. Juntas, deixam a fábrica mais visível, disciplinada e inteligível — sem ferramentas soltas que não conversam entre si."
          />
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-5">
          {ecosystemProducts.map((p, i) => (
            <Reveal key={p.id} delayMs={i * 50}>
              <article
                id={p.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-b from-mv-elevated/40 to-mv-void/90 p-6 sm:p-7 shadow-[0_20px_56px_-36px_rgba(0,0,0,0.92)] transition-[transform,box-shadow,border-color] duration-300 ease-out before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/[0.035] before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100 hover:-translate-y-0.5 hover:border-mv-navy-mid/30 hover:shadow-[0_28px_64px_-32px_rgba(28,78,126,0.28)]"
              >
                <div
                  className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-mv-gold/75 via-mv-gold/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden
                />
                <div className="flex items-start justify-between gap-3">
                  <EcosystemGlyph productId={p.id} />
                  <span className="rounded-full border border-white/[0.08] bg-mv-gold/[0.06] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-mv-gold/90">
                    {p.tag}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-[1.05rem] font-semibold tracking-tight text-[#f1f5f9] sm:text-lg">
                  {p.name}
                </h3>
                <p className="mt-3 flex-1 text-[0.9rem] leading-relaxed text-slate-500">
                  {p.description}
                </p>
                <ButtonLink
                  href={p.moreHref}
                  variant="ghost"
                  className="mt-8 -ml-2 self-start border-0 px-2 py-1.5 text-[13px] font-medium text-mv-gold/90 transition-colors hover:bg-transparent hover:text-mv-gold"
                >
                  Saiba mais →
                </ButtonLink>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
