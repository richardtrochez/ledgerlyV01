import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const currentCompany = ref(JSON.parse(localStorage.getItem('currentCompany') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isContador = computed(() => user.value?.role === 'contador')
  const isDueno = computed(() => user.value?.role === 'dueno')
  const canEdit = computed(() => ['admin', 'contador'].includes(user.value?.role))
  const companyId = computed(() => currentCompany.value?._id || null)

  async function loginUser(email, password) {
    const response = await axios.post(`${API}/auth/login`, { email, password })
    const { token: newToken, user: newUser, company: newCompany } = response.data.data

    token.value = newToken
    user.value = newUser
    currentCompany.value = newCompany || null

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('currentCompany', JSON.stringify(newCompany || null))

    // Set default auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

    return newUser
  }

  function logout() {
    token.value = null
    user.value = null
    currentCompany.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentCompany')
    delete axios.defaults.headers.common['Authorization']
  }

  function setCurrentCompany(company) {
    currentCompany.value = company
    localStorage.setItem('currentCompany', JSON.stringify(company))
  }

  function initAuth() {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  return { 
    token, 
    user, 
    currentCompany,
    isAuthenticated, 
    isAdmin, 
    isContador, 
    isDueno, 
    canEdit,
    companyId,
    loginUser, 
    logout, 
    initAuth,
    setCurrentCompany 
  }
})
