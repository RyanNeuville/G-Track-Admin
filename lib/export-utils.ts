import jsPDF from 'jspdf'
import Papa from 'papaparse'

export function generatePDFReport(
  title: string,
  data: Record<string, unknown>[],
  columns: string[]
) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(16)
  doc.text(title, 14, 15)
  
  // Timestamp
  doc.setFontSize(10)
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 25)
  
  // Table
  const tableData = data.map((row) =>
    columns.map((col) => {
      const value = row[col.toLowerCase()]
      return value ? String(value) : '-'
    })
  )
  
  const colWidths = columns.map(() => 30)
  
  doc.setFontSize(11)
  let startY = 35
  
  // Column headers
  doc.setTextColor(255, 255, 255)
  doc.setFillColor(49, 130, 206) // Blue color
  columns.forEach((col, i) => {
    const xPos = 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
    doc.rect(xPos, startY, colWidths[i], 7, 'F')
    doc.text(col, xPos + 2, startY + 5)
  })
  
  // Data rows
  doc.setTextColor(0, 0, 0)
  startY += 8
  tableData.forEach((row) => {
    row.forEach((cell, i) => {
      const xPos = 14 + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
      doc.text(String(cell), xPos + 2, startY)
    })
    startY += 7
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
        const value = row[col.toLowerCase()]
        return value ? String(value) : '-'
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
