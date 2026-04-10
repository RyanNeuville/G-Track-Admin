'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Plus, Eye, Trash2, Loader2, UserPlus, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Package {
  id: string
  numero: string
  destinataire: string
  adresse: string
  poids: string
  statut: string
  dateCreation: string
  valeur: number
}

interface Driver {
  id: string
  nom: string
}

const CAMEROON_CITIES = [
  'Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Maroua', 
  'Bamenda', 'Buea', 'Kribi', 'Edea', 'Bertoua'
]

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  
  // Form States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null)
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  
  const [formData, setFormData] = useState({
    destinataire: '',
    ville: 'Douala',
    adresse_precise: '',
    poids: '',
    valeur: ''
  })

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/colis')
      const data = await response.json()
      setPackages(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des colis')
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/livreurs')
      const data = await response.json()
      setDrivers(data)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.all([fetchPackages(), fetchDrivers()])
      setIsLoading(false)
    }
    init()
  }, [])

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      const fullAddress = `${formData.adresse_precise}, ${formData.ville}`
      const response = await fetch('/api/colis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adresse: fullAddress
        })
      })

      if (!response.ok) throw new Error('Erreur API')
      
      const newPackage = await response.json()
      setPackages([newPackage, ...packages])
      setIsAddOpen(false)
      setFormData({ destinataire: '', ville: 'Douala', adresse_precise: '', poids: '', valeur: '' })
      toast.success('Colis ajouté avec succès')
    } catch (error) {
      toast.error("Erreur lors de l'ajout du colis")
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditPackage = (pkg: Package) => {
    const [precise, ville] = pkg.adresse.includes(',') 
      ? pkg.adresse.split(',').map(s => s.trim()) 
      : [pkg.adresse, 'Douala']
      
    setSelectedPackage(pkg)
    setFormData({
      destinataire: pkg.destinataire,
      ville: ville || 'Douala',
      adresse_precise: precise,
      poids: pkg.poids.replace(' kg', ''),
      valeur: String(pkg.valeur)
    })
    setIsEditOpen(true)
  }

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage) return
    setIsUpdating(true)
    try {
      const fullAddress = `${formData.adresse_precise}, ${formData.ville}`
      const response = await fetch(`/api/colis/${selectedPackage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adresse: fullAddress
        })
      })

      if (!response.ok) throw new Error('Erreur API')
      
      toast.success('Colis mis à jour')
      setIsEditOpen(false)
      fetchPackages()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAssignPackage = async () => {
    if (!selectedPackage || !selectedDriverId) return
    setIsAssigning(true)
    try {
      const response = await fetch('/api/colis/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          driverId: selectedDriverId,
          region: selectedPackage.adresse.split(',').pop()?.trim() || 'Locale'
        })
      })

      if (!response.ok) throw new Error('Erreur assignation')
      
      toast.success('Colis assigné au livreur')
      setIsAssignOpen(false)
      fetchPackages() // Refresh to show new status
    } catch (error) {
      toast.error("Erreur lors de l'assignation")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleDeletePackage = async () => {
    if (!packageToDelete) return
    
    setIsDeletingId(packageToDelete.id)
    try {
      const response = await fetch(`/api/colis/${packageToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erreur API')
      
      setPackages(packages.filter(p => p.id !== packageToDelete.id))
      toast.success('Colis supprimé avec succès')
      setIsDeleteOpen(false)
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsDeletingId(null)
      setPackageToDelete(null)
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
      accessorKey: 'valeur',
      header: 'Valeur (FCFA)',
      cell: ({ row }) => {
        const val = row.getValue('valeur') as number
        return <span>{val.toLocaleString()} FCFA</span>
      }
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
        const pkg = row.original
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => {
                setSelectedPackage(pkg)
                setIsAssignOpen(true)
              }}
              title="Assigner à un livreur"
              disabled={pkg.statut.toLowerCase() === 'livré'}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => handleEditPackage(pkg)}
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 text-destructive"
              onClick={() => {
                setPackageToDelete(pkg)
                setIsDeleteOpen(true)
              }}
              disabled={isDeletingId === pkg.id}
              title="Supprimer"
            >
              {isDeletingId === pkg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
            Gérez les colis Glotelho et assignez-les aux livreurs
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
                Créez un nouveau colis. Le numéro de suivi GLO sera généré automatiquement.
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ville (Cameroun)</Label>
                  <Select 
                    value={formData.ville} 
                    onValueChange={(v) => setFormData({...formData, ville: v})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAMEROON_CITIES.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adresse_precise">Adresse précise</Label>
                  <Input 
                    id="adresse_precise" 
                    placeholder="Ex: Akwa, Rue Njo-Njo" 
                    value={formData.adresse_precise}
                    onChange={(e) => setFormData({...formData, adresse_precise: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
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
                <div className="space-y-2">
                  <Label htmlFor="valeur">Valeur marchande (FCFA)</Label>
                  <Input 
                    id="valeur" 
                    type="number"
                    placeholder="Ex: 50000" 
                    value={formData.valeur}
                    onChange={(e) => setFormData({...formData, valeur: e.target.value})}
                    required 
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={isAdding}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Ajouter le colis
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

      {/* Dialog d'édition */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le colis {selectedPackage?.numero}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdatePackage} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-destinataire">Destinataire</Label>
              <Input 
                id="edit-destinataire" 
                value={formData.destinataire}
                onChange={(e) => setFormData({...formData, destinataire: e.target.value})}
                required 
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Select 
                  value={formData.ville} 
                  onValueChange={(v) => setFormData({...formData, ville: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMEROON_CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-adresse">Adresse précise</Label>
                <Input 
                  id="edit-adresse" 
                  value={formData.adresse_precise}
                  onChange={(e) => setFormData({...formData, adresse_precise: e.target.value})}
                  required 
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-poids">Poids (kg)</Label>
                <Input 
                  id="edit-poids" 
                  type="number"
                  step="0.1"
                  value={formData.poids}
                  onChange={(e) => setFormData({...formData, poids: e.target.value})}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-valeur">Valeur (FCFA)</Label>
                <Input 
                  id="edit-valeur" 
                  type="number"
                  value={formData.valeur}
                  onChange={(e) => setFormData({...formData, valeur: e.target.value})}
                  required 
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>
                Annuler
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer les modifications
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog d'assignation */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un livreur</DialogTitle>
            <DialogDescription>
              Choisissez le livreur responsable du colis <strong>{selectedPackage?.numero}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Livreur (Chauffeur actif)</Label>
              <Select onValueChange={setSelectedDriverId} value={selectedDriverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un livreur" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.nom}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Aucun livreur actif disponible
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)} disabled={isAssigning}>
              Annuler
            </Button>
            <Button onClick={handleAssignPackage} disabled={!selectedDriverId || isAssigning}>
              {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer l'assignation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de suppression */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le colis <strong>{packageToDelete?.numero}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingId !== null}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDeletePackage()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeletingId !== null}
            >
              {isDeletingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
