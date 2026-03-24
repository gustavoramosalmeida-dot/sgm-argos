export type ComponentEventType =
  | 'INSTALL'
  | 'REPLACE'
  | 'INSPECTION'
  | 'ADJUSTMENT'
  | 'CLEANING'
  | 'FAILURE'
  | 'NOTE';

export interface ComponentEvent {
  id: number;
  /** Mock numérico ou UUID do visual point na API */
  qrPointId: number | string;
  /** Data do evento em ISO (YYYY-MM-DD). */
  eventDate: string;
  eventType: ComponentEventType;
  title: string;
  notes?: string;
  /** Vida útil em dias aplicada neste evento (ex.: após troca). */
  usefulLifeDays?: number;
  performedBy?: string;
}

export type RadarStatus = 'OK' | 'ATENCAO' | 'VENCIDO' | 'SEM_HISTORICO';

export interface ComponentRadarSummary {
  /** Último evento cronológico do componente. */
  lastEvent?: ComponentEvent;
  /** Data do último evento de troca (REPLACE), se houver. */
  lastReplaceDate?: string;
  /** Vida útil em dias associada ao último evento relevante. */
  usefulLifeDays?: number;
  /** Próxima data prevista (base para radar), no mesmo formato ISO. */
  nextDueDate?: string;
  /** Dias restantes até a próxima data (pode ser negativo se já venceu). */
  daysRemaining?: number;
  /** Estado derivado simples: OK / ATENCAO / VENCIDO / SEM_HISTORICO. */
  radarStatus: RadarStatus;
}

