import { useEffect, useRef, useState, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type RevealProps = {
  children: ReactNode
  className?: string
  delayMs?: number
}

export function Reveal({ children, className = '', delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [intersected, setIntersected] = useState(false)
  const reduced = usePrefersReducedMotion()
  const visible = reduced || intersected

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setIntersected(true)
      },
      { threshold: 0.08, rootMargin: '0px 0px -28px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <div
      ref={ref}
      style={
        !reduced ? { transitionDelay: visible ? `${delayMs}ms` : '0ms' } : undefined
      }
      className={`will-change-[opacity,transform] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      } transition-[opacity,transform] duration-700 ease-out ${className}`.trim()}
    >
      {children}
    </div>
  )
}
