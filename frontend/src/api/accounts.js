import apiClient from './axios'

/**
 * Servicio para manejar operaciones del catálogo de cuentas
 */
export const accountService = {
  /**
   * Obtener todas las cuentas
   * @param {Object} params - Parámetros de filtro (group, isActive)
   * @returns {Promise} Lista de cuentas
   */
  getAll(params = {}) {
    return apiClient.get('/accounts', { params })
  },

  /**
   * Obtener una cuenta por ID
   * @param {String} id - ID de la cuenta
   * @returns {Promise} Cuenta
   */
  getById(id) {
    return apiClient.get(`/accounts/${id}`)
  },

  /**
   * Crear una nueva cuenta
   * @param {Object} data - Datos de la cuenta
   * @returns {Promise} Cuenta creada
   */
  create(data) {
    return apiClient.post('/accounts', data)
  },

  /**
   * Actualizar una cuenta existente
   * @param {String} id - ID de la cuenta
   * @param {Object} data - Datos actualizados
   * @returns {Promise} Cuenta actualizada
   */
  update(id, data) {
    return apiClient.put(`/accounts/${id}`, data)
  },

  /**
   * Eliminar una cuenta
   * @param {String} id - ID de la cuenta
   * @returns {Promise} Confirmación
   */
  delete(id) {
    return apiClient.delete(`/accounts/${id}`)
  },

  /**
   * Obtener cuentas de ingresos
   * @returns {Promise} Cuentas de tipo ingreso
   */
  getIncomeAccounts() {
    return apiClient.get('/accounts', { params: { group: 'ingreso', isActive: true } })
  },


  




  /**
   * Obtener cuentas de egresos (costos y gastos)
   * @returns {Promise} Cuentas de tipo costo_directo, gasto_operativo, otros
   */
  getExpenseAccounts() {
    return apiClient.get('/accounts', { 
      params: { isActive: true } 
    }).then(response => {
      // Filtrar solo cuentas que no sean de ingreso
      const data = response.data.data || response.data
      const expenseAccounts = data.filter(acc => acc.group !== 'ingreso')
      return { ...response, data: { ...response.data, data: expenseAccounts } }
    })
  },

toggle(id) {
  return apiClient.patch(`/accounts/${id}/toggle`)
}

}

export default accountService
