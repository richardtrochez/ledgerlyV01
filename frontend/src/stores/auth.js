
/**  importacion, define el store que usaran los componentes */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
/** crea la variable API>>define la url del backend, usa la variable vite_API_URL  si no usa el localhost */
const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'



/** estado inicial de store, guarda las variables y la sesion */
export const useAuthStore = defineStore('auth', () => {


/**guarda el token, usuario, la compania seleecionada, lista de empresa disponible y lo carga desde localstorage la informacion */

  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const currentCompany = ref(JSON.parse(localStorage.getItem('currentCompany') || 'null'))
  const availableCompanies = ref(JSON.parse(localStorage.getItem('availableCompanies') || '[]'))
  const needsCompanySelection = ref(localStorage.getItem('needsCompanySelection') === 'true')


  /** */
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isContador = computed(() => user.value?.role === 'contador')
  const isDueno = computed(() => user.value?.role === 'dueno')
  const canEdit = computed(() => ['admin', 'contador'].includes(user.value?.role))
  const companyId = computed(() => currentCompany.value?._id || null)
  const hasMultipleCompanies = computed(() => availableCompanies.value.length > 1)

  /**funcion login user encargada de hacer el post a authlogin con email y el passowrd. recibe los datos y luego decide si el usuario debe de elegir la empresa
    guarda toda la informacion en las variables del store. localstorage headers de axios para authorizar futuras peticiones.
   */
  async function loginUser(email, password) {
    const response = await axios.post(`${API}/auth/login`, { email, password })
    const {
      token: newToken,
      user: newUser,
      activeCompany,
      availableCompanies: companies
    } = response.data.data

    const shouldSelectCompany = newUser.role !== 'admin' && (companies || []).length > 1

    token.value = newToken
    user.value = newUser
    currentCompany.value = activeCompany || null
    availableCompanies.value = companies || []
    needsCompanySelection.value = shouldSelectCompany

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('currentCompany', JSON.stringify(activeCompany || null))
    localStorage.setItem('availableCompanies', JSON.stringify(companies || []))
    localStorage.setItem('needsCompanySelection', shouldSelectCompany ? 'true' : 'false')

    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
/** retorna el usuario y si es necesario seleccionar la rempresa y permite cambiar la empresa */
    return { user: newUser, needsCompanySelection: shouldSelectCompany }
  }

  async function switchCompany(newCompanyId) {
    const response = await axios.post(`${API}/auth/switch-company`, { companyId: newCompanyId })
    const { token: newToken, user: newUser, activeCompany } = response.data.data

    token.value = newToken
    user.value = newUser
    currentCompany.value = activeCompany || null
    needsCompanySelection.value = false

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    localStorage.setItem('currentCompany', JSON.stringify(activeCompany || null))
    localStorage.setItem('needsCompanySelection', 'false')

    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`

    return activeCompany
  }

  function logout() {
    token.value = null
    user.value = null
    currentCompany.value = null
    availableCompanies.value = []
    needsCompanySelection.value = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('currentCompany')
    localStorage.removeItem('availableCompanies')
    localStorage.removeItem('needsCompanySelection')
    delete axios.defaults.headers.common['Authorization']
  }

  function setCurrentCompany(company) {
    currentCompany.value = company
    needsCompanySelection.value = false
    localStorage.setItem('currentCompany', JSON.stringify(company))
    localStorage.setItem('needsCompanySelection', 'false')
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
    availableCompanies,
    needsCompanySelection,
    isAuthenticated,
    isAdmin,
    isContador,
    isDueno,
    canEdit,
    companyId,
    hasMultipleCompanies,
    loginUser,
    switchCompany,
    logout,
    initAuth,
    setCurrentCompany
  }
})
