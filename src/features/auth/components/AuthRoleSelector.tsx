import { User, Store, Bike, LucideIcon } from 'lucide-react'
import clsx from 'clsx'
import { USER_ROLES } from '@/config/constants'
import { UserRole } from '@/shared/types'

interface AuthRoleSelectorProps {
  value: UserRole
  onChange: (role: UserRole) => void
}

const OPTIONS: { value: UserRole; label: string; icon: LucideIcon }[] = [
  { value: USER_ROLES.CLIENT, label: 'Cliente', icon: User },
  { value: USER_ROLES.RESTAURANT, label: 'Restaurante', icon: Store },
  { value: USER_ROLES.DELIVERY, label: 'Domiciliario', icon: Bike },
]

/**
 * Reemplazo puramente visual del <select> nativo de "Tipo de cuenta".
 * Sigue siendo un grupo de radios reales (accesible, navegable por
 * teclado): mismo estado `role` y mismo `onChange` que ya existían,
 * solo cambia cómo se ve.
 */
export const AuthRoleSelector = ({ value, onChange }: AuthRoleSelectorProps) => {
  return (
    <div>
      <span id="account-role-label" className="block text-sm font-medium text-gray-700 mb-1.5">
        Tipo de cuenta
      </span>
      <div
        role="radiogroup"
        aria-labelledby="account-role-label"
        className="grid grid-cols-3 gap-2"
      >
        {OPTIONS.map(({ value: optionValue, label, icon: Icon }) => {
          const checked = value === optionValue
          return (
            <label
              key={optionValue}
              className={clsx(
                'flex flex-col items-center gap-1.5 rounded-2xl border py-3 px-2 text-center cursor-pointer transition-colors duration-150',
                checked
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
              )}
            >
              <input
                type="radio"
                name="account-role"
                value={optionValue}
                checked={checked}
                onChange={() => onChange(optionValue)}
                className="peer sr-only"
              />
              <span className="peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2 rounded-2xl">
                <Icon className="w-5 h-5" strokeWidth={2} />
              </span>
              <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
