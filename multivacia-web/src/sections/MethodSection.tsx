import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { methodBlocks } from '@/data/method'

export function MethodSection() {
  return (
    <section
      id="metodo"
      className="relative border-b border-white/[0.05] bg-gradient-to-b from-mv-void via-mv-elevated/[0.06] to-mv-void py-20 sm:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 22% 85%, rgba(201, 156, 60, 0.05), transparent 55%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Método"
            title="Da visibilidade à melhoria contínua"
            description="As plataformas sustentam uma linha de raciocínio operacional: ver com clareza, executar com registro, coordenar o plano e evoluir com inteligência — sempre ancorado no que acontece na planta."
          />
        </Reveal>

        <Reveal delayMs={60} className="mt-16">
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(145deg,rgba(16,24,36,0.65)_0%,rgba(11,18,32,0.85)_100%)] shadow-[0_24px_72px_-48px_rgba(0,0,0,0.95)]">
            <div
              className="pointer-events-none absolute left-1/2 top-8 bottom-8 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-mv-gold/15 to-transparent md:block"
              aria-hidden
            />
            <div className="pointer-events-none absolute left-8 right-8 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent md:block" aria-hidden />
            <div className="grid md:grid-cols-2 md:divide-x md:divide-white/[0.05]">
              {methodBlocks.map((block, i) => (
                <article
                  key={block.title}
                  className={`relative p-7 sm:p-9 ${
                    i < 2 ? 'border-b border-white/[0.05] md:border-b-0' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div
                      className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-mv-gold/22 bg-mv-gold/[0.05] font-heading text-[11px] font-bold tabular-nums text-mv-gold/95"
                      aria-hidden
                    >
                      {(i + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading text-[1.05rem] font-semibold tracking-tight text-[#f1f5f9] sm:text-lg">
                        {block.title}
                      </h3>
                      <p className="mt-3 text-[0.9rem] leading-relaxed text-slate-500">
                        {block.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={120} className="mt-10">
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-mv-void/40 px-6 py-10 text-center sm:px-10">
            <p className="text-sm leading-relaxed text-slate-500">
              Área reservada para diagrama do método operacional — evolução em fases futuras.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
