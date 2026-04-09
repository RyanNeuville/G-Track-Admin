import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'

export function generatePDFReport(
  title: string,
  data: Record<string, unknown>[],
  columns: string[]
) {
  const doc = new jsPDF()
  
  // Couleurs de la charte G-Track
  const PRIMARY_COLOR: [number, number, number] = [28, 59, 137] // #1c3b89 - Bleu profond
  const SECONDARY_COLOR: [number, number, number] = [220, 230, 241] // #dce6f1 - Bleu très très clair

  // En-tête (Header) Logo fictif et texte
  doc.setFontSize(22)
  doc.setTextColor(...PRIMARY_COLOR)
  doc.setFont('helvetica', 'bold')
  doc.text('G-Track Logistics', 14, 20)
  
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.setFont('helvetica', 'normal')
  doc.text('123 Avenue des Transporteurs, 75000 Paris', 14, 26)
  doc.text('Tél : +33 1 23 45 67 89 | Email : contact@g-track.com', 14, 31)
  doc.text('SIRET : 123 456 789 00010', 14, 36)

  // Ligne de séparation
  doc.setDrawColor(...PRIMARY_COLOR)
  doc.setLineWidth(0.5)
  doc.line(14, 40, 196, 40)

  // Titre du Document
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.text(title.toUpperCase(), 105, 52, { align: 'center' })
  
  // Date de génération
  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.setFont('helvetica', 'italic')
  doc.text(`Document généré le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, 105, 58, { align: 'center' })

  // Préparation des données pour le tableau
  const tableData = data.map((row) =>
    columns.map((col) => {
      const value = row[col] || row[col.toLowerCase()]
      return value !== undefined && value !== null ? String(value) : '-'
    })
  )
  
  // Générer le tableau professionnel
  autoTable(doc, {
    startY: 65,
    head: [columns],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: SECONDARY_COLOR,
    },
    columnStyles: {
      0: { fontStyle: 'bold' } // Ex: Le numéro de ID/Colis ressort mieux
    },
    margin: { top: 60, right: 14, bottom: 20, left: 14 },
    didDrawPage: function (data: any) {
      // Pied de page (Footer) pour chaque page
      const pageCount = doc.internal.pages.length - 1
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.setFont('helvetica', 'normal')
      
      const str = 'Page ' + pageCount
      // Position en bas, centré
      const pageSize = doc.internal.pageSize || { width: 210, height: 297 }
      const pageHeight = doc.internal.pageSize.getHeight() ? doc.internal.pageSize.getHeight() : pageSize.height
      doc.text(str, data.settings.margin.left, pageHeight - 10)
      doc.text('© G-Track Logistics. Document confidentiel.', 120, pageHeight - 10)
    }
  })
  
  return doc
}

export function generateCSVReport(
  data: Record<string, unknown>[],
  columns: string[]
) {
  const csvData = [
    columns,
    ...data.map((row) =>
      columns.map((col) => {
        // Aligner la recherche de clé avec la logique PDF pour plus de robustesse
        const value = row[col] || row[col.toLowerCase()]
        return value !== undefined && value !== null ? String(value) : '-'
      })
    ),
  ]
  
  return Papa.unparse(csvData)
}

export function downloadFile(content: string | Blob, filename: string) {
  const element = document.createElement('a')
  const file = content instanceof Blob ? content : new Blob([content], { type: 'text/plain' })
  
  element.href = URL.createObjectURL(file)
  element.download = filename
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
