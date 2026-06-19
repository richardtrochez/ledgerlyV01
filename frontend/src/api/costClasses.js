import axios from './axios'

const COST_CLASS_URL = '/cost-classes'

export const costClassesApi = {
  // Obtener todas las clases de costo
  getAll(params = {}) {
    return axios.get(COST_CLASS_URL, { params })
  },

  // Obtener una clase de costo por ID
  getById(id) {
    return axios.get(`${COST_CLASS_URL}/${id}`)
  },

  // Crear nueva clase de costo
  create(data) {
    return axios.post(COST_CLASS_URL, data)
  },

  // Actualizar clase de costo
  update(id, data) {
    return axios.put(`${COST_CLASS_URL}/${id}`, data)
  },

  // Eliminar clase de costo
  delete(id) {
    return axios.delete(`${COST_CLASS_URL}/${id}`)
  }
}

export default costClassesApi
