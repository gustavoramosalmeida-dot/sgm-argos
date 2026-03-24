import type { Maquina } from '../../types/Maquina';

const PLACEHOLDER_IMAGE =
  'https://placehold.co/800x500/1e293b/94a3b8?text=Imagem+da+m%C3%A1quina';

interface MaquinaImageViewerProps {
  maquina: Maquina;
}

/**
 * Exibe a imagem da máquina e mantém uma camada absoluta preparada
 * para futura interação (QR points). Ainda sem marcadores.
 */
export function MaquinaImageViewer({ maquina }: MaquinaImageViewerProps) {
  const imageSrc = maquina.fotoMaquina || PLACEHOLDER_IMAGE;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shadow-sm">
        {/* Container que mantém proporção e centraliza a imagem */}
        <div className="relative w-full min-h-[280px] flex items-center justify-center p-4">
          <img
            src={imageSrc}
            alt={maquina.nome}
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded"
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null;
              target.src = PLACEHOLDER_IMAGE;
            }}
          />
          {/* Camada absoluta para futuros QR points — sem interação neste prompt */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
          />
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        Área preparada para interação (QR points)
      </p>
    </div>
  );
}
