interface QRPointDeleteConfirmProps {
  codigo: string;
  descricao?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function QRPointDeleteConfirm({
  codigo,
  descricao,
  onConfirm,
  onCancel,
}: QRPointDeleteConfirmProps) {
  return (
    <div className="mt-3 rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-800">
      <p className="font-semibold">Remover QR point</p>
      <p className="mt-1 text-xs text-red-700">
        Tem certeza que deseja remover o QR <span className="font-mono">{codigo}</span>
        {descricao ? ` — ${descricao}` : ''}? Esta ação não pode ser desfeita.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
        >
          Confirmar remoção
        </button>
      </div>
    </div>
  );
}

