<template>
  <div class="space-y-6">
    <PageHeader
      title="Clases de Costo"
      subtitle="Gestiona las categorias para agrupar gastos en reportes."
    >
      <template #action>
        <BaseButton variant="primary" @click="openCreateModal">
          <template #icon><PlusIcon class="w-4 h-4" /></template>
          Nueva clase de costo
        </BaseButton>
      </template>
    </PageHeader>
    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div class="bg-white overflow-hidden shadow-sm rounded-lg ring-1 ring-gray-900/5">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-blue-50 p-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total Clases</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ costClassStore.costClassesCount }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow-sm rounded-lg ring-1 ring-gray-900/5">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-green-50 p-3">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Activas</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ activeCostClassesCount }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow-sm rounded-lg ring-1 ring-gray-900/5">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-gray-50 p-3">
                <svg class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Cuentas Totales</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ accountStore.accountsCount }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
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
          <h3 class="text-sm font-medium text-blue-800">¿Qué son las Clases de Costo?</h3>
          <div class="mt-2 text-sm text-blue-700">
            <p>
              Las clases de costo te permiten agrupar cuentas similares en el Estado de Resultados. 
              Por ejemplo, puedes agrupar todas las cuentas relacionadas con "Sueldos y salarios" 
              para analizar rápidamente cuánto gastas en personal cada mes.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de clases -->
    <BaseCard>
      <CostClassList
        :cost-classes="costClassStore.costClasses"
        :accounts="accountStore.accounts"
        :loading="costClassStore.loading"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </BaseCard>

    <!-- Modal de formulario -->
    <CostClassForm
      :show="showModal"
      :cost-class="selectedCostClass"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccountStore } from '@/stores/accounts'
import { useCostClassStore } from '@/stores/costClasses'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import CostClassList from '@/components/costClasses/CostClassList.vue'
import CostClassForm from '@/components/costClasses/CostClassForm.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const accountStore = useAccountStore()
const costClassStore = useCostClassStore()

const showModal = ref(false)
const selectedCostClass = ref(null)

const activeCostClassesCount = computed(() =>
  costClassStore.activeCostClasses.length
)

const openCreateModal = () => {
  selectedCostClass.value = null
  showModal.value = true
}

const openEditModal = (costClass) => {
  selectedCostClass.value = costClass
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedCostClass.value = null
}

const handleSaved = async () => {
  await costClassStore.fetchCostClasses()
}

const handleDelete = async (id) => {
  try {
    await costClassStore.deleteCostClass(id)
  } catch (error) {
    console.error('Error deleting cost class:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(),
    costClassStore.fetchCostClasses()
  ])
})
</script>
