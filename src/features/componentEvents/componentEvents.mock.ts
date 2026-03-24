import type { ComponentEvent } from '../../types/ComponentEvent';

/**
 * Eventos mockados por QR point.
 * Datas em ISO (YYYY-MM-DD) para facilitar os cálculos.
 */
export const componentEventsMock: ComponentEvent[] = [
  // Motor principal – QR-001 (maquina 1)
  {
    id: 1,
    qrPointId: 1,
    eventDate: '2026-03-01',
    eventType: 'INSTALL',
    title: 'Instalação do motor principal',
    notes: 'Instalação inicial do motor XPTO-9000.',
    usefulLifeDays: 120,
    performedBy: 'Time de manutenção',
  },
  {
    id: 2,
    qrPointId: 1,
    eventDate: '2026-03-10',
    eventType: 'INSPECTION',
    title: 'Inspeção de vibração',
    notes: 'Nível de vibração dentro do esperado.',
    performedBy: 'Inspetor João',
  },
  // Sensor lateral – QR-002 (maquina 1)
  {
    id: 3,
    qrPointId: 2,
    eventDate: '2026-02-20',
    eventType: 'REPLACE',
    title: 'Troca do sensor lateral',
    notes: 'Sensor substituído por modelo SL-200.',
    usefulLifeDays: 90,
    performedBy: 'Téc. Maria',
  },
  {
    id: 4,
    qrPointId: 2,
    eventDate: '2026-03-05',
    eventType: 'INSPECTION',
    title: 'Inspeção periódica',
    notes: 'Calibração ajustada.',
    performedBy: 'Téc. Carlos',
  },
  // Painel elétrico – QR-003 (maquina 1)
  {
    id: 5,
    qrPointId: 3,
    eventDate: '2026-01-15',
    eventType: 'INSTALL',
    title: 'Instalação do painel elétrico',
    usefulLifeDays: 365,
    performedBy: 'Fornecedor ABC',
  },
  // Comando manual – QR-005 (maquina 1) com falha
  {
    id: 6,
    qrPointId: 5,
    eventDate: '2026-02-10',
    eventType: 'REPLACE',
    title: 'Troca do comando manual',
    usefulLifeDays: 60,
    performedBy: 'Time de manutenção',
  },
  {
    id: 7,
    qrPointId: 5,
    eventDate: '2026-03-12',
    eventType: 'FAILURE',
    title: 'Falha intermitente no botão de emergência',
    notes: 'Registrado travamento ocasional do botão.',
    performedBy: 'Operador Luiz',
  },
  // Exemplo de QR sem histórico (p.ex. id 4, 6, etc.) – simplesmente sem eventos
];

