export interface Planta {
  /** UUID do site (asset_node com node_kind SITE) */
  id: string;
  nome: string;
  descricao: string;
  /** Quantidade de máquinas na planta (vinda da API) */
  quantidadeMaquinas: number;
  larguraMapa?: number;
  alturaMapa?: number;
  layoutImage?: string;
}
