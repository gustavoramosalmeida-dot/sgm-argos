interface PageLoadingProps {
  title: string;
  description?: string;
  /** Variante escura (ex.: editor em slate-950). */
  variant?: 'light' | 'dark';
}

export function PageLoading({
  title,
  description = 'Aguarde um instante.',
  variant = 'light',
}: PageLoadingProps) {
  const isDark = variant === 'dark';
  return (
    <div
      className={`flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-12 ${
        isDark ? 'bg-slate-950 text-slate-300' : 'text-slate-600'
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`h-9 w-9 animate-spin rounded-full border-2 border-solid ${
          isDark ? 'border-slate-700 border-t-slate-300' : 'border-slate-200 border-t-slate-700'
        }`}
        aria-hidden
      />
      <div className="max-w-sm text-center">
        <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
          {title}
        </p>
        {description ? (
          <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
