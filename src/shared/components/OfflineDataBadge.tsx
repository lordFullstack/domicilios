interface OfflineDataBadgeProps {
  /** Timestamp (Date.now()) de cuándo se guardó esta copia local. Si no se
   * pasa, se muestra el mensaje genérico (compatibilidad con usos previos). */
  cachedAt?: number | null
}

// Se muestra cuando una pantalla está usando datos guardados en el
// dispositivo (IndexedDB) porque no hay internet, en vez de datos frescos
// del servidor. Deja claro que lo que ve el usuario puede no estar
// actualizado (precios, disponibilidad, estado de un pedido).
export const OfflineDataBadge = ({ cachedAt }: OfflineDataBadgeProps) => {
  const syncedLabel = cachedAt
    ? new Date(cachedAt).toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="mb-4 rounded-xl bg-yellow-50 text-yellow-700 text-xs px-3 py-2 flex items-center gap-2">
      <span>📴</span>
      <span>
        Mostrando información guardada — sin conexión
        {syncedLabel && <> · Última sincronización: {syncedLabel}</>}
      </span>
    </div>
  )
}
