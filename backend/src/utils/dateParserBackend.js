/**
 * Utility centralizado para parsear fechas en diferentes formatos
 * Para usar en backend Node.js
 * Soporta: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 */

const parseDate = (dateStr) => {
  if (!dateStr) return null

  // Si ya es un objeto Date, validarlo
  if (dateStr instanceof Date) {
    return isNaN(dateStr.getTime()) ? null : dateStr
  }

  const str = String(dateStr).trim()

  // Formato DD/MM/YYYY o DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    return isNaN(date.getTime()) ? null : date
  }

  // Formato ISO YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (isoMatch) {
    const date = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`)
    return isNaN(date.getTime()) ? null : date
  }

  // Intentar parseo automático de JavaScript
  const date = new Date(str)
  return isNaN(date.getTime()) ? null : date
}

const isValidDate = (dateStr) => {
  return parseDate(dateStr) !== null
}

const getYear = (date) => {
  const d = date instanceof Date ? date : parseDate(date)
  return d ? d.getFullYear() : null
}

const getMonth = (date) => {
  const d = date instanceof Date ? date : parseDate(date)
  return d ? d.getMonth() + 1 : null
}

const getDay = (date) => {
  const d = date instanceof Date ? date : parseDate(date)
  return d ? d.getDate() : null
}

export { parseDate, isValidDate, getYear, getMonth, getDay }

export default { parseDate, isValidDate, getYear, getMonth, getDay }