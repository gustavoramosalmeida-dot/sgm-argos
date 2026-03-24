import type { QRPoint, QRPointTipo } from '../../types/QRPoint';
import { qrpointsMock } from './qrpoints.mock';

export async function getQRPoints(): Promise<QRPoint[]> {
  return Promise.resolve(qrpointsMock);
}

export async function getQRPointsByMaquinaId(maquinaId: number | string): Promise<QRPoint[]> {
  return Promise.resolve(
    qrpointsMock.filter((q) => String(q.maquinaId) === String(maquinaId))
  );
}

function maxNumericMockId(): number {
  return qrpointsMock.reduce((max, q) => {
    if (typeof q.id === 'number' && q.id > max) return q.id;
    return max;
  }, 0);
}

let nextId = maxNumericMockId() + 1;

/** Gera próximo id mock (apenas para uso no editor, sem persistência). */
function nextMockId(): number {
  return nextId++;
}

/**
 * Cria um QRPoint mock (sem persistência).
 * x, y em percentual (0–100) relativos à imagem.
 */
export function createQRPointMock(
  maquinaId: number | string,
  x: number,
  y: number,
  codigo?: string,
  descricao?: string,
  tipo?: QRPointTipo
): QRPoint {
  const id = nextMockId();
  return {
    id,
    maquinaId,
    x,
    y,
    codigo: codigo ?? `QR-${String(id).padStart(3, '0')}`,
    descricao: descricao ?? 'Novo ponto',
    tipo: tipo ?? 'outro',
    status: 'ok',
    healthScore: undefined,
    ultimaInspecao: undefined,
    proximaManutencao: undefined,
    alertas: [],
  };
}
