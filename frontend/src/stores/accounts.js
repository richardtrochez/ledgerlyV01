import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import accountService from '@/api/accounts'

/**
 * Store para manejar el catálogo de cuentas contables
 */
export const useAccountStore = defineStore('accounts', () => {
  // State
  const accounts = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const incomeAccounts = computed(() => 
    accounts.value.filter(a => a.group === 'ingreso' && a.isActive)
  )

  const expenseAccounts = computed(() => 
    accounts.value.filter(a => a.group !== 'ingreso' && a.isActive)
  )

  const directCostAccounts = computed(() => 
    accounts.value.filter(a => a.group === 'costo_directo' && a.isActive)
  )

  const operatingExpenseAccounts = computed(() => 
    accounts.value.filter(a => a.group === 'gasto_operativo' && a.isActive)
  )

  const otherAccounts = computed(() => 
    accounts.value.filter(a => a.group === 'otros' && a.isActive)
  )

  const accountsCount = computed(() => accounts.value.length)

  // Actions
  async function fetchAccounts(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await accountService.getAll(filters)
      accounts.value = response.data.data || []
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar cuentas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createAccount(data) {
    loading.value = true
    error.value = null
    try {
      const response = await accountService.create(data)
      accounts.value.push(response.data.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear cuenta'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAccount(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await accountService.update(id, data)
      const index = accounts.value.findIndex(a => a._id === id)
      if (index !== -1) {
        accounts.value[index] = response.data.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar cuenta'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAccount(id) {
    loading.value = true
    error.value = null
    try {
      await accountService.delete(id)
      accounts.value = accounts.value.filter(a => a._id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar cuenta'
      throw err
    } finally {
      loading.value = false
    }
  }

async function toggleAccount(id) {
  try {
    const response = await accountService.toggle(id)
    const index = accounts.value.findIndex(a => a._id === id)
    if (index !== -1) {
      accounts.value[index] = response.data.data
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al cambiar estado'
    throw err
  }
}


  function getAccountByCode(code) {
    return accounts.value.find(a => a.code === code)
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    accounts,
    loading,
    error,
    toggleAccount,
    // Getters
    incomeAccounts,
    expenseAccounts,
    directCostAccounts,
    operatingExpenseAccounts,
    otherAccounts,
    accountsCount,
    // Actions
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccountByCode,
    clearError,
  }
})
