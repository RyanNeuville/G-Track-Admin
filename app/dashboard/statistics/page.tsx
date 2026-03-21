'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

const monthlyData = [
  { mois: 'Jan', livraisons: 400, revenus: 2400 },
  { mois: 'Fév', livraisons: 320, revenus: 1920 },
  { mois: 'Mar', livraisons: 500, revenus: 3000 },
  { mois: 'Avr', livraisons: 450, revenus: 2700 },
  { mois: 'Mai', livraisons: 600, revenus: 3600 },
  { mois: 'Juin', livraisons: 550, revenus: 3300 },
]

const deliveryByRegion = [
  { region: 'Île-de-France', value: 350 },
  { region: 'Provence', value: 280 },
  { region: 'Rhône-Alpes', value: 220 },
  { region: 'Bretagne', value: 180 },
  { region: 'Autres', value: 170 },
]

const driverPerformance = [
  { chauffeur: 'Jean Dupont', livraisons: 120, rating: 4.8 },
  { chauffeur: 'Marie Martin', livraisons: 115, rating: 4.9 },
  { chauffeur: 'Pierre Bernard', livraisons: 95, rating: 4.6 },
  { chauffeur: 'Sophie Leclerc', livraisons: 140, rating: 4.7 },
  { chauffeur: 'Luc Renard', livraisons: 85, rating: 4.5 },
]

const COLORS = ['#2ECC71', '#5DADE2', '#F39C12', '#E74C3C', '#9B59B6']

export default function StatisticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">
          Statistiques
        </h1>
        <p className="text-muted-foreground">
          Analyse détaillée des performances
        </p>
      </div>

      {/* Monthly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance mensuelle</CardTitle>
          <CardDescription>Livraisons et revenus par mois</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="livraisons" fill="#2ECC71" />
              <Bar dataKey="revenus" fill="#5DADE2" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Deliveries by Region */}
        <Card>
          <CardHeader>
            <CardTitle>Livraisons par région</CardTitle>
            <CardDescription>Répartition géographique</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deliveryByRegion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ region, value }) => `${region}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deliveryByRegion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Driver Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance des chauffeurs</CardTitle>
            <CardDescription>Livraisons vs notation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="livraisons" name="Livraisons" />
                <YAxis type="number" dataKey="rating" name="Rating" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  name="Chauffeurs"
                  data={driverPerformance}
                  fill="#2ECC71"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classement des chauffeurs</CardTitle>
          <CardDescription>Top performers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {driverPerformance.map((driver) => (
              <div key={driver.chauffeur} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div>
                  <p className="font-medium">{driver.chauffeur}</p>
                  <p className="text-sm text-muted-foreground">
                    {driver.livraisons} livraisons
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold">{driver.rating}/5.0</p>
                    <p className="text-xs text-muted-foreground">Note moyenne</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
