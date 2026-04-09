'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Edit, Trash2, Loader2, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

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
  const [isAdding, setIsAdding] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    region: '',
    distance_km: '',
    points_arret: ''
  })

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/routes')
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des itinéraires')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [])

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erreur API')
      
      const newRouteRaw = await response.json()
      // The API returns raw data, the GET maps it. Let's refetch or map manually
      toast.success('Itinéraire créé avec succès')
      fetchRoutes() 
      setIsDialogOpen(false)
      setFormData({ region: '', distance_km: '', points_arret: '' })
    } catch (error) {
      toast.error("Erreur lors de la création de l'itinéraire")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet itinéraire ?')) return
    
    setIsDeletingId(id)
    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erreur API')
      
      setRoutes(routes.filter(r => r.id !== id))
      toast.success('Itinéraire supprimé')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeletingId(null)
    }
  }

  const columns: ColumnDef<Route>[] = [
    {
      accessorKey: 'nom',
      header: 'Nom de la route',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue('nom')}</span>
        </div>
      )
    },
    {
      accessorKey: 'region',
      header: 'Région',
    },
    {
      accessorKey: 'distance_km',
      header: 'Distance',
      cell: ({ row }) => `${row.getValue('distance_km')} km`
    },
    {
      accessorKey: 'duree_estimee',
      header: 'Durée est.',
    },
    {
      accessorKey: 'points_arret',
      header: 'Arrêts',
    },
    {
      accessorKey: 'chauffeur',
      header: 'Chauffeur',
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
      cell: ({ row }) => {
        const id = row.original.id
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-destructive"
              onClick={() => handleDeleteRoute(id)}
              disabled={isDeletingId === id}
            >
              {isDeletingId === id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        )
      },
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
            Planifiez et gérez les routes de livraison régionales
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel itinéraire
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un itinéraire</DialogTitle>
              <DialogDescription>
                Définissez une nouvelle route de livraison.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRoute} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="region">Région</Label>
                <Input 
                  id="region" 
                  placeholder="Ex: Douala Nord" 
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input 
                    id="distance" 
                    type="number"
                    placeholder="Ex: 45" 
                    value={formData.distance_km}
                    onChange={(e) => setFormData({...formData, distance_km: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stops">Nombre d'arrêts</Label>
                  <Input 
                    id="stops" 
                    type="number"
                    placeholder="Ex: 12" 
                    value={formData.points_arret}
                    onChange={(e) => setFormData({...formData, points_arret: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAdding}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
            <DataTable columns={columns} data={routes} searchKey="region" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
