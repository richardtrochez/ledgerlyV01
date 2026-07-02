/**
 * Utility centralizado para parsear fechas en diferentes formatos
 * Soporta: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 */

/**
 * Parsea una fecha desde diferentes formatos
 * @param {string|Date} dateStr - String de fecha o objeto Date
 * @returns {Date|null} Objeto Date o null si es inválido
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null

  // Si ya es un objeto Date, retornarlo
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

/**
 * Formatea una fecha a string en formato DD/MM/YYYY
 * @param {Date|string} date - Objeto Date o string de fecha
 * @returns {string} Fecha formateada como DD/MM/YYYY
 */
export const formatDate = (date) => {
  if (!date) return ''
  
  const d = date instanceof Date ? date : parseDate(date)
  if (!d) return ''

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Valida si una fecha es válida
 * @param {string|Date} dateStr - String de fecha o objeto Date
 * @returns {boolean} true si es válida
 */
export const isValidDate = (dateStr) => {
  return parseDate(dateStr) !== null
}

/**
 * Obtiene el año de una fecha
 * @param {Date|string} date - Objeto Date o string de fecha
 * @returns {number} Año
 */
export const getYear = (date) => {
  const d = date instanceof Date ? date : parseDate(date)
  return d ? d.getFullYear() : null
}

/**
 * Obtiene el mes de una fecha (1-12)
 * @param {Date|string} date - Objeto Date o string de fecha
 * @returns {number} Mes (1-12)
 */
export const getMonth = (date) => {
  const d = date instanceof Date ? date : parseDate(date)
  return d ? d.getMonth() + 1 : null
}

/**
 * Obtiene el día de una fecha
 * @param {Date|string} date - Objeto Date o string de fecha
 * @returns {number} Día del mes
 */
export const getDay = (date) => {
  const d = date instanceof Date ? date : parseDate(date)
  return d ? d.getDate() : null
}

export default {
  parseDate,
  formatDate,
  isValidDate,
  getYear,
  getMonth,
  getDay
}