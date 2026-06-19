import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import transactionService from '@/api/transactions'

/**
 * Store para manejar el estado de las transacciones
 */
export const useTransactionStore = defineStore('transactions', () => {
  // State
  const transactions = ref([])
  const currentTransaction = ref(null)
  const summary = ref({
    totalIngresos: 0,
    totalEgresos: 0,
    resultado: 0,
    cantidadIngresos: 0,
    cantidadEgresos: 0,
    totalTransacciones: 0,
  })
  const loading = ref(false)
  const error = ref(null)

  // Getters (computed)
  const ingresos = computed(() => 
    transactions.value.filter(t => t.type === 'ingreso')
  )
  
  const egresos = computed(() => 
    transactions.value.filter(t => t.type === 'egreso')
  )

  const totalIngresos = computed(() => 
    ingresos.value.reduce((sum, t) => sum + t.amount, 0)
  )

  const totalEgresos = computed(() => 
    egresos.value.reduce((sum, t) => sum + t.amount, 0)
  )

  const resultado = computed(() => totalIngresos.value - totalEgresos.value)

  // Actions
  async function fetchTransactions(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await transactionService.getAll(filters)
      transactions.value = response.data.data || []
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar transacciones'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary(periodId) {
    loading.value = true
    error.value = null
    try {
      const response = await transactionService.getSummary(periodId)
      summary.value = response.data.data || summary.value
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar resumen'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(data) {
    loading.value = true
    error.value = null
    try {
      const response = await transactionService.create(data)
      transactions.value.unshift(response.data.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear transacción'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTransaction(id, data) {
    loading.value = true
    error.value = null
    try {
      const response = await transactionService.update(id, data)
      const index = transactions.value.findIndex(t => t._id === id)
      if (index !== -1) {
        transactions.value[index] = response.data.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al actualizar transacción'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTransaction(id) {
    loading.value = true
    error.value = null
    try {
      await transactionService.delete(id)
      transactions.value = transactions.value.filter(t => t._id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar transacción'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    transactions,
    currentTransaction,
    summary,
    loading,
    error,
    // Getters
    ingresos,
    egresos,
    totalIngresos,
    totalEgresos,
    resultado,
    // Actions
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError,
  }
})
