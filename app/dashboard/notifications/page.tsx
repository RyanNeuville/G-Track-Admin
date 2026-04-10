'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Livraison complétée',
    message: 'Jean Dupont a complété sa tournée de 8 colis',
    timestamp: new Date(Date.now() - 5 * 60000),
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Retard détecté',
    message: 'Marie Martin a 15 minutes de retard sur sa tournée',
    timestamp: new Date(Date.now() - 15 * 60000),
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Nouveau colis ajouté',
    message: '5 nouveaux colis ont été ajoutés au système',
    timestamp: new Date(Date.now() - 30 * 60000),
    read: true,
  },
  {
    id: '4',
    type: 'success',
    title: 'Livreur connecté',
    message: 'Pierre Bernard s\'est connecté au système',
    timestamp: new Date(Date.now() - 1 * 3600000),
    read: true,
  },
  {
    id: '5',
    type: 'warning',
    title: 'Véhicule en maintenance',
    message: 'Le véhicule VH-001 est en maintenance programmée',
    timestamp: new Date(Date.now() - 2 * 3600000),
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [selectedType, setSelectedType] = useState<'all' | 'unread' | Notification['type']>('all')

  const filteredNotifications = notifications.filter((n) => {
    if (selectedType === 'unread') return !n.read
    if (selectedType === 'all') return true
    return n.type === selectedType
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    toast.success('Marqué comme lu')
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success('Notification supprimée')
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('Toutes les notifications marquées comme lues')
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-accent" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'À l\'instant'
    if (diffMins < 60) return `il y a ${diffMins}m`
    if (diffMins < 1440) return `il y a ${Math.floor(diffMins / 60)}h`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-balance text-3xl font-bold tracking-tight">
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Gérez vos notifications et alertes
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            Tout marquer comme lu ({unreadCount})
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Centre des notifications</CardTitle>
          <CardDescription>
            Total: {notifications.length} | Non lues: {unreadCount}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
            <TabsList>
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="unread">Non lues ({unreadCount})</TabsTrigger>
              <TabsTrigger value="success">Succès</TabsTrigger>
              <TabsTrigger value="warning">Avertissements</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedType as string} className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start justify-between gap-4 p-4 rounded-lg border ${
                      !notification.read ? 'bg-muted/30 border-primary/50' : 'bg-muted/10'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="default" className="h-2 w-2 p-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Marquer comme lu
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune notification dans cette catégorie
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
