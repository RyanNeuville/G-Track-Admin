'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Driver {
  id: string
  nom: string
  lat: number
  lng: number
  statut: string
  colis: number
}

export function TrackingMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const markersRef = useRef<{ [key: string]: L.Marker }>({})
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const supabase = createClient()

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('livreurs')
      .select(`
        id,
        statut,
        latitude,
        longitude,
        profils (
          nom_complet
        )
      `)

    if (error) {
      console.error('Error fetching livreurs:', error)
      return
    }

    const formattedDrivers: Driver[] = data.map((d: any) => ({
      id: d.id,
      nom: d.profils?.nom_complet || 'Anonyme',
      lat: Number(d.latitude) || 4.05, // Default to Douala
      lng: Number(d.longitude) || 9.7,
      statut: d.statut,
      colis: 0,
    }))

    setDrivers(formattedDrivers)
  }

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map centered on Douala
    map.current = L.map(mapContainer.current).setView([4.05, 9.7], 13)

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current)

    fetchDrivers()

    // Real-time subscription
    const channel = supabase
      .channel('livreurs-location')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'livreurs' },
        (payload) => {
          const updatedDriver = payload.new as any
          setDrivers((prev) => 
            prev.map((d) => 
              d.id === updatedDriver.id 
                ? { ...d, lat: Number(updatedDriver.latitude), lng: Number(updatedDriver.longitude), statut: updatedDriver.statut }
                : d
            )
          )
        }
      )
      .subscribe()

    return () => {
      map.current?.remove()
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!map.current) return

    // Update markers based on drivers state
    drivers.forEach((driver) => {
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
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 13.1V16c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      if (markersRef.current[driver.id]) {
        markersRef.current[driver.id].setLatLng([driver.lat, driver.lng])
      } else {
        const marker = L.marker([driver.lat, driver.lng], { icon })
          .bindPopup(`<p style="font-weight: bold; margin: 0;">${driver.nom}</p><p style="margin: 0; font-size: 11px;">Statut: ${driver.statut}</p>`)
          .addTo(map.current!)
          .on('click', () => setSelectedDriver(driver))
        
        markersRef.current[driver.id] = marker
      }
    })
  }, [drivers])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Suivi en direct</CardTitle>
          <CardDescription>Position réelle synchronisée via Supabase (Douala, Cameroun)</CardDescription>
        </CardHeader>
        <CardContent>
          <div ref={mapContainer} className="h-[500px] rounded-md border border-border" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Livreurs connectés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {drivers.length === 0 && <p className="text-sm text-muted-foreground">Aucun livreur en ligne.</p>}
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  className={`flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors ${selectedDriver?.id === driver.id ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
                  onClick={() => {
                    setSelectedDriver(driver)
                    map.current?.setView([driver.lat, driver.lng], 15)
                  }}
                >
                  <div>
                    <p className="font-medium">{driver.nom}</p>
                    <p className="text-xs text-muted-foreground">{driver.lat.toFixed(5)}, {driver.lng.toFixed(5)}</p>
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full ${driver.statut === 'actif' ? 'bg-accent animate-pulse' : 'bg-muted-foreground'}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedDriver && (
          <Card>
            <CardHeader>
              <CardTitle>Détails du véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Livreur</span>
                  <span className="font-medium">{selectedDriver.nom}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-sm text-muted-foreground">Statut</span>
                  <span className={`text-sm font-medium ${selectedDriver.statut === 'actif' ? 'text-accent' : 'text-orange-500'}`}>{selectedDriver.statut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Position</span>
                  <span className="text-sm font-mono">{selectedDriver.lat.toFixed(4)}, {selectedDriver.lng.toFixed(4)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
