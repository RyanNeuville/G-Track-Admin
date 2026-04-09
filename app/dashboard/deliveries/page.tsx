'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

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
  const [isAdding, setIsAdding] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    region: '',
    colis: '',
    distance: '',
    date: new Date().toISOString().split('T')[0]
  })

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries')
      const data = await response.json()
      setDeliveries(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des tournées')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erreur API')
      
      toast.success('Tournée de livraison créée')
      fetchDeliveries()
      setIsDialogOpen(false)
      setFormData({ 
        region: '', 
        colis: '', 
        distance: '', 
        date: new Date().toISOString().split('T')[0] 
      })
    } catch (error) {
      toast.error('Erreur lors de la création')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteDelivery = async (id: string) => {
    if (!confirm('Souhaitez-vous vraiment annuler cette tournée ?')) return
    
    setIsDeletingId(id)
    try {
      const response = await fetch(`/api/deliveries/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erreur API')
      
      setDeliveries(deliveries.filter(d => d.id !== id))
      toast.success('Tournée annulée avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeletingId(null)
    }
  }

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
      header: 'Nb Colis',
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
      cell: ({ row }) => {
        const id = row.original.id
        return (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">
              <Eye className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-destructive"
              onClick={() => handleDeleteDelivery(id)}
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
            Livraisons
          </h1>
          <p className="text-muted-foreground">
            Planifiez et suivez les tournées de livraison en cours
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tournée
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une tournée</DialogTitle>
              <DialogDescription>
                Planifiez une nouvelle tournée de livraison pour aujourd'hui ou une date ultérieure.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDelivery} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="region">Région / Zone</Label>
                <Input 
                  id="region" 
                  placeholder="Ex: Douala Littoral" 
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date de livraison</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colis">Prévu (colis)</Label>
                  <Input 
                    id="colis" 
                    type="number"
                    placeholder="Ex: 25" 
                    value={formData.colis}
                    onChange={(e) => setFormData({...formData, colis: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance">Distance estimée (km)</Label>
                <Input 
                  id="distance" 
                  type="number"
                  placeholder="Ex: 120" 
                  value={formData.distance}
                  onChange={(e) => setFormData({...formData, distance: e.target.value})}
                  required 
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAdding}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Planifier
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
