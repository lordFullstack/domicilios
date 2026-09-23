import { ReactNode } from 'react'

interface MenuSectionProps {
  id: string
  title: string
  children: ReactNode
}

/**
 * Una categoría del menú. `scroll-mt` = header compacto + chips + aire,
 * para que al saltar desde un chip el título no quede tapado.
 */
export const MenuSection = ({ id, title, children }: MenuSectionProps) => (
  <section id={id} aria-labelledby={`${id}-title`} className="mb-6 scroll-mt-[calc(7.5rem+env(safe-area-inset-top))]">
    <h2 id={`${id}-title`} className="mb-3 font-display text-base font-bold text-secondary">
      {title}
    </h2>
    <ul role="list" className="flex flex-col gap-3">
      {children}
    </ul>
  </section>
)
