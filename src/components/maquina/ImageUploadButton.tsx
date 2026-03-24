const ACCEPT_EXT = '.jpg,.jpeg,.png,.webp';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface ImageUploadButtonProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Botão "Trocar imagem" com input file. Aceita JPG, PNG, WEBP até 5MB.
 */
export function ImageUploadButton({
  onFileSelect,
  loading = false,
  disabled = false,
}: ImageUploadButtonProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/i)) {
      alert('Formato não suportado. Use JPG, PNG ou WEBP.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      alert('Imagem muito grande. Limite: 5MB.');
      e.target.value = '';
      return;
    }

    onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div className="flex justify-end mb-2">
      <label
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border cursor-pointer
          transition-colors
          ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
          border-slate-300 bg-white text-slate-700
          hover:border-slate-400 hover:bg-slate-50
        `}
      >
        <input
          type="file"
          accept={ACCEPT_EXT}
          className="sr-only"
          onChange={handleChange}
          disabled={disabled || loading}
        />
        {loading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span>Carregando...</span>
          </>
        ) : (
          <span>Trocar imagem</span>
        )}
      </label>
    </div>
  );
}
