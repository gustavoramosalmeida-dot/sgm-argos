export type EcosystemProduct = {
  id: string
  name: string
  tag: string
  description: string
  moreHref: string
}

export const ecosystemProducts: EcosystemProduct[] = [
  {
    id: 'argos',
    name: 'ARGOS',
    tag: 'Inteligência',
    description:
      'Reúne sinais da operação para leitura de contexto e apoio à decisão no ritmo do chão de fábrica.',
    moreHref: '#',
  },
  {
    id: 'sgm',
    name: 'SGM',
    tag: 'Ativos',
    description:
      'Gestão de máquinas e ativos com QR, histórico técnico e contexto para manutenção e confiabilidade.',
    moreHref: '#',
  },
  {
    id: 'sgp',
    name: 'SGP',
    tag: 'Produção',
    description:
      'Execução da produção com apontamentos, jornada e visibilidade do que acontece na linha.',
    moreHref: '#',
  },
  {
    id: 'spe',
    name: 'SPE',
    tag: 'Planejamento',
    description:
      'Planejamento de capacidade, prioridades e encadeamento entre o que se planeja e o que se executa.',
    moreHref: '#',
  },
]
