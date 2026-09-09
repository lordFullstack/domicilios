import { Rocket, MapPin, Clock3, ShieldCheck } from 'lucide-react'

const FEATURES = [
  { icon: MapPin, label: 'Restaurantes locales' },
  { icon: Clock3, label: 'Domiciliarios cerca de ti' },
  { icon: ShieldCheck, label: 'Seguimiento en tiempo real' },
]

/**
 * Hero exclusivo de la pantalla de Login.
 * Puramente visual — no contiene lógica, estado ni datos de negocio.
 *
 * Jerarquía (LOOP 01.2): Logo → Marca → Bandeja paisa (foto real,
 * protagonista) → Tagline → texto secundario.
 *
 * Mobile: franja superior con esquinas inferiores redondeadas.
 * Desktop (md+): columna izquierda a pantalla completa; la fotografía
 * ocupa el espacio flexible entre marca y tagline (md:flex-1) y se
 * desborda hacia el borde derecho del panel (md:-mr-8) para sentirse
 * integrada, no "pegada" en una tarjeta.
 */
export const LoginHero = () => {
  return (
    <div className="relative overflow-hidden bg-secondary md:h-full md:min-h-screen">
      {/* Gradiente base — azul cobalto de la marca */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark" />

      {/* Resplandores suaves — sugieren calidez, sin ruido visual */}
      <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

      <div className="relative safe-top px-8 pt-12 pb-10 md:min-h-screen md:flex md:flex-col md:py-14">
        {/* 1-2. Logo + marca */}
        <div className="shrink-0 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-floating">
            <Rocket className="w-8 h-8 text-white" strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-3xl md:text-[2.5rem] md:leading-tight font-extrabold text-white mt-5 animate-fade-slide-up">
            Domicilios Riohacha
          </h1>
        </div>

        {/* 3. Bandeja paisa — foco visual principal, foto real del proyecto */}
        <div className="relative h-48 sm:h-56 md:h-auto md:flex-1 md:-mr-8 my-6 md:my-8 min-h-[180px] overflow-hidden rounded-[2rem] md:rounded-l-[2.5rem] md:rounded-r-none shadow-floating animate-fade-slide-up">
          <picture>
            <source
              type="image/webp"
              srcSet="/food/bandeja-paisa-640.webp 640w, /food/bandeja-paisa-1024.webp 1024w"
              sizes="(min-width: 768px) 46vw, 92vw"
            />
            <img
              src="/food/bandeja-paisa-1024.jpg"
              srcSet="/food/bandeja-paisa-640.jpg 640w, /food/bandeja-paisa-1024.jpg 1024w"
              sizes="(min-width: 768px) 46vw, 92vw"
              alt="Bandeja paisa: plato colombiano con frijoles, arroz, carne molida, chorizo, huevo frito, plátano maduro y arepa"
              width={1024}
              height={683}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 45%' }}
            />
          </picture>

          {/* Velo azul para integrar la foto con el fondo — sin corte duro */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/50 via-primary-dark/5 to-transparent" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
          <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-primary-dark/55 to-transparent" />
        </div>

        {/* 4-5. Tagline + texto secundario */}
        <div className="shrink-0 animate-fade-slide-up">
          <p className="text-white text-base md:text-lg font-semibold">
            Tu comida favorita, en minutos
          </p>

          <ul className="hidden md:flex md:flex-col md:gap-2.5 mt-5">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-white/75 text-sm">
                <span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
