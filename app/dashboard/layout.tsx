import { SidebarNav } from '@/components/sidebar-nav'
import { DashboardHeader } from '@/components/dashboard-header'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex">
      <SidebarNav />
      <main className="ml-64 flex-1 bg-background">
        <DashboardHeader />
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
