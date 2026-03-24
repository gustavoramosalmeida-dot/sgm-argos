export type QRPointStatus = 'ok' | 'atencao' | 'falha';

/** Tipos de componente (Prompt 8). */
export type QRPointTipo =
  | 'motor'
  | 'sensor'
  | 'painel'
  | 'correia'
  | 'atuador'
  | 'estrutura'
  | 'outro';

export interface QRPointLinkedAsset {
  id: string;
  code: string | null;
  name: string;
  nodeKind: string | null;
  assetType: string | null;
  status?: string | null;
  qrPayload?: string | null;
}

export interface QRPoint {
  /** ID interno do ponto (number no mock, string UUID na API). */
  id: number | string;
  /** ID da máquina (number no mock, string UUID na API) */
  maquinaId: number | string;
  /** Coordenadas em percentual (0–100) relativas à imagem. */
  x: number;
  y: number;
  codigo: string;
  descricao: string;
  tipo?: QRPointTipo;
  status?: QRPointStatus;
  healthScore?: number;
  ultimaInspecao?: string;
  proximaManutencao?: string;
  alertas?: string[];
  /** Vínculo opcional com asset_node real. */
  assetId?: string | null;
  asset?: QRPointLinkedAsset | null;
  /** Novo padrão: id do asset_node vinculado. */
  assetNodeId?: string | null;
  /** Novo padrão: nome do asset_node vinculado. */
  assetName?: string | null;
  /** Novo padrão: node_kind do asset_node vinculado. */
  assetNodeType?: string | null;
}
