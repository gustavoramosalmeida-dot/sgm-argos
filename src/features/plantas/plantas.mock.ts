import type { Planta } from '../../types/Planta';

/** Mock legado alinhado a `Planta` (IDs string / site UUID). Não usado pelo fluxo principal (API real). */
export const plantasMock: Planta[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    nome: 'Bravo Tapeçaria — Produção',
    descricao: 'Planta industrial principal - setor de produção.',
    quantidadeMaquinas: 0,
    larguraMapa: 600,
    alturaMapa: 400,
  },
];
