'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileDown, Calendar } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { generatePDFReport, generateCSVReport, downloadFile } from '@/lib/export-utils'

const mockDeliveryData = [
  { date: '2024-03-20', chauffeur: 'Jean Dupont', colis: 8, distance: '45 km', statut: 'Complété' },
  { date: '2024-03-20', chauffeur: 'Marie Martin', colis: 12, distance: '62 km', statut: 'Complété' },
  { date: '2024-03-21', chauffeur: 'Pierre Bernard', colis: 6, distance: '38 km', statut: 'Complété' },
  { date: '2024-03-21', chauffeur: 'Sophie Leclerc', colis: 10, distance: '51 km', statut: 'Complété' },
]

const mockPerformanceData = [
  { chauffeur: 'Jean Dupont', livraisons: 120, retards: 2, rating: '4.8' },
  { chauffeur: 'Marie Martin', livraisons: 115, retards: 1, rating: '4.9' },
  { chauffeur: 'Pierre Bernard', livraisons: 95, retards: 5, rating: '4.6' },
  { chauffeur: 'Sophie Leclerc', livraisons: 140, retards: 3, rating: '4.7' },
]

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleExportDeliveries = async (format: 'pdf' | 'csv') => {
    setIsGenerating(true)
    try {
      const columns = ['Date', 'Chauffeur', 'Colis', 'Distance', 'Statut']
      
      if (format === 'pdf') {
        const doc = generatePDFReport('Rapport des Livraisons', mockDeliveryData, columns)
        doc.save('rapport-livraisons.pdf')
      } else {
        const csv = generateCSVReport(mockDeliveryData, columns)
        downloadFile(csv, 'rapport-livraisons.csv')
      }
      
      toast.success(`Rapport exporté en ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Erreur lors de l\'export')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPerformance = async (format: 'pdf' | 'csv') => {
    setIsGenerating(true)
    try {
      const columns = ['Chauffeur', 'Livraisons', 'Retards', 'Rating']
      
      if (format === 'pdf') {
        const doc = generatePDFReport('Rapport de Performance', mockPerformanceData, columns)
        doc.save('rapport-performance.pdf')
      } else {
        const csv = generateCSVReport(mockPerformanceData, columns)
        downloadFile(csv, 'rapport-performance.csv')
      }
      
      toast.success(`Rapport exporté en ${format.toUpperCase()}`)
    } catch (error) {
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
          Générez et exportez les rapports
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
              Détail de toutes les livraisons effectuées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>{mockDeliveryData.length} livraisons enregistrées</p>
              <p>Période: dernière semaine</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExportDeliveries('pdf')}
                disabled={isGenerating}
                className="flex-1"
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => handleExportDeliveries('csv')}
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                <FileDown className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
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
              Performance des chauffeurs et statistiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>{mockPerformanceData.length} chauffeurs analysés</p>
              <p>Période: dernier mois</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExportPerformance('pdf')}
                disabled={isGenerating}
                className="flex-1"
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={() => handleExportPerformance('csv')}
                disabled={isGenerating}
                variant="outline"
                className="flex-1"
              >
                <FileDown className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des données</CardTitle>
          <CardDescription>Dernières livraisons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockDeliveryData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div>
                  <p className="font-medium">{item.chauffeur}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.colis} colis</p>
                  <p className="text-sm text-muted-foreground">{item.distance}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
