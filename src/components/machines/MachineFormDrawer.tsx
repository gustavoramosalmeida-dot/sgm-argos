import { useEffect, useState } from 'react';
import { createMachine, updateMachine } from '@/services/sgm';

export interface MachineFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  siteId: string;
  machineId: string | null;
  initialValues: {
    name: string;
    code: string;
    description: string;
    imageUrl: string;
  };
  onClose: () => void;
  /** Chamado após persistência bem-sucedida (antes do fechamento pelo pai). */
  onSaved: (result: { id: string }) => void | Promise<void>;
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

export function MachineFormDrawer({
  open,
  mode,
  siteId,
  machineId,
  initialValues,
  onClose,
  onSaved,
}: MachineFormDrawerProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initialValues.name);
    setCode(initialValues.code);
    setDescription(initialValues.description);
    setImageUrl(initialValues.imageUrl);
    setError(null);
  }, [open, initialValues]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Informe o nome da máquina.');
      return;
    }
    setSaving(true);
    setError(null);
    const codeVal = code.trim() || null;
    const descVal = description.trim() || null;
    const imgTrim = imageUrl.trim();
    try {
      if (mode === 'create') {
        const res = await createMachine(siteId, {
          name: trimmedName,
          code: codeVal,
          description: descVal,
          imageUrl: imgTrim || null,
        });
        await onSaved(res);
      } else {
        if (!machineId) {
          setError('Máquina inválida.');
          return;
        }
        const payload: Parameters<typeof updateMachine>[1] = {
          name: trimmedName,
          code: codeVal,
          description: descVal,
        };
        if (imgTrim) payload.imageUrl = imgTrim;
        const res = await updateMachine(machineId, payload);
        await onSaved(res);
      }
    } catch (err) {
      setError(parseApiErrorMessage(err instanceof Error ? err.message : String(err)));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="machine-form-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="machine-form-title" className="text-lg font-semibold text-slate-900 mb-4">
          {mode === 'create' ? 'Nova máquina' : 'Editar máquina'}
        </h3>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="machine-name" className="block text-sm font-medium text-slate-700 mb-1">
              Nome <span className="text-red-600">*</span>
            </label>
            <input
              id="machine-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              autoComplete="off"
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor="machine-code" className="block text-sm font-medium text-slate-700 mb-1">
              Código
            </label>
            <input
              id="machine-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              autoComplete="off"
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor="machine-desc" className="block text-sm font-medium text-slate-700 mb-1">
              Descrição
            </label>
            <textarea
              id="machine-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              disabled={saving}
            />
          </div>
          <div>
            <label htmlFor="machine-image" className="block text-sm font-medium text-slate-700 mb-1">
              URL da imagem (opcional)
            </label>
            <input
              id="machine-image"
              type="url"
              inputMode="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              autoComplete="off"
              disabled={saving}
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
