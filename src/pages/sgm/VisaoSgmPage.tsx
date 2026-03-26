/** Arte da roda 5S: troque por `sgm-5s-wheel.png` (ou outro nome) e ajuste o import quando a imagem oficial estiver em `src/assets/`. */
import sgm5sWheel from '@/assets/sgm-5s-wheel.svg';

const fiveS = [
  {
    name: 'Seiri',
    label: 'Utilização',
    text: 'Mapear apenas os pontos e ativos realmente relevantes para a operação.',
  },
  {
    name: 'Seiton',
    label: 'Ordenação',
    text: 'Organizar visualmente máquinas, componentes e QR points com contexto claro.',
  },
  {
    name: 'Seiso',
    label: 'Limpeza',
    text: 'Registrar inspeções, anomalias e eventos que ajudam a enxergar desvios cedo.',
  },
  {
    name: 'Seiketsu',
    label: 'Padronização',
    text: 'Transformar rotinas, checklists e contexto técnico em padrão acessível.',
  },
  {
    name: 'Shitsuke',
    label: 'Disciplina',
    text: 'Sustentar histórico, acompanhamento e evolução contínua da operação.',
  },
];

export function VisaoSgmPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl bg-slate-900 px-6 py-10 text-slate-100 shadow-lg sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Conceito</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Visão do SGM</h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
          Mais do que mapear máquinas, o SGM organiza contexto operacional, inspeção, padrão e
          rastreabilidade.
        </p>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-[0.95rem]">
          O SGM nasce como base digital para gestão visual dos ativos e pode evoluir naturalmente
          para apoiar rotinas de 5S, disciplina operacional e futuras práticas de TPM.
        </p>
      </section>

      {/* Roda 5S + texto */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Como o SGM apoia o 5S digital
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          O SGM ajuda a transformar organização visual, identificação de ativos, inspeção,
          padronização e disciplina em uma base digital viva. Com QR points, mapa da máquina,
          inventário, timeline e eventos, o sistema apoia a construção de rotina operacional com
          mais clareza e rastreabilidade.
        </p>

        <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <div className="flex flex-1 justify-center lg:max-w-[min(100%,420px)] lg:flex-[0_0_42%]">
            <img
              src={sgm5sWheel}
              alt="Roda 5S no SGM — diagrama conceitual dos cinco sensos em torno do núcleo SGM"
              className="h-auto w-full max-w-md object-contain drop-shadow-md"
            />
          </div>
          <div className="min-w-0 flex-1 text-sm leading-relaxed text-slate-600 lg:pt-2">
            <p>
              A roda resume a ideia: o <strong className="font-semibold text-slate-800">SGM</strong>{' '}
              no centro como plataforma; os cinco sensos como camadas de prática ao redor da
              operação. Na tela, isso se traduz em mapa, pontos, histórico e padrões compartilhados —
              sem substituir o trabalho no chão de fábrica, mas dando suporte digital consistente.
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {fiveS.map((item) => (
            <article
              key={item.name}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold text-slate-900">{item.name}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {item.label}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-[0.8125rem]">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* TPM */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-8 text-slate-100 shadow-lg sm:px-10 sm:py-10">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Base para evolução em TPM</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Ao estruturar ativos, contexto visual, inspeções, eventos e histórico, o SGM cria uma base
          natural para evoluir em direção a práticas mais maduras de manutenção, disciplina
          operacional e TPM digital.
        </p>
        <p className="mt-6 border-l-2 border-amber-500/80 pl-4 text-sm font-medium leading-relaxed text-slate-200">
          Primeiro organizamos e damos visibilidade. Depois estruturamos rotina, disciplina e
          melhoria contínua.
        </p>
      </section>
    </div>
  );
}
