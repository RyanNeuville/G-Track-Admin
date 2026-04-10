'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, ShieldCheck, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface Livreur {
  id: string
  id_utilisateur: string
  nom: string
  email: string
  telephone: string
  statut: string
  permis: string
  vehicule: string
  immatriculation: string
}

interface User {
  id: string
  nom: string
  role: string
}

export default function LivreursPage() {
  const [livreurs, setLivreurs] = useState<Livreur[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    id_utilisateur: '',
    numero_permis: '',
    type_vehicule: '',
    immatriculation: ''
  })

  const fetchLivreurs = async () => {
    try {
      const response = await fetch('/api/livreurs')
      const data = await response.json()
      setLivreurs(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des livreurs')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      // On filtre pour ne garder que ceux qui ont le rôle 'driver' (Livreur) 
      // et qui ne sont pas déjà dans la liste des livreurs (optionnel mais recommandé)
      setAvailableUsers(data.filter((u: User) => u.role === 'driver'))
    } catch (error) {
      console.error('Erreur users:', error)
    }
  }

  useEffect(() => {
    fetchLivreurs()
    fetchAvailableUsers()
  }, [])

  const handleAddLivreur = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.id_utilisateur) {
      toast.error('Veuillez sélectionner un utilisateur')
      return
    }
    
    setIsAdding(true)
    try {
      const response = await fetch('/api/livreurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Erreur API')
      }
      
      toast.success('Livreur activé avec succès')
      fetchLivreurs()
      setIsDialogOpen(false)
      setFormData({ id_utilisateur: '', numero_permis: '', type_vehicule: '', immatriculation: '' })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsAdding(false)
    }
  }

  const columns: ColumnDef<Livreur>[] = [
    {
      accessorKey: 'nom',
      header: 'Nom',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.nom}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      )
    },
    {
      accessorKey: 'telephone',
      header: 'Téléphone',
    },
    {
      accessorKey: 'permis',
      header: 'Permis',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>{row.original.permis || 'N/A'}</span>
        </div>
      )
    },
    {
      accessorKey: 'vehicule',
      header: 'Véhicule',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>{row.original.vehicule || 'N/A'}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{row.original.immatriculation}</span>
        </div>
      )
    },
    {
      accessorKey: 'statut',
      header: 'Statut',
      cell: ({ row }) => {
        const statut = row.getValue('statut') as string
        return (
          <Badge
            variant={statut === 'actif' ? 'default' : 'secondary'}
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
            Livreurs
          </h1>
          <p className="text-muted-foreground">
            Gérez votre flotte de livreurs et leurs informations de conduite
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Activer un livreur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Activer un profil livreur</DialogTitle>
              <DialogDescription>
                Complétez les informations professionnelles pour un utilisateur ayant le rôle Livreur.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLivreur} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Sélectionner l'utilisateur</Label>
                <Select 
                  value={formData.id_utilisateur} 
                  onValueChange={(v) => setFormData({...formData, id_utilisateur: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un utilisateur..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="permis">Numéro de permis</Label>
                <Input 
                  id="permis" 
                  placeholder="Ex: PN-2024-001" 
                  value={formData.numero_permis}
                  onChange={(e) => setFormData({...formData, numero_permis: e.target.value})}
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicule">Type de véhicule</Label>
                  <Select 
                    value={formData.type_vehicule} 
                    onValueChange={(v) => setFormData({...formData, type_vehicule: v})}
                  >
                    <SelectTrigger id="vehicule">
                      <SelectValue placeholder="Type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Moto">Moto</SelectItem>
                      <SelectItem value="Voiture">Voiture</SelectItem>
                      <SelectItem value="Camionnette">Camionnette</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="immat">Immatriculation</Label>
                  <Input 
                    id="immat" 
                    placeholder="LT-123-AB" 
                    value={formData.immatriculation}
                    onChange={(e) => setFormData({...formData, immatriculation: e.target.value})}
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
                  Activer le profil
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flotte de livreurs</CardTitle>
          <CardDescription>
            {livreurs.length} livreur(s) opérationnel(s)
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
            <DataTable columns={columns} data={livreurs} searchKey="nom" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
