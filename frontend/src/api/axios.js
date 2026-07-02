import axios from 'axios'

// Configuración base de Axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests — agrega el token JWT en cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses (manejo de errores global)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejo de errores común
    if (error.response) {
      console.error('Error de respuesta:', error.response.data)
      // Si el token es inválido o expiró, redirigir al login
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    } else if (error.request) {
      console.error('Sin respuesta del servidor')
    } else {
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
