import { RocketIcon, type RocketSize, type RocketVariant } from "./RocketIcon";

/**
 * Página/componente de verificación visual — NO dejar enrutado en producción.
 * Úsalo montándolo temporalmente para revisar el sistema y luego elimínalo
 * o quítalo de las rutas.
 */
const VARIANTS: RocketVariant[] = ["primary", "premium", "tech"];
const SIZES: RocketSize[] = ["xs", "sm", "md", "lg", "xl"];

export default function RocketIconDemo() {
  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      {VARIANTS.map((variant) => (
        <div key={variant}>
          <h3 style={{ marginBottom: 8, textTransform: "capitalize" }}>{variant}</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
            {SIZES.map((size) => (
              <div key={size} style={{ textAlign: "center" }}>
                <RocketIcon variant={variant} size={size} />
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{size}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
