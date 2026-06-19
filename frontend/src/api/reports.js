import apiClient from './axios'

/**
 * Servicio para manejar operaciones de reportes
 */
export const reportsApi = {
  /**
   * Obtener Estado de Resultados comparativo
   * @param {Object} params - Parámetros (year, companyId)
   * @returns {Promise} Datos del EERR
   */
  getIncomeStatement(params = {}) {
    return apiClient.get('/reports/income-statement', { params })
  }
}



export default reportsApi
