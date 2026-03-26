type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <div className={`max-w-[44rem] ${alignClass}`}>
      {eyebrow ? (
        <p className="mb-3.5 font-heading text-[10px] font-semibold uppercase tracking-[0.24em] text-mv-gold/90 sm:text-[11px]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-[1.7rem] font-semibold leading-[1.22] tracking-[-0.025em] text-[#f8fafc] sm:text-[2.125rem] sm:leading-[1.18] md:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-2xl text-[0.9375rem] leading-[1.7] text-slate-500 sm:mx-auto sm:text-[1.05rem] sm:leading-relaxed">
          {description}
        </p>
      ) : null}
    </div>
  )
}
