import { Rocket, Soup, MapPin, Clock3, ShieldCheck } from 'lucide-react'

const FEATURES = [
  { icon: MapPin, label: 'Restaurantes locales' },
  { icon: Clock3, label: 'Domiciliarios cerca de ti' },
  { icon: ShieldCheck, label: 'Seguimiento en tiempo real' },
]

/**
 * Hero exclusivo de la pantalla de Login.
 * Puramente visual — no contiene lógica, estado ni datos de negocio.
 *
 * Mobile: franja superior con esquinas inferiores redondeadas.
 * Desktop (md+): columna izquierda a pantalla completa, con el contenido
 * distribuido (marca / comida / beneficios) para aprovechar el alto
 * disponible en vez de dejarlo vacío.
 */
export const LoginHero = () => {
  return (
    <div className="relative overflow-hidden bg-secondary md:h-full md:min-h-screen">
      {/* Gradiente base — azul cobalto de la marca */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark" />

      {/* Resplandores suaves — sugieren calidez de comida recién hecha, sin ruido visual */}
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative safe-top px-8 pt-12 pb-16 md:min-h-screen md:flex md:flex-col md:justify-between md:py-16">
        {/* Marca */}
        <div className="animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-floating">
            <Rocket className="w-8 h-8 text-white" strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-3xl md:text-[2.5rem] md:leading-tight font-extrabold text-white mt-5 animate-fade-slide-up">
            Domicilios Riohacha
          </h1>
          <p className="text-white/80 text-sm md:text-base mt-2 max-w-xs animate-fade-slide-up">
            Tu comida favorita, en minutos
          </p>
        </div>

        {/* Comida — elemento visual protagonista del hero */}
        <div className="mt-10 md:mt-0 animate-fade-slide-up">
          <p className="hidden md:block text-white/70 text-sm font-medium mb-3">
            El sabor de tu ciudad, en tus manos
          </p>
          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-floating max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                <Soup className="w-5 h-5 text-secondary" strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">Bandeja paisa</p>
                <p className="text-white/60 text-xs truncate">Pa&apos;Comer Express</p>
              </div>
              <div className="ml-auto text-right shrink-0 pl-2">
                <p className="text-white text-sm font-bold whitespace-nowrap">12 min</p>
                <p className="text-white/50 text-[11px] whitespace-nowrap">en camino</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/15 overflow-hidden">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-accent to-white" />
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
