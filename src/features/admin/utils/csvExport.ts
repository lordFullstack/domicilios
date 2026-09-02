/**
 * Exportación CSV nativa (sin librerías nuevas). No hay soporte de PDF en
 * el proyecto — agregarlo requeriría instalar una librería nueva
 * (ej. jsPDF), así que por ahora solo se ofrece CSV, que además es más
 * útil para abrir directo en Excel/Sheets.
 */
export const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escape = (value: string | number) => {
    const str = String(value)
    // Si el valor tiene coma, comillas o salto de línea, hay que
    // envolverlo en comillas y escapar las comillas internas.
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))]
  // BOM al inicio para que Excel detecte UTF-8 correctamente (tildes, ñ).
  const csvContent = '\uFEFF' + lines.join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
