/**
 * Representa uma camada visual da máquina (foto, blueprint ou explodido).
 * Usado para alternar a imagem base do mapa mantendo os mesmos QR points.
 */
export type MachineVisualLayerType = 'PHOTO' | 'BLUEPRINT' | 'EXPLODED';

export interface MachineVisualLayer {
  id: string;
  machineId: string;
  type: MachineVisualLayerType;
  imageUrl: string;
  description?: string;
}
