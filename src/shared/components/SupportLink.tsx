import { MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { APP_NAME, SUPPORT_WHATSAPP } from '@/config/constants'

interface SupportLinkProps {
  /** Mensaje con el que se abre el chat. */
  message?: string
  label?: string
  className?: string
}

export const supportUrl = (message: string) => `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`

/** Enlace a WhatsApp de soporte (se abre fuera de la app, en su propia pestaña). */
export const SupportLink = ({
  message = `Hola, necesito ayuda con ${APP_NAME}.`,
  label = 'Escribir a soporte por WhatsApp',
  className,
}: SupportLinkProps) => (
  <a
    href={supportUrl(message)}
    target="_blank"
    rel="noopener noreferrer"
    className={clsx(
      'focus-ring inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-2xl border border-gray-200',
      'text-sm font-semibold text-secondary active:scale-[0.98] transition-transform',
      className
    )}
  >
    <MessageCircle className="w-4 h-4 text-success-strong" aria-hidden="true" />
    {label}
  </a>
)
