'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, Trash2, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

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
  const [isAdding, setIsAdding] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  
  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    destinataire: '',
    adresse: '',
    poids: ''
  })

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des colis')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const response = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Erreur API')
      
      const newPackage = await response.json()
      setPackages([newPackage, ...packages])
      setIsDialogOpen(false)
      setFormData({ destinataire: '', adresse: '', poids: '' })
      toast.success('Colis ajouté avec succès')
    } catch (error) {
      toast.error("Erreur lors de l'ajout du colis")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce colis ?')) return
    
    setIsDeletingId(id)
    try {
      const response = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erreur API')
      
      setPackages(packages.filter(p => p.id !== id))
      toast.success('Colis supprimé avec succès')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeletingId(null)
    }
  }

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
              statut.toLowerCase() === 'livré'
                ? 'default'
                : statut.toLowerCase() === 'en transit'
                  ? 'secondary'
                  : statut.toLowerCase() === 'en attente'
                    ? 'outline'
                    : 'destructive'
            }
          >
            {statut}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'dateCreation',
      header: 'Date',
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
              onClick={() => handleDeletePackage(id)}
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
            Colis
          </h1>
          <p className="text-muted-foreground">
            Gérez les colis en transit et en attente
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau colis
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un colis</DialogTitle>
              <DialogDescription>
                Créez un nouveau colis. Le numéro de suivi sera généré automatiquement.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPackage} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="destinataire">Destinataire</Label>
                <Input 
                  id="destinataire" 
                  placeholder="Ex: Jean Dupont" 
                  value={formData.destinataire}
                  onChange={(e) => setFormData({...formData, destinataire: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse de livraison</Label>
                <Input 
                  id="adresse" 
                  placeholder="Ex: 123 Rue de la République, 75001 Paris" 
                  value={formData.adresse}
                  onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poids">Poids (kg)</Label>
                <Input 
                  id="poids" 
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Ex: 2.5" 
                  value={formData.poids}
                  onChange={(e) => setFormData({...formData, poids: e.target.value})}
                  required 
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAdding}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ajouter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
