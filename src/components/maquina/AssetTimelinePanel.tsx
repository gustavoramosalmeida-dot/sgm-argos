import { useMemo, useState } from "react";
import type { AssetTimelineEvent, AssetTimelineResponse } from "@/types/sgm-api";
import {
  ASSET_EVENT_TYPES,
  updateAssetEvent,
  deleteAssetEvent,
  type AssetEventType,
} from "@/services/sgm";
import { AssetEventCreateForm } from "./AssetEventCreateForm";

function statusBadgeClass(status: AssetTimelineResponse["summary"]["status"]) {
  switch (status) {
    case "OK":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "ATENCAO":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "VENCIDO":
      return "border-red-200 bg-red-50 text-red-800";
    case "SEM_HISTORICO":
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function parseApiErrorMessage(message: string): string {
  const m = message.match(/API error \d+: (.+)/s);
  if (!m) return message;
  try {
    const json = JSON.parse(m[1]) as { message?: string };
    return json.message ?? message;
  } catch {
    return m[1].slice(0, 200);
  }
}

type FormMode = "idle" | "create" | "edit";

function emptyForm() {
  return {
    eventType: "INSTALL" as AssetEventType,
    eventDate: new Date().toISOString().slice(0, 10),
    observation: "",
    usefulLifeDays: "",
  };
}

function eventToForm(e: AssetTimelineEvent) {
  return {
    eventType: e.eventType as AssetEventType,
    eventDate: e.eventDate,
    observation: e.observation ?? "",
    usefulLifeDays: e.usefulLifeDays != null ? String(e.usefulLifeDays) : "",
  };
}

function formatEventDateTime(iso: string): string {
  try {
    const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatMonthHeading(iso: string): string {
  try {
    const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

function eventTypeChipClass(t: string): string {
  const u = t.toUpperCase();
  if (u.includes("FAIL") || u.includes("VENC")) return "border-red-200 bg-red-50 text-red-900";
  if (u.includes("INSPECT") || u.includes("MAINT")) return "border-sky-200 bg-sky-50 text-sky-900";
  if (u.includes("INSTALL") || u.includes("REPLACE")) return "border-emerald-200 bg-emerald-50 text-emerald-900";
  return "border-slate-200 bg-slate-100 text-slate-800";
}

export function AssetTimelinePanel({
  assetId,
  timeline,
  loading,
  error,
  onReload,
  showAssetHeader = true,
  showSummaryGrid = true,
}: {
  assetId: string;
  timeline: AssetTimelineResponse | null;
  loading: boolean;
  error: string | null;
  onReload: () => void | Promise<void>;
  /** Quando false, o drawer já exibiu máquina/ativo no topo. */
  showAssetHeader?: boolean;
  /** Resumo em duas colunas (último evento / próxima data). */
  showSummaryGrid?: boolean;
}) {
  const [formMode, setFormMode] = useState<FormMode>("idle");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openCreate() {
    setFormMode("create");
    setEditingEventId(null);
    setForm(emptyForm());
    setFormError(null);
  }

  function openEdit(e: AssetTimelineEvent) {
    setFormMode("edit");
    setEditingEventId(e.id);
    setForm(eventToForm(e));
    setFormError(null);
  }

  function closeForm() {
    setFormMode("idle");
    setEditingEventId(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const ulRaw = form.usefulLifeDays.trim();
    let usefulLifeDays: number | null | undefined = undefined;
    if (ulRaw !== "") {
      const n = Number(ulRaw);
      if (!Number.isInteger(n) || n < 0) {
        setFormError("Vida útil deve ser um número inteiro ≥ 0.");
        return;
      }
      usefulLifeDays = n;
    }

    const observation = form.observation.trim() === "" ? null : form.observation.trim();

    setSaving(true);
    try {
      if (formMode === "edit" && editingEventId) {
        const payload: Parameters<typeof updateAssetEvent>[1] = {
          eventType: form.eventType,
          eventDate: form.eventDate,
          observation,
        };
        if (ulRaw !== "") payload.usefulLifeDays = usefulLifeDays as number;
        else payload.usefulLifeDays = null;
        await updateAssetEvent(editingEventId, payload);
      }
      closeForm();
      await onReload();
    } catch (err) {
      setFormError(parseApiErrorMessage(err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(eventId: string) {
    if (!window.confirm("Remover este evento?")) return;
    setDeletingId(eventId);
    setFormError(null);
    try {
      await deleteAssetEvent(eventId);
      if (editingEventId === eventId) closeForm();
      await onReload();
    } catch (err) {
      setFormError(parseApiErrorMessage(err instanceof Error ? err.message : String(err)));
    } finally {
      setDeletingId(null);
    }
  }

  const sortedAsc = useMemo(() => {
    if (!timeline?.events?.length) return [] as AssetTimelineEvent[];
    return [...timeline.events].sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  }, [timeline]);

  const lastEvent = sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1] : null;
  const priorEvents = sortedAsc.length > 1 ? sortedAsc.slice(0, -1) : [];

  const groupedPrior = useMemo(() => {
    const groups: { key: string; label: string; items: AssetTimelineEvent[] }[] = [];
    for (const ev of priorEvents) {
      const d = new Date(ev.eventDate.includes("T") ? ev.eventDate : `${ev.eventDate}T12:00:00`);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = formatMonthHeading(ev.eventDate);
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.items.push(ev);
      else groups.push({ key, label, items: [ev] });
    }
    return groups;
  }, [priorEvents]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Carregando histórico operacional…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Nenhuma timeline carregada.
      </div>
    );
  }

  const { asset, summary } = timeline;

  return (
    <div className="rounded-xl border border-emerald-200/80 bg-white p-3 shadow-sm ring-1 ring-emerald-900/5">
      {showAssetHeader ? (
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">{asset.name}</h3>
            <p className="mt-0.5 text-xs text-slate-500">Tipo: {asset.nodeType ?? "—"}</p>
          </div>

          <span
            className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-medium uppercase tracking-wide ${statusBadgeClass(
              summary.status
            )}`}
          >
            {summary.status}
          </span>
        </header>
      ) : null}

      {showSummaryGrid ? (
        <section className={`grid grid-cols-2 gap-2 text-xs ${showAssetHeader ? "mt-3" : ""}`}>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Último evento</p>
            <p className="mt-1 font-mono text-slate-800">{summary.lastEventType ?? "—"}</p>
            <p className="mt-1 text-slate-600">{summary.lastEventDate ?? "—"}</p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Próxima data</p>
            <p className="mt-1 font-mono text-slate-800">{summary.nextDueDate ?? "—"}</p>
            <p className="mt-1 text-slate-600">
              Vida útil: {summary.usefulLifeDays != null ? `${summary.usefulLifeDays} dias` : "—"}
            </p>
          </div>
        </section>
      ) : null}

      {sortedAsc.length === 0 ? (
        <div
          className={`rounded-lg border border-dashed border-slate-200 bg-slate-50/90 p-5 text-center ${showSummaryGrid || showAssetHeader ? "mt-3" : ""}`}
        >
          <p className="text-sm font-medium text-slate-700">Nenhum evento operacional registrado</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
            Ainda não há histórico neste ativo. Use &quot;Novo evento&quot; abaixo para registrar instalações,
            inspeções ou intervenções.
          </p>
        </div>
      ) : (
        <>
          {lastEvent ? (
            <div className={`${showSummaryGrid || showAssetHeader ? "mt-3" : ""}`}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800/90">
                Último evento
              </p>
              <div className="rounded-lg border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 to-white p-3 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${eventTypeChipClass(lastEvent.eventType)}`}
                    >
                      {lastEvent.eventType}
                    </span>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {formatEventDateTime(lastEvent.eventDate)}
                    </p>
                    {lastEvent.observation ? (
                      <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{lastEvent.observation}</p>
                    ) : (
                      <p className="mt-1.5 text-xs text-slate-400">Sem observação</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(lastEvent)}
                      disabled={saving || formMode !== "idle"}
                      className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(lastEvent.id)}
                      disabled={deletingId === lastEvent.id || saving || formMode !== "idle"}
                      className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === lastEvent.id ? "…" : "Remover"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {priorEvents.length > 0 ? (
            <section className="mt-4">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Histórico anterior
              </h4>
              <div className="space-y-4">
                {groupedPrior.map((g) => (
                  <div key={g.key}>
                    <p className="mb-2 border-b border-slate-100 pb-1 text-[10px] font-medium capitalize text-slate-400">
                      {g.label}
                    </p>
                    <ol className="space-y-2">
                      {g.items.map((ev) => (
                        <li
                          key={ev.id}
                          className="rounded-lg border border-slate-200/90 bg-white p-2.5 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span
                                className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${eventTypeChipClass(ev.eventType)}`}
                              >
                                {ev.eventType}
                              </span>
                              <p className="mt-1.5 text-xs font-medium text-slate-800">
                                {formatEventDateTime(ev.eventDate)}
                              </p>
                              {ev.observation ? (
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">{ev.observation}</p>
                              ) : null}
                              <p className="mt-1 text-[10px] text-slate-400">
                                Vida útil (evento):{" "}
                                {ev.usefulLifeDays != null ? `${ev.usefulLifeDays} dias` : "—"}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-1">
                              <button
                                type="button"
                                onClick={() => openEdit(ev)}
                                disabled={saving || formMode !== "idle"}
                                className="rounded border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(ev.id)}
                                disabled={deletingId === ev.id || saving || formMode !== "idle"}
                                className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                {deletingId === ev.id ? "…" : "Remover"}
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <h4 className="text-xs font-semibold text-slate-900">Eventos</h4>
        {formMode === "idle" ? (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-900 hover:bg-emerald-100"
          >
            Novo evento
          </button>
        ) : (
          <button
            type="button"
            onClick={closeForm}
            disabled={saving}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>

      {formMode === "create" && (
        <div className="mt-2">
          <AssetEventCreateForm
            assetId={assetId}
            heading="Novo evento"
            showCancelButton={false}
            onCancel={closeForm}
            onSuccess={async () => {
              closeForm();
              await onReload();
            }}
          />
        </div>
      )}

      {formMode === "edit" && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <p className="text-[11px] font-medium text-slate-700">Editar evento</p>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-slate-500">Tipo</label>
            <select
              value={form.eventType}
              onChange={(ev) =>
                setForm((f) => ({ ...f, eventType: ev.target.value as AssetEventType }))
              }
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              disabled={saving}
            >
              {ASSET_EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-slate-500">Data</label>
            <input
              type="date"
              value={form.eventDate}
              onChange={(ev) => setForm((f) => ({ ...f, eventDate: ev.target.value }))}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              disabled={saving}
              required
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-slate-500">Observação</label>
            <textarea
              value={form.observation}
              onChange={(ev) => setForm((f) => ({ ...f, observation: ev.target.value }))}
              rows={2}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              disabled={saving}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-[10px] font-medium text-slate-500">
              Vida útil (dias), opcional
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.usefulLifeDays}
              onChange={(ev) => setForm((f) => ({ ...f, usefulLifeDays: ev.target.value }))}
              className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
              disabled={saving}
              placeholder="—"
            />
          </div>
          {formError ? <p className="text-[11px] text-red-600">{formError}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-slate-800 py-1.5 text-[11px] font-medium text-white hover:bg-slate-900 disabled:opacity-50"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </form>
      )}

      {formError && formMode === "idle" ? (
        <p className="mt-2 text-[11px] text-red-600">{formError}</p>
      ) : null}
    </div>
  );
}
