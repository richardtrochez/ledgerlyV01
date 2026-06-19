<template>
  <BaseModal :show="show" @close="$emit('close')" size="lg">
    <template #header>
      <h2 class="text-lg font-semibold text-gray-900">
        {{ isEdit ? 'Editar Cuenta' : 'Nueva Cuenta' }}
      </h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Código -->
      <div>
        <label for="code" class="block text-sm font-medium text-gray-900 mb-2">
          Código <span class="text-red-600">*</span>
        </label>
        <input
          id="code"
          v-model="form.code"
          type="text"
          required
          :disabled="isEdit"
          placeholder="Ej: 4000001"
          class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p class="mt-1 text-sm text-gray-500">El código no se puede cambiar después de crear la cuenta</p>
      </div>

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
          placeholder="Ej: Sueldos y Salarios"
          class="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
        />
      </div>

      <!-- Grupo -->
      <div>
        <label for="group" class="block text-sm font-medium text-gray-900 mb-2">
          Grupo <span class="text-red-600">*</span>
        </label>
        <div class="mt-2 grid grid-cols-1">
          <select
            id="group"
            v-model="form.group"
            required
            class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
          >
            <option value="">Seleccione un grupo...</option>
            <option value="ingreso">Ingreso</option>
            <option value="costo_directo">Costo Directo</option>
            <option value="gasto_operativo">Gasto Operativo</option>
            <option value="otros">Otros</option>
          </select>
          <svg viewBox="0 0 16 16" fill="currentColor" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4">
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
          </svg>
        </div>
      </div>

      <!-- Clase de Costo (Subgroup) -->
      <div>
        <label for="subgroup" class="block text-sm font-medium text-gray-900 mb-2">
          Clase de Costo
        </label>
        <div class="mt-2 grid grid-cols-1">
          <select
            id="subgroup"
            v-model="form.subgroup"
            class="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm"
          >
            <option value="">Sin clase de costo</option>
            <option v-for="costClass in costClasses" :key="costClass._id" :value="costClass.name">
              {{ costClass.name }}
            </option>
          </select>
          <svg viewBox="0 0 16 16" fill="currentColor" class="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4">
            <path d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
          </svg>
        </div>
        <p class="mt-1 text-sm text-gray-500">Opcional: Para agrupar en reportes</p>
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
          Cuenta activa
        </label>
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
          {{ isEdit ? 'Actualizar' : 'Crear' }} Cuenta
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAccountStore } from '@/stores/accounts'
import { useCostClassStore } from '@/stores/costClasses'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  account: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'saved'])

const accountStore = useAccountStore()
const costClassStore = useCostClassStore()

const loading = ref(false)
const errorMessage = ref('')

const form = ref({
  code: '',
  name: '',
  group: '',
  subgroup: '',
  isActive: true
})

const isEdit = computed(() => !!props.account)
const costClasses = computed(() => costClassStore.activeCostClasses)

const isFormValid = computed(() => {
  return form.value.code && form.value.name && form.value.group
})

const handleSubmit = async () => {
  errorMessage.value = ''
  loading.value = true
  
  try {
    const companyId = import.meta.env.VITE_COMPANY_ID
    
    if (isEdit.value) {
      await accountStore.updateAccount(props.account._id, form.value)
    } else {
      // Agregar companyId al crear
      const accountData = {
        ...form.value,
        companyId
      }
      await accountStore.createAccount(accountData)
    }
    
    emit('saved')
    emit('close')
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || 'Error al guardar la cuenta'
  } finally {
    loading.value = false
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    if (props.account) {
      form.value = {
        code: props.account.code,
        name: props.account.name,
        group: props.account.group,
        subgroup: props.account.subgroup || '',
        isActive: props.account.isActive
      }
    } else {
      form.value = {
        code: '',
        name: '',
        group: '',
        subgroup: '',
        isActive: true
      }
    }
    errorMessage.value = ''
  }
})
</script>
