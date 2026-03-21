'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface Route {
  id: string
  nom: string
  region: string
  zone: string
  distance_km: number
  duree_estimee: string
  points_arret: number
  chauffeur: string
  statut: string
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch('/api/routes')
        const data = await response.json()
        setRoutes(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoutes()
  }, [])

  const columns: ColumnDef<Route>[] = [
    {
      accessorKey: 'nom',
      header: 'Nom de la route',
    },
    {
      accessorKey: 'region',
      header: 'Région',
    },
    {
      accessorKey: 'zone',
      header: 'Zone',
    },
    {
      accessorKey: 'distance_km',
      header: 'Distance (km)',
    },
    {
      accessorKey: 'duree_estimee',
      header: 'Durée estimée',
    },
    {
      accessorKey: 'points_arret',
      header: 'Points d\'arrêt',
    },
    {
      accessorKey: 'chauffeur',
      header: 'Chauffeur assigné',
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ row }) => {
        const statut = row.getValue('statut') as string
        return (
          <Badge
            variant={
              statut === 'actif'
                ? 'default'
                : statut === 'en pause'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {statut}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      cell: () => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            Itinéraires
          </h1>
          <p className="text-muted-foreground">
            Gérez les itinéraires de livraison
          </p>
        </div>
        <Button disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel itinéraire
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des itinéraires</CardTitle>
          <CardDescription>
            {routes.length} itinéraire(s) enregistré(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <DataTable columns={columns} data={routes} searchKey="nom" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
