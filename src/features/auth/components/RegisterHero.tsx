import { Rocket, Store, Soup, Bike } from 'lucide-react'

const FEATURES = [
  { icon: Store, label: 'Restaurantes locales verificados' },
  { icon: Soup, label: 'Cientos de platos para escoger' },
  { icon: Bike, label: 'Entrega rápida en tu zona' },
]

/**
 * Hero exclusivo de la pantalla de Registro.
 * Mismo sistema visual del Login (gradiente, radius, tokens, motion),
 * pero archivo nuevo e independiente: este LOOP no puede tocar
 * LoginPage.tsx ni LoginHero.tsx. Contenido propio, no es una copia.
 */
export const RegisterHero = () => {
  return (
    <div className="relative overflow-hidden bg-secondary md:h-full md:min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark" />
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative safe-top px-8 pt-12 pb-16 md:min-h-screen md:flex md:flex-col md:justify-between md:py-16">
        {/* Marca */}
        <div className="animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-floating">
            <Rocket className="w-8 h-8 text-white" strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-3xl md:text-[2.5rem] md:leading-tight font-extrabold text-white mt-5 animate-fade-slide-up">
            Únete y empieza a pedir
          </h1>
          <p className="text-white/80 text-sm md:text-base mt-2 max-w-xs animate-fade-slide-up">
            Crea tu cuenta en Domicilios Riohacha
          </p>
        </div>

        {/* Comunidad — elemento visual protagonista, distinto al del Login */}
        <div className="mt-10 md:mt-0 animate-fade-slide-up">
          <p className="hidden md:block text-white/70 text-sm font-medium mb-3">
            Todo lo que necesitas en un solo lugar
          </p>
          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-floating max-w-xs">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2 shrink-0">
                <span className="w-9 h-9 rounded-full bg-accent border-2 border-secondary/40 flex items-center justify-center">
                  <Store className="w-4 h-4 text-secondary" strokeWidth={2.25} />
                </span>
                <span className="w-9 h-9 rounded-full bg-white/80 border-2 border-secondary/40 flex items-center justify-center">
                  <Soup className="w-4 h-4 text-secondary" strokeWidth={2.25} />
                </span>
                <span className="w-9 h-9 rounded-full bg-primary-dark border-2 border-secondary/40 flex items-center justify-center">
                  <Bike className="w-4 h-4 text-white" strokeWidth={2.25} />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold whitespace-nowrap">Riohacha te espera</p>
                <p className="text-white/60 text-xs truncate">Restaurantes, platos y domiciliarios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Beneficios — visibles donde hay espacio de sobra (desktop) */}
        <ul className="hidden md:flex md:flex-col md:gap-3 mt-10">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 text-white/80 text-sm">
              <span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" strokeWidth={2} />
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
