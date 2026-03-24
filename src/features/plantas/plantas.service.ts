/**
 * Serviço de plantas (sites). Usa apenas API real (/api/sgm/sites).
 * Não utiliza mock; fallback é tratamento de erro na UI.
 */
import type { Planta } from '../../types/Planta';
import { getSites, getSiteById } from '@/services/sgm';

function mapSiteToPlanta(item: {
  id: string;
  name: string;
  description: string | null;
  machinesCount: number;
}): Planta {
  return {
    id: item.id,
    nome: item.name,
    descricao: item.description ?? '',
    quantidadeMaquinas: item.machinesCount,
  };
}

export async function getPlantas(): Promise<Planta[]> {
  const res = await getSites();
  return res.items.map(mapSiteToPlanta);
}

export async function getPlantaById(id: string): Promise<Planta | undefined> {
  try {
    const item = await getSiteById(id);
    return mapSiteToPlanta(item);
  } catch {
    return undefined;
  }
}
