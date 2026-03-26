import { useId } from 'react'

type MultivaciaMarkProps = {
  className?: string
  /** Quando true, oculta de leitores de tela (marca repetida ao lado do texto). */
  decorative?: boolean
}

/** Símbolo institucional (núcleo + órbitas), alinhado à referência visual Multivacia / ARGOS. */
export function MultivaciaMark({
  className = 'h-10 w-10',
  decorative = false,
}: MultivaciaMarkProps) {
  const rawId = useId().replace(/:/g, '')
  const coreId = `mv-core-${rawId}`
  const glowId = `mv-glow-${rawId}`

  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : 'Multivacia'}
    >
      <defs>
        <radialGradient id={coreId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f5e6b8" stopOpacity="1" />
          <stop offset="45%" stopColor="#c99c3c" stopOpacity="1" />
          <stop offset="100%" stopColor="#7a5c22" stopOpacity="1" />
        </radialGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="11"
        stroke="#c99c3c"
        strokeWidth="1.1"
        strokeOpacity="0.88"
        transform="rotate(-18 32 32)"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="11"
        stroke="#3e7baa"
        strokeWidth="1.05"
        strokeOpacity="0.82"
        transform="rotate(42 32 32)"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="11"
        stroke="#c99c3c"
        strokeWidth="0.85"
        strokeOpacity="0.4"
        transform="rotate(102 32 32)"
      />
      <circle cx="32" cy="32" r="7" fill={`url(#${coreId})`} filter={`url(#${glowId})`} />
      <circle cx="32" cy="32" r="2.2" fill="#0b1220" opacity="0.55" />
    </svg>
  )
}
