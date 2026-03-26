import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'

const flow = [
  { code: 'ARGOS', label: 'Contexto' },
  { code: 'SGM', label: 'Ativos' },
  { code: 'SGP', label: 'Execução' },
  { code: 'SPE', label: 'Planejamento' },
]

export function ProofSection() {
  return (
    <section id="prova" className="relative border-b border-white/[0.05] py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 72% 28%, rgba(62, 123, 170, 0.1), transparent 55%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Operação real"
            title="Software que nasce do chão de fábrica"
            description="Padronização, rastreio e acompanhamento da execução: o que construímos parte dos problemas reais da planta e volta para o turno — não para o slide."
          />
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-10">
          <Reveal className="lg:col-span-7">
            <div className="relative h-full">
              <div
                className="pointer-events-none absolute -inset-px rounded-[1.15rem] bg-gradient-to-br from-mv-navy-mid/18 via-transparent to-mv-gold/10 opacity-80 blur-[1px]"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-mv-elevated/88 via-mv-void/96 to-mv-void-deep shadow-[0_28px_72px_-44px_rgba(0,0,0,0.92),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] px-5 py-4 sm:px-7 sm:py-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mv-gold/85 sm:text-[11px]">
                      Leitura do ecossistema
                    </p>
                    <p className="mt-1.5 font-heading text-sm font-medium text-slate-100">
                      Do ativo ao planejamento
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-mv-navy-mid/35 bg-mv-navy-deep/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                    Ilustração
                  </span>
                </div>

                <div className="relative px-5 py-8 sm:px-7 sm:py-10">
                  <div className="mv-mesh-circuit absolute inset-0 opacity-[0.2]" aria-hidden />
                  <div className="relative flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-0 sm:rounded-xl sm:border sm:border-white/[0.05] sm:bg-mv-void/35 sm:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
                      {flow.map((step, idx) => (
                        <div
                          key={step.code}
                          className={`flex flex-col items-center px-2 py-2 text-center sm:border-white/[0.05] sm:py-4 ${
                            idx > 0 ? 'border-t border-white/[0.05] sm:border-t-0 sm:border-l' : ''
                          }`}
                        >
                          <div className="w-full rounded-lg border border-white/[0.06] bg-mv-void/65 px-3 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:border-0 sm:bg-transparent sm:shadow-none">
                            <p className="font-heading text-[13px] font-semibold tracking-wide text-[#f1f5f9]">
                              {step.code}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">{step.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-center text-[11px] leading-relaxed text-slate-500 sm:-mt-1 sm:pt-1">
                      Camadas do ecossistema em sequência conceitual — não indica fluxo de dados em
                      tempo real.
                    </p>
                    <div className="relative h-28 overflow-hidden rounded-xl border border-white/[0.05] bg-mv-elevated/28">
                      <div className="absolute inset-0 bg-gradient-to-t from-mv-void/92 via-transparent to-transparent" />
                      <svg
                        className="absolute inset-x-4 bottom-6 h-16 w-[calc(100%-2rem)] text-mv-navy-mid/75"
                        viewBox="0 0 400 80"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M0 52 Q 50 20 100 44 T 200 36 T 300 48 T 400 28"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          opacity="0.45"
                        />
                        <path
                          d="M0 60 Q 80 40 160 52 T 320 44 L 400 50"
                          stroke="url(#mvWaveProof)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.8"
                        />
                        <defs>
                          <linearGradient id="mvWaveProof" x1="0" y1="0" x2="400" y2="0">
                            <stop stopColor="#3e7baa" />
                            <stop offset="0.5" stopColor="#c99c3c" stopOpacity="0.75" />
                            <stop offset="1" stopColor="#1c4e7e" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <p className="absolute left-5 top-4 max-w-[15rem] text-[11px] leading-relaxed text-slate-500">
                        Ilustração de ritmo — não é série de dados operacional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-5 lg:col-span-5">
            <Reveal delayMs={80}>
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-mv-elevated/28 p-6 shadow-[0_18px_52px_-38px_rgba(0,0,0,0.88)] sm:p-7">
                <div
                  className="pointer-events-none absolute -right-12 top-8 h-32 w-32 rounded-full bg-mv-navy-deep/26 blur-3xl"
                  aria-hidden
                />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mv-navy-mid sm:text-[11px]">
                  Turno e linha
                </p>
                <p className="mt-2 font-heading text-base font-semibold text-[#f1f5f9]">
                  Andamento da execução
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    { line: 'Linha A', state: 'Em processo', layer: 'SGP' },
                    { line: 'Linha B', state: 'Setup', layer: 'SPE' },
                    { line: 'Linha C', state: 'Pausa planejada', layer: 'SGM' },
                  ].map((row) => (
                    <div
                      key={row.line}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-mv-void/50 px-3.5 py-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-200">{row.line}</p>
                        <p className="text-xs text-slate-500">{row.state}</p>
                      </div>
                      <span className="shrink-0 rounded-md border border-white/[0.06] bg-mv-elevated/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {row.layer}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={140}>
              <div className="relative overflow-hidden rounded-2xl border border-mv-navy-mid/22 bg-gradient-to-br from-mv-navy-deep/22 via-mv-void/38 to-transparent p-6 sm:p-7">
                <div className="absolute right-4 top-4 h-16 w-16 rounded-full border border-mv-gold/12 opacity-50" aria-hidden />
                <p className="relative text-sm leading-relaxed text-slate-400">
                  Informação na ordem certa para quem opera: menos ruído no meio do turno, mais clareza
                  sobre o que precisa de atenção agora.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
