'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { NotificationsCenter } from './notifications-center'

export function DashboardHeader() {
  const [email, setEmail] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setEmail(user?.email || null)
    }
    getUser()
  }, [])

  const initials = email
    ?.split('@')[0]
    .substring(0, 2)
    .toUpperCase() || 'AD'

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur px-8 py-4 ml-64">
      <div />
      <div className="flex items-center gap-4">
        <NotificationsCenter />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium text-foreground">{email}</p>
            <p className="text-xs text-muted-foreground">Administrateur</p>
          </div>
        </div>
      </div>
    </header>
  )
}
