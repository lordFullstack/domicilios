/** Formatea un número como pesos colombianos: 28000 -> "$28.000" */
export const formatCOP = (value: number): string => `$${value.toLocaleString('es-CO')}`
