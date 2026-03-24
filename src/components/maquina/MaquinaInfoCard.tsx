import type { Maquina } from '../../types/Maquina';

interface MaquinaInfoCardProps {
  maquina: Maquina;
}

export function MaquinaInfoCard({ maquina }: MaquinaInfoCardProps) {
  const desc = maquina.descricao?.trim();

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-base font-medium text-slate-800">Informações da máquina</h2>
      <dl className="text-sm">
        {desc ? (
          <div className="mb-3">
            <dt className="text-slate-500">Descrição</dt>
            <dd className="mt-0.5 text-slate-700">{desc}</dd>
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Código</dt>
            <dd className="mt-0.5 font-mono text-slate-700">{maquina.codigo}</dd>
          </div>
          {maquina.statusVisual ? (
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="mt-0.5 capitalize text-slate-700">{maquina.statusVisual}</dd>
            </div>
          ) : null}
          {maquina.codigoQrRaiz ? (
            <div className="sm:col-span-2">
              <dt className="text-slate-500">QR raiz</dt>
              <dd className="mt-0.5 font-mono text-slate-700">{maquina.codigoQrRaiz}</dd>
            </div>
          ) : null}
        </div>
      </dl>
    </div>
  );
}
