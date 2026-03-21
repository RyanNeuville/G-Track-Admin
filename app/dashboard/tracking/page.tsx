'use client'

import { TrackingMap } from '@/components/tracking-map'

export default function TrackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">
          Suivi en temps réel
        </h1>
        <p className="text-muted-foreground">
          Suivi de la position et du statut des chauffeurs
        </p>
      </div>

      <TrackingMap />
    </div>
  )
}
