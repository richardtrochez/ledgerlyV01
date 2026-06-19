import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import periodService from '@/api/periods'

/**
 * Store para manejar el estado de los periodos contables
 */
export const usePeriodStore = defineStore('periods', () => {
  // State
  const periods = ref([])
  const currentPeriod = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const openPeriods = computed(() => 
    periods.value.filter(p => p.status === 'abierto')
  )

  const closedPeriods = computed(() => 
    periods.value.filter(p => p.status === 'cerrado')
  )

  const currentPeriodName = computed(() => {
    if (!currentPeriod.value) return 'Sin periodo seleccionado'
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${months[currentPeriod.value.month - 1]} ${currentPeriod.value.year}`
  })

  // Actions
  async function fetchPeriods() {
    loading.value = true
    error.value = null
    try {
      const response = await periodService.getAll()
      periods.value = response.data.data || []
      
      // Si hay periodos abiertos, seleccionar el más reciente
      if (openPeriods.value.length > 0 && !currentPeriod.value) {
        currentPeriod.value = openPeriods.value[0]
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar periodos'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPeriod(data) {
    loading.value = true
    error.value = null
    try {
      const response = await periodService.create(data)
      periods.value.unshift(response.data.data)
      
      // Si es el primer periodo o está abierto, seleccionarlo
      if (!currentPeriod.value || response.data.data.status === 'abierto') {
        currentPeriod.value = response.data.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear periodo'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function closePeriod(id) {
    loading.value = true
    error.value = null
    try {
      const response = await periodService.close(id)
      const index = periods.value.findIndex(p => p._id === id)
      if (index !== -1) {
        periods.value[index] = response.data.data
      }
      
      // Si cerramos el periodo actual, seleccionar el siguiente abierto
      if (currentPeriod.value?._id === id) {
        currentPeriod.value = openPeriods.value[0] || null
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cerrar periodo'
      throw err
    } finally {
      loading.value = false
    }
  }

  function setCurrentPeriod(period) {
    currentPeriod.value = period
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    periods,
    currentPeriod,
    loading,
    error,
    // Getters
    openPeriods,
    closedPeriods,
    currentPeriodName,
    // Actions
    fetchPeriods,
    createPeriod,
    closePeriod,
    setCurrentPeriod,
    clearError,
  }
})
