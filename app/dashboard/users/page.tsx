'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface User {
  id: string
  nom: string
  email: string
  role: string
  statut: string
  telephone?: string
  dateEmbauche?: string
  livraisons?: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        const data = await response.json()
        setUsers(data)
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'nom',
      header: 'Nom',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'telephone',
      header: 'Téléphone',
    },
    {
      accessorKey: 'role',
      header: 'Rôle',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('role')}</Badge>
      ),
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
                : statut === 'en repos'
                  ? 'secondary'
                  : 'destructive'
            }
          >
            {statut}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'livraisons',
      header: 'Livraisons',
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
            Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs du système
          </p>
        </div>
        <Button disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {users.length} utilisateur(s) enregistré(s)
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
            <DataTable columns={columns} data={users} searchKey="nom" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
        >
          {statut}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'livraisons',
    header: 'Livraisons',
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

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'nom',
    header: 'Nom',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('role')}</Badge>
    ),
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
              : statut === 'suspendu'
                ? 'destructive'
                : 'secondary'
          }
        >
          {statut}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'dateCreation',
    header: 'Date de création',
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

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs du système
          </p>
        </div>
        <Button disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des utilisateurs</CardTitle>
          <CardDescription>
            {mockUsers.length} utilisateur(s) enregistré(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={mockUsers} searchKey="nom" />
        </CardContent>
      </Card>
    </div>
  )
}
