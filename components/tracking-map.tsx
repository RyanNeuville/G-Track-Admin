'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Driver {
  id: string
  nom: string
  lat: number
  lng: number
  statut: 'actif' | 'inactif' | 'en repos'
  colis: number
}

const driversData: Driver[] = [
  { id: '1', nom: 'Jean Dupont', lat: 48.8566, lng: 2.3522, statut: 'actif', colis: 8 },
  { id: '2', nom: 'Marie Martin', lat: 48.9215, lng: 2.3989, statut: 'actif', colis: 12 },
  { id: '3', nom: 'Pierre Bernard', lat: 48.7465, lng: 2.2987, statut: 'en repos', colis: 5 },
  { id: '4', nom: 'Sophie Leclerc', lat: 48.8355, lng: 2.3589, statut: 'actif', colis: 10 },
]

export function TrackingMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    map.current = L.map(mapContainer.current).setView([48.8566, 2.3522], 11)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    // Clean up
    return () => {
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (!map.current) return

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Add driver markers
    driversData.forEach((driver) => {
      const color =
        driver.statut === 'actif'
          ? '#2ECC71'
          : driver.statut === 'en repos'
            ? '#F39C12'
            : '#95A5A6'

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${driver.colis}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      })

      const marker = L.marker([driver.lat, driver.lng], { icon })
        .bindPopup(
          `<div style="text-align: center;">
            <p style="font-weight: bold; margin: 0 0 4px 0;">${driver.nom}</p>
            <p style="font-size: 12px; margin: 0 0 4px 0;">Statut: ${driver.statut}</p>
            <p style="font-size: 12px; margin: 0;">Colis: ${driver.colis}</p>
          </div>`
        )
        .addTo(map.current!)
        .on('click', () => setSelectedDriver(driver))

      markersRef.current.push(marker)
    })
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Suivi en direct</CardTitle>
          <CardDescription>Position actuelle des chauffeurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={mapContainer}
            className="h-96 rounded-md border border-border"
          />
        </CardContent>
      </Card>

      {selectedDriver && (
        <Card>
          <CardHeader>
            <CardTitle>Informations du chauffeur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Nom:</span> {selectedDriver.nom}
              </p>
              <p>
                <span className="font-medium">Statut:</span>{' '}
                <span
                  className={
                    selectedDriver.statut === 'actif'
                      ? 'text-accent'
                      : 'text-muted-foreground'
                  }
                >
                  {selectedDriver.statut}
                </span>
              </p>
              <p>
                <span className="font-medium">Colis en cours:</span>{' '}
                {selectedDriver.colis}
              </p>
              <p>
                <span className="font-medium">Position:</span> {selectedDriver.lat.toFixed(4)}, {selectedDriver.lng.toFixed(4)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Chauffeurs actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {driversData.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center justify-between rounded-md border p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedDriver(driver)}
              >
                <div>
                  <p className="font-medium">{driver.nom}</p>
                  <p className="text-sm text-muted-foreground">
                    {driver.colis} colis
                  </p>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    driver.statut === 'actif'
                      ? 'bg-accent'
                      : driver.statut === 'en repos'
                        ? 'bg-yellow-500'
                        : 'bg-muted-foreground'
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
