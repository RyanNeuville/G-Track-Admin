'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface Package {
  id: string
  numero: string
  destinataire: string
  adresse: string
  poids: string
  statut: string
  dateCreation: string
  valeur: string
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages')
        const data = await response.json()
        setPackages(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPackages()
  }, [])

  const columns: ColumnDef<Package>[] = [
    {
      accessorKey: 'numero',
      header: 'Numéro',
    },
    {
      accessorKey: 'destinataire',
      header: 'Destinataire',
    },
    {
      accessorKey: 'adresse',
      header: 'Adresse',
    },
    {
      accessorKey: 'poids',
      header: 'Poids',
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ row }) => {
        const statut = row.getValue('statut') as string
        return (
          <Badge
            variant={
              statut === 'livré'
                ? 'default'
                : statut === 'en transit'
                  ? 'secondary'
                  : statut === 'retard'
                    ? 'destructive'
                    : 'outline'
            }
          >
            {statut}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'valeur',
      header: 'Valeur',
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
            Colis
          </h1>
          <p className="text-muted-foreground">
            Gérez les colis en transit
          </p>
        </div>
        <Button disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau colis
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des colis</CardTitle>
          <CardDescription>
            {packages.length} coli(s) enregistré(s)
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
            <DataTable columns={columns} data={packages} searchKey="numero" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
