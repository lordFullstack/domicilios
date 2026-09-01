import type { CSSProperties } from "react";

/**
 * Sistema visual de marca "Rocket" — domicilios.
 *
 * Uso:
 *  - primary (5C · Bold): identidad general de marca (navbar, splash, login, empty states).
 *  - premium (5A): recompensas, logros, experiencias destacadas.
 *  - tech (5B): estados de sistema, procesos, loading, dashboards.
 *
 * No usar las tres variantes de forma intercambiable: cada una tiene un
 * significado dentro del design system (ver punto 9 del brief).
 */

export type RocketVariant = "primary" | "premium" | "tech";
export type RocketSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface RocketIconProps {
  variant?: RocketVariant;
  size?: RocketSize;
  className?: string;
  /**
   * Texto alternativo. Déjalo vacío (por defecto) si el ícono es puramente
   * decorativo — en ese caso también se aplica aria-hidden. Si el ícono
   * representa una acción (p. ej. botón), pasa un alt/aria-label semántico.
   */
  alt?: string;
}

const ROCKET_ASSETS: Record<RocketVariant, string> = {
  primary: "/brand/rocket/rocket-primary.png",
  premium: "/brand/rocket/rocket-premium.png",
  tech: "/brand/rocket/rocket-tech.png",
};

const ROCKET_SIZES: Record<RocketSize, number> = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export function RocketIcon({
  variant = "primary",
  size = "md",
  className,
  alt = "",
}: RocketIconProps) {
  const px = ROCKET_SIZES[size];
  const isDecorative = alt === "";

  const style: CSSProperties = {
    width: px,
    height: px,
    // aspect-ratio evita CLS si className sobreescribe solo uno de los ejes
    aspectRatio: "1 / 1",
  };

  return (
    <img
      src={ROCKET_ASSETS[variant]}
      alt={alt}
      aria-hidden={isDecorative ? true : undefined}
      draggable={false}
      style={style}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}

export default RocketIcon;
