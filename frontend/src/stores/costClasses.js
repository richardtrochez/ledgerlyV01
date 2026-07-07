import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import costClassesApi from '@/api/costClasses'

export const useCostClassStore = defineStore('costClasses', () => {
  // Estado
  const costClasses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Cálculos
  const activeCostClasses = computed(() => 
    costClasses.value.filter(cc => cc.isActive)
  )

  const costClassesCount = computed(() => costClasses.value.length)

  // Acciones
  const fetchCostClasses = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await costClassesApi.getAll(params)
      // El backend devuelve el array directamente (sin wrapper)
      costClasses.value = Array.isArray(response.data) ? response.data : response.data.data || []
      return costClasses.value
    } catch (err) {
      error.value = err.message || 'Error al cargar las clases de costo'
      console.error('Error al cargar clases de costo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const createCostClass = async (data) => {
    loading.value = true
    error.value = null
    try {
      const response = await costClassesApi.create(data)
      // El backend devuelve el objeto directamente
      const newCostClass = response.data.data || response.data
      costClasses.value.push(newCostClass)
      return newCostClass
    } catch (err) {
      error.value = err.message || 'Error al crear la clase de costo'
      console.error('Error al crear clase de costo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateCostClass = async (id, data) => {
    loading.value = true
    error.value = null
    try {
      const response = await costClassesApi.update(id, data)
      const updated = response.data.data || response.data
      const index = costClasses.value.findIndex(cc => cc._id === id)
      if (index !== -1) {
        costClasses.value[index] = updated
      }
      return updated
    } catch (err) {
      error.value = err.message || 'Error al actualizar la clase de costo'
      console.error('Error al actualizar clase de costo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteCostClass = async (id) => {
    loading.value = true
    error.value = null
    try {
      await costClassesApi.delete(id)
      costClasses.value = costClasses.value.filter(cc => cc._id !== id)
    } catch (err) {
      error.value = err.message || 'Error al eliminar la clase de costo'
      console.error('Error al eliminar clase de costo:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getCostClassById = (id) => {
    return costClasses.value.find(cc => cc._id === id)
  }

  return {
    // Estado
    costClasses,
    loading,
    error,
    
    // Cálculos
    activeCostClasses,
    costClassesCount,
    
    // Acciones
    fetchCostClasses,
    createCostClass,
    updateCostClass,
    deleteCostClass,
    getCostClassById
  }
})
