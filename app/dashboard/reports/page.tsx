'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileDown, Calendar, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { generatePDFReport, generateCSVReport, downloadFile } from '@/lib/export-utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsPage() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [delRes, userRes] = await Promise.all([
          fetch('/api/livraisons'),
          fetch('/api/users')
        ])
        
        const delData = delRes.ok ? await delRes.json() : []
        const userData = userRes.ok ? await userRes.json() : []
        
        setDeliveries(Array.isArray(delData) ? delData : [])
        setUsers(Array.isArray(userData) ? userData : [])
        
        if (!delRes.ok || !userRes.ok) {
          toast.error('Certaines données n\'ont pas pu être chargées')
        }
      } catch (error) {
        console.error('Error fetching reports data:', error)
        toast.error('Erreur lors du chargement des données')
        setDeliveries([])
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleExportDeliveries = async (format: 'pdf' | 'csv') => {
    if (deliveries.length === 0) return toast.error('Aucune donnée à exporter')
    setIsGenerating(true)
    try {
      const columns = ['Numéro', 'Livreur', 'Date', 'Colis', 'Distance', 'Statut']
      const data = deliveries.map(d => ({
        Numéro: d.numero,
        Livreur: d.chauffeur,
        Date: d.date,
        Colis: d.colis,
        Distance: d.distance,
        Statut: d.statut
      }))
      
      if (format === 'pdf') {
        const doc = generatePDFReport('Rapport des Livraisons', data, columns)
        doc.save(`rapport-livraisons-${new Date().toISOString().split('T')[0]}.pdf`)
      } else {
        const csv = generateCSVReport(data, columns)
        downloadFile(csv, `rapport-livraisons-${new Date().toISOString().split('T')[0]}.csv`)
      }
      
      toast.success(`Rapport exporté en ${format.toUpperCase()}`)
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de l\'export')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPerformance = async (format: 'pdf' | 'csv') => {
    if (users.length === 0) return toast.error('Aucune donnée à exporter')
    setIsGenerating(true)
    try {
      const columns = ['Nom', 'Email', 'Rôle', 'Statut', 'Livraisons']
      const data = users.map(u => ({
        Nom: u.nom,
        Email: u.email,
        Rôle: u.role,
        Statut: u.statut,
        Livraisons: u.livraisons || 0
      }))
      
      if (format === 'pdf') {
        const doc = generatePDFReport('Rapport de Performance', data, columns)
        doc.save(`rapport-performance-${new Date().toISOString().split('T')[0]}.pdf`)
      } else {
        const csv = generateCSVReport(data, columns)
        downloadFile(csv, `rapport-performance-${new Date().toISOString().split('T')[0]}.csv`)
      }
      
      toast.success(`Rapport exporté en ${format.toUpperCase()}`)
    } catch (error) {
      console.error(error)
      toast.error('Erreur lors de l\'export')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-balance text-3xl font-bold tracking-tight">
          Rapports
        </h1>
        <p className="text-muted-foreground">
          Générez et exportez les rapports opérationnels pour Glotelho Logistics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Delivery Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rapport des livraisons
            </CardTitle>
            <CardDescription>
              Détail de toutes les tournées effectuées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  <p>{deliveries.length} tournées enregistrées</p>
                  <p>Mise à jour: à l'instant</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExportDeliveries('pdf')}
                    disabled={isGenerating || deliveries.length === 0}
                    className="flex-1"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
                    PDF
                  </Button>
                  <Button
                    onClick={() => handleExportDeliveries('csv')}
                    disabled={isGenerating || deliveries.length === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    CSV
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Performance Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Rapport de performance
            </CardTitle>
            <CardDescription>
              Statistiques des utilisateurs et livreurs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="text-sm text-muted-foreground">
                  <p>{users.length} utilisateurs analysés</p>
                  <p>Mise à jour: à l'instant</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleExportPerformance('pdf')}
                    disabled={isGenerating || users.length === 0}
                    className="flex-1"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
                    PDF
                  </Button>
                  <Button
                    onClick={() => handleExportPerformance('csv')}
                    disabled={isGenerating || users.length === 0}
                    variant="outline"
                    className="flex-1"
                  >
                    CSV
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des données récentes</CardTitle>
          <CardDescription>Extraits des dernières tournées</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : deliveries.length > 0 ? (
            <div className="space-y-4">
              {deliveries.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                  <div>
                    <p className="font-medium">{item.chauffeur || 'Sans livreur'}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{item.colis} colis</p>
                    <p className="text-xs text-muted-foreground">{item.distance}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucune donnée disponible pour l'aperçu.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
