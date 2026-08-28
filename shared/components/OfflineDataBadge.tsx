// Se muestra cuando una pantalla está usando datos guardados en el
// dispositivo (IndexedDB) porque no hay internet, en vez de datos frescos
// del servidor. Deja claro que lo que ve el usuario puede no estar
// actualizado (precios, disponibilidad, estado de un pedido).
export const OfflineDataBadge = () => (
  <div className="mb-4 rounded-xl bg-yellow-50 text-yellow-700 text-xs px-3 py-2 flex items-center gap-2">
    <span>📴</span>
    <span>Mostrando información guardada — sin conexión</span>
  </div>
)
