import { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export const Card = ({ hoverable = false, className, children, ...props }: CardProps) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl shadow-card p-4',
        hoverable && 'hover:shadow-card-hover transition-shadow cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
