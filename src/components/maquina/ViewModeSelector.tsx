export type ViewMode = 'photo' | 'blueprint' | 'exploded';

interface ViewModeSelectorProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

/**
 * Seletor de modo de visualização do workspace: Foto, Blueprint ou Explodido.
 * Troca instantânea, estilo "trocar mapa no Google Maps".
 */
export function ViewModeSelector({
  value,
  onChange,
  className = '',
}: ViewModeSelectorProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 ${className}`}
      role="tablist"
      aria-label="Modo de visualização"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'photo'}
        onClick={() => onChange('photo')}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
          value === 'photo'
            ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`}
      >
        Foto
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'blueprint'}
        onClick={() => onChange('blueprint')}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
          value === 'blueprint'
            ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`}
      >
        Blueprint
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === 'exploded'}
        onClick={() => onChange('exploded')}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
          value === 'exploded'
            ? 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`}
      >
        Explodido
      </button>
    </div>
  );
}
