import apiClient from './axios'

/**
 * Servicio para manejar operaciones de transacciones (ingresos y egresos)
 */
export const transactionService = {
  /**
   * Obtener todas las transacciones con filtros opcionales
   * @param {Object} params - Parámetros de filtro (periodId, type, accountCode)
   * @returns {Promise} Lista de transacciones
   */
  getAll(params = {}) {
    return apiClient.get('/transactions', { params })
  },

  /**
   * Obtener una transacción por ID
   * @param {string} id - ID de la transacción
   * @returns {Promise} Transacción
   */
  getById(id) {
    return apiClient.get(`/transactions/${id}`)
  },

  /**
   * Crear una nueva transacción
   * @param {Object} data - Datos de la transacción
   * @returns {Promise} Transacción creada
   */
  create(data) {
    return apiClient.post('/transactions', data)
  },

  /**
   * Actualizar una transacción existente
   * @param {string} id - ID de la transacción
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Transacción actualizada
   */
  update(id, data) {
    return apiClient.put(`/transactions/${id}`, data)
  },

  /**
   * Eliminar una transacción
   * @param {string} id - ID de la transacción
   * @returns {Promise} Confirmación
   */
  delete(id) {
    return apiClient.delete(`/transactions/${id}`)
  },

  /**
   * Obtener resumen de transacciones por periodo
   * @param {string} periodId - ID del periodo
   * @returns {Promise} Resumen financiero
   */
  getSummary(periodId) {
    return apiClient.get(`/transactions/summary/${periodId}`)
  },
}

export default transactionService
