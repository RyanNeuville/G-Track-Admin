'use client'

import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()

  const fetchNotifications = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching notifications:', error)
      return
    }

    const formatted: Notification[] = data.map((n: any) => ({
      id: n.id,
      type: n.type as any,
      title: n.title,
      message: n.message,
      timestamp: new Date(n.created_at),
      read: n.is_read
    }))

    setNotifications(formatted)
  }

  useEffect(() => {
    fetchNotifications()

    // Subscribe to new notifications
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return

      const channel = supabase
        .channel('new-notifications')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const n = payload.new as any
            const newNotif: Notification = {
              id: n.id,
              type: n.type as any,
              title: n.title,
              message: n.message,
              timestamp: new Date(n.created_at),
              read: n.is_read
            }
            setNotifications((prev) => [newNotif, ...prev].slice(0, 10))
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupSubscription()
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-rose-500" />
      case 'info':
        return <Info className="h-4 w-4 text-sky-500" />
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-rose-500 text-[10px]">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0">
                {unreadCount} nouvelles
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-[11px] h-auto p-0"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <div className="max-h-[450px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'px-4 py-4 border-b cursor-pointer hover:bg-muted/50 transition-colors last:border-0',
                  !notification.read && 'bg-muted/20'
                )}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-sm leading-none', !notification.read ? 'font-semibold' : 'font-medium')}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">
                      {notification.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-12 text-center flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground font-medium">Vous n'avez pas de nouvelles notifications</p>
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 border-t bg-muted/10">
            <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground">
              Voir tout l'historique
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
