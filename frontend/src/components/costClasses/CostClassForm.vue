<template>
  <BaseModal :show="show" @close="$emit('close')" size="md">
    <template #header>
      <h2 class="text-lg font-semibold text-gray-900">
        {{ isEdit ? 'Editar Clase de Costo' : 'Nueva Clase de Costo' }}
      </h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Nombre -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-900 mb-2">
          Nombre <span class="text-red-600">*</span>
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Ej: Sueldos y salarios"
          class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
        />
      </div>

      <!-- Descripción -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-900 mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Descripción opcional de la clase de costo..."
          class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm resize-none"
        ></textarea>
      </div>

      <!-- Estado Activo -->
      <div class="flex items-center gap-3">
        <input
          id="isActive"
          v-model="form.isActive"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
        />
        <label for="isActive" class="text-sm font-medium text-gray-900">
          Clase activa
        </label>
      </div>

      <!-- Información -->
      <div class="rounded-md bg-blue-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm text-blue-700">
              Las clases de costo se usan para agrupar cuentas en el Estado de Resultados.
            </p>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="rounded-md bg-red-50 p-4 border border-red-200">
        <p class="text-sm text-red-800">{{ errorMessage }}</p>
      </div>

      <!-- Botones -->
      <div class="flex items-center justify-end gap-x-3 border-t border-gray-200 pt-6">
        <BaseButton
          type="button"
          variant="outline"
          @click="$emit('close')"
          class="px-6"
        >
          Cancelar
        </BaseButton>
        <BaseButton
          type="submit"
          :loading="loading"
          :disabled="!isFormValid"
          class="px-6 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {{ isEdit ? 'Actualizar' : 'Crear' }} Clase
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCostClassStore } from '@/stores/costClasses'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  costClass: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const costClassStore = useCostClassStore()

const loading = ref(false)
const errorMessage = ref('')

const form = ref({
  name: '',
  description: '',
  isActive: true
})

const isEdit = computed(() => !!props.costClass)

const isFormValid = computed(() => {
  return form.value.name.trim().length > 0
})

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true
  
  try {
    if (isEdit.value) {
      await costClassStore.updateCostClass(props.costClass._id, form.value)
    } else {
      await costClassStore.createCostClass(form.value)
    }
    
    emit('saved')
    emit('close')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || 'Error al guardar la clase de costo'
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.costClass) {
      form.value = {
        name: props.costClass.name,
        description: props.costClass.description || '',
        isActive: props.costClass.isActive
      }
    } else {
      form.value = {
        name: '',
        description: '',
        isActive: true
      }
    }
    errorMessage.value = ''
  }
})
</script>
