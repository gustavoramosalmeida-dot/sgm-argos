import type { Maquina } from '../../types/Maquina';

interface MaquinaHeaderProps {
  maquina: Maquina;
}

export function MaquinaHeader({ maquina }: MaquinaHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold text-slate-800">{maquina.nome}</h1>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5 mt-0.5 text-sm">
        <span className="text-slate-500 font-mono">{maquina.codigo}</span>
        {maquina.codigoQrRaiz && (
          <span className="text-slate-400 font-mono" title="QR raiz da máquina">
            QR raiz: {maquina.codigoQrRaiz}
          </span>
        )}
      </div>
    </header>
  );
}
