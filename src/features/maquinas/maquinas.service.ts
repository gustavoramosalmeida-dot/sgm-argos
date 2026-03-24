import type { Maquina } from '../../types/Maquina';
import { maquinasMock } from './maquinas.mock';

export async function getMaquinas(): Promise<Maquina[]> {
  return Promise.resolve(maquinasMock);
}

export async function getMaquinasByPlantaId(plantaId: number): Promise<Maquina[]> {
  return Promise.resolve(maquinasMock.filter((m) => m.plantaId === plantaId));
}

export async function getMaquinaById(id: number): Promise<Maquina | undefined> {
  return Promise.resolve(maquinasMock.find((m) => m.id === id));
}

export async function getMaquinasCountByPlantaId(plantaId: number): Promise<number> {
  const maquinas = maquinasMock.filter((m) => m.plantaId === plantaId);
  return Promise.resolve(maquinas.length);
}
