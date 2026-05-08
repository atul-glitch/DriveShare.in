import { useEffect, useRef } from 'react'

// Dynamically loads Leaflet to avoid SSR issues
export default function VehicleMap({ lat, lng, city, zoom = 13 }) {
  const mapRef     = useRef(null)
  const mapInstance = useRef(null)

  useEffect(() => {
    if (!lat || !lng || mapInstance.current) return

    // Leaflet is loaded via CDN in index.html
    const L = window.L
    if (!L) return

    mapInstance.current = L.map(mapRef.current, {
      center: [lat, lng],
      zoom,
      zoomControl: true,
      scrollWheelZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance.current)

    // Custom marker
    const icon = L.divIcon({
      html: `
        <div style="
          width: 36px; height: 36px;
          background: #f97316;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #fff;
          box-shadow: 0 2px 12px rgba(249,115,22,0.5);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">🚗</span>
        </div>`,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    })

    L.marker([lat, lng], { icon })
      .addTo(mapInstance.current)
      .bindPopup(`<b>${city || 'Vehicle Location'}</b>`)
      .openPopup()

    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [lat, lng, city, zoom])

  return (
    <div
      ref={mapRef}
      style={{ height: 260, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}
    />
  )
}
