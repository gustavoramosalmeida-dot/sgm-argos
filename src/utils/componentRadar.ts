import type {
  ComponentEvent,
  ComponentRadarSummary,
  RadarStatus,
} from '../types/ComponentEvent';

const RADAR_OK_THRESHOLD_DAYS = 15;

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function formatIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function compareEventDates(a: ComponentEvent, b: ComponentEvent): number {
  const da = parseDate(a.eventDate);
  const db = parseDate(b.eventDate);
  if (!da && !db) return 0;
  if (!da) return -1;
  if (!db) return 1;
  return da.getTime() - db.getTime();
}

function calculateNextDueDateFromEvent(event: ComponentEvent): string | undefined {
  if (!event.usefulLifeDays) return undefined;
  const base = parseDate(event.eventDate);
  if (!base) return undefined;
  const next = new Date(base.getTime());
  next.setDate(next.getDate() + event.usefulLifeDays);
  return formatIso(next);
}

function calculateRadarStatus(daysRemaining?: number, hasHistory?: boolean): RadarStatus {
  if (!hasHistory) return 'SEM_HISTORICO';
  if (daysRemaining == null) return 'SEM_HISTORICO';
  if (daysRemaining < 0) return 'VENCIDO';
  if (daysRemaining <= RADAR_OK_THRESHOLD_DAYS) return 'ATENCAO';
  return 'OK';
}

export function calculateComponentRadarSummary(
  events: ComponentEvent[],
  today: Date = new Date()
): ComponentRadarSummary {
  if (!events.length) {
    return {
      radarStatus: 'SEM_HISTORICO',
    };
  }

  const sorted = [...events].sort(compareEventDates);
  const lastEvent = sorted[sorted.length - 1]!;

  const lastReplace = [...sorted]
    .reverse()
    .find((e) => e.eventType === 'REPLACE' && !!e.eventDate);

  const lastReplaceDate = lastReplace?.eventDate;
  const usefulLifeDays = lastReplace?.usefulLifeDays ?? lastEvent.usefulLifeDays;

  let nextDueDate: string | undefined;
  if (lastReplace) {
    nextDueDate = calculateNextDueDateFromEvent(lastReplace);
  } else if (lastEvent.usefulLifeDays) {
    nextDueDate = calculateNextDueDateFromEvent(lastEvent);
  }

  let daysRemaining: number | undefined;
  if (nextDueDate) {
    const due = parseDate(nextDueDate);
    if (due) {
      const diffMs = due.getTime() - today.setHours(0, 0, 0, 0);
      daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  const radarStatus = calculateRadarStatus(daysRemaining, true);

  return {
    lastEvent,
    lastReplaceDate,
    usefulLifeDays,
    nextDueDate,
    daysRemaining,
    radarStatus,
  };
}

export function getEventNextDueDate(event: ComponentEvent): string | undefined {
  return calculateNextDueDateFromEvent(event);
}

