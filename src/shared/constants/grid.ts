/**
 * Grid de restaurantes: fuente única para la lista real Y su skeleton (si
 * difieren, hay salto de layout al llegar los datos).
 *
 * 1 columna hasta 359px (en 320px dos cards de ~130px no se leen), 2 desde
 * 360px. NO sube a 3/4 columnas en md/lg: la app cliente vive dentro de
 * AppShell (max-w-md = 448px), así que en tablet/desktop el contenedor
 * sigue midiendo 448px y 3 columnas dejaban cards de ~130px.
 */
export const RESTAURANT_GRID_CLASSES = 'grid grid-cols-1 min-[360px]:grid-cols-2 gap-3 px-5'
