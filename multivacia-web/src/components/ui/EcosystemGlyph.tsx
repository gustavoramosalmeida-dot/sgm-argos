type EcosystemGlyphProps = {
  productId: string
  className?: string
}

export function EcosystemGlyph({ productId, className = '' }: EcosystemGlyphProps) {
  const box = `flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-gradient-to-br from-mv-elevated-soft/85 to-mv-void/85 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-[border-color,box-shadow] duration-200 group-hover:border-mv-navy-mid/25 ${className}`

  switch (productId) {
    case 'argos':
      return (
        <div className={box} aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-mv-gold">
            <path
              d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
            <path d="M12 12V7.5M12 12l4.5 2.5M12 12l-4.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      )
    case 'sgm':
      return (
        <div className={box} aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-mv-navy-mid">
            <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.35" />
            <path d="M8 9h8M8 13h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="17" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </div>
      )
    case 'sgp':
      return (
        <div className={box} aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-mv-navy-mid">
            <path
              d="M5 18V8l4-3h6l4 3v10"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeLinejoin="round"
            />
            <path d="M9 18V11h6v7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </div>
      )
    case 'spe':
      return (
        <div className={box} aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-mv-navy-mid">
            <path d="M6 18V6h12v12" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
            <path
              d="M9 14l2.5-3 2 2 3.5-5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )
    default:
      return <div className={box} aria-hidden />
  }
}
