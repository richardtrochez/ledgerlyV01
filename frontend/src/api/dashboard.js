import apiClient from './axios'

export const dashboardApi = {
  getSummary(year) {
    return apiClient.get('/dashboard/summary', {
      params: { year }
    })
  }
}

export default dashboardApi
