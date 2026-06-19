import apiClient from './axios'

/**
 * Servicio para manejar operaciones de periodos contables
 */
export const periodService = {
  /**
   * Obtener todos los periodos
   * @returns {Promise} Lista de periodos
   */
  getAll() {
    return apiClient.get('/periods')
  },

  /**
   * Crear un nuevo periodo
   * @param {Object} data - Datos del periodo (month, year, companyId)
   * @returns {Promise} Periodo creado
   */
  create(data) {
    return apiClient.post('/periods', data)
  },

  /**
   * Actualizar estado de un periodo
   * @param {string} id - ID del periodo
   * @param {Object} data - Datos a actualizar
   * @returns {Promise} Periodo actualizado
   */
  update(id, data) {
    return apiClient.put(`/periods/${id}`, data)
  },

  /**
   * Cerrar un periodo (cambiar status a 'cerrado')
   * @param {string} id - ID del periodo
   * @returns {Promise} Periodo cerrado
   */
  close(id) {
    return apiClient.put(`/periods/${id}`, { status: 'cerrado' })
  },
}

export default periodService
