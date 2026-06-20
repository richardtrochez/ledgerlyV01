import apiClient from './axios.js'

export const agentApi = {
  analizarFinanzas({ year, periodId } = {}) {
    const params = {}
    if (year)     params.year     = year
    if (periodId) params.periodId = periodId
    return apiClient.get('/agent/analisis', { params, timeout: 60000 })
  }
}
