import { Card } from '@/shared/components/Card'
import { Button } from '@/shared/components/Button'
import {
  OrderStatusIcon,
  RoleIcon,
  NAV_ICONS,
  ActionIcons,
} from '@/shared/constants/icons'
import { ORDER_STATUS, USER_ROLES } from '@/config/constants'

const COLOR_SWATCHES = [
  { name: 'ink', hex: '#0E0D0C', label: 'Fondo de página' },
  { name: 'surface', hex: '#18160F', label: 'Fondo de tarjetas' },
  { name: 'line', hex: '#2C2820', label: 'Bordes' },
  { name: 'ember', hex: '#FF6B35', label: 'Acento primario' },
  { name: 'teal', hex: '#2DD4BF', label: 'Acento / estado en vivo' },
  { name: 'text-hi', hex: '#F5F1E8', label: 'Texto principal' },
  { name: 'text-mid', hex: '#A8A190', label: 'Texto secundario' },
  { name: 'text-low', hex: '#635C4E', label: 'Texto terciario' },
]

const ORDER_STATUSES = Object.values(ORDER_STATUS)
const ROLES = Object.values(USER_ROLES)

export const DesignSystemPage = () => {
  return (
    <div className="min-h-screen bg-ink text-text-hi">
      {/* Header */}
      <div className="border-b border-line px-6 py-10 md:px-12">
        <p className="font-mono text-xs uppercase tracking-widest text-teal mb-3">
          Loop Maestro — Sistema de Diseño
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">
          Oscuro. Preciso. Apetitoso.
        </h1>
        <p className="text-text-mid max-w-xl">
          Vista previa de los componentes base rediseñados. Esta página no afecta
          ninguna pantalla existente — es un espacio de revisión antes de aplicar
          el sistema al resto de la app.
        </p>
      </div>

      <div className="px-6 py-12 md:px-12 space-y-16 max-w-5xl">
        {/* ===== COLOR ===== */}
        <section>
          <SectionLabel index="01" title="Color" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {COLOR_SWATCHES.map((swatch) => (
              <div key={swatch.name}>
                <div
                  className="h-20 rounded-lg border border-line mb-2"
                  style={{ backgroundColor: swatch.hex }}
                />
                <p className="font-mono text-xs text-text-hi">{swatch.name}</p>
                <p className="font-mono text-xs text-text-low">{swatch.hex}</p>
                <p className="text-xs text-text-mid mt-0.5">{swatch.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== TYPOGRAPHY ===== */}
        <section>
          <SectionLabel index="02" title="Tipografía" />
          <div className="mt-6 space-y-5">
            <div>
              <p className="font-display text-5xl font-semibold">Space Grotesk</p>
              <p className="text-text-mid text-sm mt-1">
                Display — títulos, headers, momentos importantes
              </p>
            </div>
            <div>
              <p className="font-sans text-2xl">Inter — texto de cuerpo</p>
              <p className="text-text-mid text-sm mt-1">
                Sans — párrafos, labels, UI general. Máxima legibilidad.
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl text-ember">$28.000 · #A3F91B02</p>
              <p className="text-text-mid text-sm mt-1">
                Mono — precios, códigos de orden, datos. Precisión tipo fintech.
              </p>
            </div>
          </div>
        </section>

        {/* ===== BUTTONS ===== */}
        <section>
          <SectionLabel index="03" title="Botones" />
          <div className="flex flex-wrap gap-4 mt-6">
            <Button variant="accent">Acción Principal</Button>
            <Button variant="accent-outline">Acción Secundaria</Button>
            <Button variant="accent" disabled>
              Deshabilitado
            </Button>
          </div>
          <p className="text-text-mid text-sm mt-4">
            El glow del botón principal es la "firma" visual del sistema — evoca
            el letrero encendido de un restaurante abierto de noche.
          </p>
        </section>

        {/* ===== CARDS ===== */}
        <section>
          <SectionLabel index="04" title="Tarjetas" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card variant="dark">
              <p className="font-display font-semibold mb-1">Tarjeta estática</p>
              <p className="text-text-mid text-sm">
                Fondo surface, borde sutil de 1px. Sin sombra pesada — la
                separación viene del contraste de superficie, no de la sombra.
              </p>
            </Card>
            <Card variant="dark" hoverable>
              <p className="font-display font-semibold mb-1">Tarjeta interactiva</p>
              <p className="text-text-mid text-sm">
                Pasa el mouse — el borde se tiñe de ember y la superficie se
                aclara levemente.
              </p>
            </Card>
          </div>
        </section>

        {/* ===== ICONS: ORDER STATUS ===== */}
        <section>
          <SectionLabel index="05" title="Iconos — Estados de Orden" />
          <div className="grid grid-cols-3 md:grid-cols-7 gap-4 mt-6">
            {ORDER_STATUSES.map((status) => (
              <div
                key={status}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-line"
              >
                <OrderStatusIcon status={status} className="w-6 h-6 text-ember" />
                <span className="text-xs text-text-mid text-center">{status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== ICONS: ROLES ===== */}
        <section>
          <SectionLabel index="06" title="Iconos — Roles" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {ROLES.map((role) => (
              <div
                key={role}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border border-line"
              >
                <RoleIcon role={role} className="w-6 h-6 text-teal" />
                <span className="text-xs text-text-mid capitalize">{role}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== ICONS: NAV + ACTIONS ===== */}
        <section>
          <SectionLabel index="07" title="Iconos — Navegación y Acciones" />
          <div className="flex flex-wrap gap-3 mt-6">
            {Object.entries(NAV_ICONS).map(([key, Icon]) => (
              <div
                key={key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-line text-text-mid"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-mono">{key}</span>
              </div>
            ))}
            {Object.entries(ActionIcons).map(([key, Icon]) => (
              <div
                key={key}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-line text-text-mid"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-mono">{key}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-8 border-t border-line text-text-low text-xs">
          Loop Maestro — Design System v1 · Ruta interna de revisión, no enlazada
          desde la navegación pública.
        </footer>
      </div>
    </div>
  )
}

const SectionLabel = ({ index, title }: { index: string; title: string }) => (
  <div className="flex items-baseline gap-3">
    <span className="font-mono text-xs text-ember">{index}</span>
    <h2 className="font-display text-xl font-semibold">{title}</h2>
  </div>
)
