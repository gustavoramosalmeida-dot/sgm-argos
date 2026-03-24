import { useState } from "react";
import {
  ASSET_EVENT_TYPES,
  createAssetEvent,
  type AssetEventType,
} from "@/services/sgm";

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

function emptyForm() {
  return {
    eventType: "INSTALL" as AssetEventType,
    eventDate: new Date().toISOString().slice(0, 10),
    observation: "",
    usefulLifeDays: "",
  };
}

export function AssetEventCreateForm({
  assetId,
  onSuccess,
  onCancel,
  heading = "Novo evento",
  showCancelButton = true,
  className = "",
}: {
  assetId: string;
  onSuccess: () => void | Promise<void>;
  onCancel: () => void;
  heading?: string;
  /** No painel da timeline o cancelamento fica no cabeçalho externo. */
  showCancelButton?: boolean;
  className?: string;
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const ulRaw = form.usefulLifeDays.trim();
    let usefulLifeDays: number | null = null;
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
      await createAssetEvent(assetId, {
        eventType: form.eventType,
        eventDate: form.eventDate,
        observation,
        usefulLifeDays,
      });
      await onSuccess();
    } catch (err) {
      setFormError(parseApiErrorMessage(err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={`space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 ${className}`}
    >
      <p className="text-[11px] font-medium text-slate-700">{heading}</p>
      <div>
        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Tipo</label>
        <select
          value={form.eventType}
          onChange={(ev) =>
            setForm((f) => ({ ...f, eventType: ev.target.value as AssetEventType }))
          }
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          disabled={saving}
          required
        >
          {ASSET_EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Data</label>
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
        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Observação</label>
        <textarea
          value={form.observation}
          onChange={(ev) => setForm((f) => ({ ...f, observation: ev.target.value }))}
          rows={2}
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          disabled={saving}
        />
      </div>
      <div>
        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
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
      <div className={showCancelButton ? "flex gap-2 pt-1" : ""}>
        {showCancelButton ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-md border border-slate-300 bg-white py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className={`rounded-md bg-slate-800 py-1.5 text-[11px] font-medium text-white hover:bg-slate-900 disabled:opacity-50 ${
            showCancelButton ? "flex-1" : "w-full"
          }`}
        >
          {saving ? "Salvando…" : "Salvar"}
        </button>
      </div>
    </form>
  );
}
