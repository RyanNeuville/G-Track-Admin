'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface Delivery {
  id: string
  numero: string
  chauffeur: string
  date: string
  colis: number
  distance: string
  statut: string
  heure_depart: string
  region: string
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/deliveries')
        const data = await response.json()
        setDeliveries(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDeliveries()
  }, [])

  const columns: ColumnDef<Delivery>[] = [
    {
      accessorKey: 'numero',
      header: 'Numéro de tournée',
    },
    {
      accessorKey: 'chauffeur',
      header: 'Chauffeur',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'colis',
      header: 'Nombre de colis',
    },
    {
      accessorKey: 'distance',
      header: 'Distance',
    },
    {
      accessorKey: 'region',
      header: 'Région',
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ row }) => {
        const statut = row.getValue('statut') as string
        return (
          <Badge
            variant={
              statut === 'terminée'
                ? 'default'
                : statut === 'en cours'
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
            <Eye className="h-4 w-4" />
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
            Livraisons
          </h1>
          <p className="text-muted-foreground">
            Gérez les tournées de livraison
          </p>
        </div>
        <Button disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tournée
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des livraisons</CardTitle>
          <CardDescription>
            {deliveries.length} tournée(s) enregistrée(s)
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
            <DataTable columns={columns} data={deliveries} searchKey="numero" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
