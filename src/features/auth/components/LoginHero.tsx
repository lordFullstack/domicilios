import { Rocket } from 'lucide-react'

/**
 * Hero exclusivo de la pantalla de Login.
 * Puramente visual — no contiene lógica, estado ni datos de negocio.
 *
 * Mobile: franja superior con esquinas inferiores redondeadas.
 * Desktop (md+): panel izquierdo a pantalla completa.
 */
export const LoginHero = () => {
  return (
    <div className="relative overflow-hidden bg-secondary md:h-auto md:min-h-screen md:w-full">
      {/* Gradiente base — azul cobalto de la marca */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-dark" />

      {/* Resplandores suaves — sugieren calidez de comida recién hecha, sin ruido visual */}
      <div className="absolute -top-20 -right-14 w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative safe-top px-8 pt-14 pb-20 md:pb-14 md:h-full md:flex md:flex-col md:justify-center md:min-h-screen">
        <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-md flex items-center justify-center shadow-floating animate-fade-in">
          <Rocket className="w-8 h-8 text-white" strokeWidth={2.25} />
        </div>

        <h1 className="font-display text-3xl md:text-[2.75rem] md:leading-tight font-extrabold text-white mt-5 animate-fade-slide-up">
          Domicilios Riohacha
        </h1>
        <p className="text-white/80 text-sm md:text-base mt-2 max-w-xs md:max-w-sm animate-fade-slide-up">
          Tu comida favorita, en minutos
        </p>

        <p className="hidden md:block text-white/60 text-sm mt-10 max-w-sm animate-fade-slide-up">
          Restaurantes locales, domiciliarios cerca de ti y seguimiento en
          tiempo real de tu pedido.
        </p>
      </div>
    </div>
  )
}
