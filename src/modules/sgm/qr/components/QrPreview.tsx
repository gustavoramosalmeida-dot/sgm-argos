import { useState } from 'react';

export function QrPreview({
  svgUrl,
  pngUrl,
  alt = 'QR',
  size = 176,
  variant = 'light',
}: {
  svgUrl: string | null | undefined;
  pngUrl?: string | null | undefined;
  alt?: string;
  size?: number;
  variant?: 'light' | 'dark';
}) {
  const [failed, setFailed] = useState(false);
  const src = !failed && svgUrl ? svgUrl : pngUrl ?? null;

  const frame =
    variant === 'dark'
      ? 'border-slate-700 bg-white ring-1 ring-slate-800/80'
      : 'border-slate-200 bg-white ring-1 ring-slate-100';

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed ${frame}`}
        style={{ width: size, height: size }}
      >
        <span className="px-2 text-center text-[10px] text-slate-500">Preview indisponível</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex rounded-lg border p-3 ${frame}`}
      style={{ maxWidth: size + 24 }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="block h-auto w-full max-w-full object-contain"
        style={{ aspectRatio: '1' }}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
