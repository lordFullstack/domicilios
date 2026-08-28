import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Usamos un ícono propio en vez del marcador por defecto de Leaflet,
// porque el marcador default no carga bien con Vite (rutas rotas).
const bikeIcon = L.divIcon({
  html: `<div style="background:#2F5EFF;width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;font-size:16px;">🛵</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

interface DeliveryLiveMapProps {
  lat: number
  lng: number
  updatedAt?: string | null
}

export const DeliveryLiveMap = ({ lat, lng, updatedAt }: DeliveryLiveMapProps) => {
  const minutesAgo = updatedAt
    ? Math.max(0, Math.round((Date.now() - new Date(updatedAt).getTime()) / 60000))
    : null

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100" style={{ height: 220 }}>
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={bikeIcon}>
          <Popup>
            Tu domiciliario
            {minutesAgo !== null && (
              <>
                <br />
                Actualizado hace {minutesAgo === 0 ? 'un momento' : `${minutesAgo} min`}
              </>
            )}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
