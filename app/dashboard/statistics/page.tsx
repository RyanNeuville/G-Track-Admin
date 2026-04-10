'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

const COLORS = ['#2ECC71', '#5DADE2', '#F39C12', '#E74C3C', '#9B59B6']

export default function StatisticsPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/statistics')
        const json = await response.json()
        setData(json)
      } catch (error) {
        console.error('Error fetching statistics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">
          Statistiques
        </h1>
        <p className="text-muted-foreground">
          Analyse réelle basée sur les données Supabase
        </p>
      </div>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance de l'activité</CardTitle>
          <CardDescription>Livraisons et revenus estimés</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthly_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="deliveries" fill="#2ECC71" name="Livraisons" />
              <Bar dataKey="revenue" fill="#5DADE2" name="Revenus (FCFA)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Deliveries by Status */}
        <Card>
          <CardHeader>
            <CardTitle>État des colis</CardTitle>
            <CardDescription>Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.status_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.status_breakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par région</CardTitle>
            <CardDescription>Top 5 des régions actives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.regional_performance.length > 0 ? (
                data.regional_performance.map((item: any) => (
                  <div key={item.region} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                    <span className="text-sm font-medium">{item.region}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item.deliveries} livraisons</span>
                      <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${item.completion}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée régionale disponible.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.total_deliveries > 0 
                ? Math.round((data.summary.completed / data.summary.total_deliveries) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Livraisons complétées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distance totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.total_distance}</div>
            <p className="text-xs text-muted-foreground">Parcourue par la flotte</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Livreurs actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.active_livreurs}</div>
            <p className="text-xs text-muted-foreground">En ligne actuellement</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
