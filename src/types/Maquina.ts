export type StatusVisualMaquina = 'normal' | 'atencao' | 'parada';

export interface Maquina {
  /** ID da máquina (number no mock, string UUID na API) */
  id: number | string;
  /** ID da planta/site (number no mock, string UUID na API) */
  plantaId: number | string;
  nome: string;
  codigo: string;
  /** Código do QR raiz da máquina (ex.: QR_MAQ_01) */
  codigoQrRaiz?: string;
  descricao: string;
  posX: number;
  posY: number;
  largura?: number;
  altura?: number;
  statusVisual?: StatusVisualMaquina;
  fotoMaquina?: string;
}
