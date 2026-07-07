import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import periodService from '@/api/periods'

/**
 * Store para manejar el estado de los períodos contables
 */
export const usePeriodStore = defineStore('periods', () => {
  // Estado
  const periods = ref([])
  const currentPeriod = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Cálculos
  const openPeriods = computed(() => 
    periods.value.filter(p => p.status === 'abierto')
  )

  const closedPeriods = computed(() => 
    periods.value.filter(p => p.status === 'cerrado')
  )

  const currentPeriodName = computed(() => {
    if (!currentPeriod.value) return 'Sin período seleccionado'
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${months[currentPeriod.value.month - 1]} ${currentPeriod.value.year}`
  })

  // Acciones
  async function fetchPeriods() {
    loading.value = true
    error.value = null
    try {
      const response = await periodService.getAll()
      periods.value = response.data.data || []
      
      // Si hay períodos abiertos, seleccionar el más reciente
      if (openPeriods.value.length > 0 && !currentPeriod.value) {
        currentPeriod.value = openPeriods.value[0]
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cargar períodos'
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
      
      // Si es el primer período o está abierto, seleccionarlo
      if (!currentPeriod.value || response.data.data.status === 'abierto') {
        currentPeriod.value = response.data.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al crear período'
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
      
      // Si cerramos el período actual, seleccionar el siguiente abierto
      if (currentPeriod.value?._id === id) {
        currentPeriod.value = openPeriods.value[0] || null
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al cerrar período'
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
    // Estado
    periods,
    currentPeriod,
    loading,
    error,
    // Cálculos
    openPeriods,
    closedPeriods,
    currentPeriodName,
    // Acciones
    fetchPeriods,
    createPeriod,
    closePeriod,
    setCurrentPeriod,
    clearError,
  }
})
