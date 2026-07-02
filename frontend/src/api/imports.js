import apiClient from './axios.js'

export const importsApi = {
  downloadTemplate() {
    return apiClient.get('/imports/template', { responseType: 'blob' })
  },

  importExcel(file, onUploadProgress) {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post('/imports/excel', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
      onUploadProgress
    })
  }
}
