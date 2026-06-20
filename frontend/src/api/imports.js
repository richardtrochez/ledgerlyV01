import apiClient from './axios.js'

export const importsApi = {
  downloadTemplate() {
    return apiClient.get('/imports/template', { responseType: 'blob' })
  },

  importExcel(companyId, file, onUploadProgress) {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post(`/imports/excel/${companyId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress
    })
  }
}
