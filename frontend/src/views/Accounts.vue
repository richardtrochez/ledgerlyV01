<template>
  <div class="space-y-6">
  <PageHeader
      title="Catálogo de cuentas"
      subtitle="Gestiona la contabilidad de una forma sencilla y predictiva."
    />

    <!-- Acción principal: al inicio, alineada con el contenido -->
    <div class="flex">
      <BaseButton variant="primary" @click="openCreateModal">
        <template #icon><PlusIcon class="w-4 h-4" /></template>
        Nueva cuenta
      </BaseButton>
    </div>



    <!-- Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow-sm rounded-lg ring-1 ring-gray-900/5">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-blue-50 p-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Total de cuentas</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ accountStore.accountsCount }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow-sm rounded-lg ring-1 ring-gray-900/5">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-emerald-50 p-3">
                <svg class="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Ingresos</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ incomeCount }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow-sm rounded-lg ring-1 ring-gray-900/5">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="rounded-md bg-rose-50 p-3">
                <svg class="h-6 w-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Egresos</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ expenseCount }}</dd>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Clases de costo</dt>
                <dd class="text-2xl font-semibold text-gray-900">{{ costClassStore.costClassesCount }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>  
      
    </div>

    

    <!-- Lista de cuentas -->
    <BaseCard>
    <AccountList
  :accounts="accountStore.accounts"
  :loading="accountStore.loading"
  @edit="openEditModal"
  @delete="handleDelete"
  @toggle="handleToggle"
/>
    </BaseCard>

    <!-- Modal de formulario -->
    <AccountForm
      :show="showModal"
      :account="selectedAccount"
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
import AccountList from '@/components/accounts/AccountList.vue'
import AccountForm from '@/components/accounts/AccountForm.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const accountStore = useAccountStore()
const costClassStore = useCostClassStore()

const showModal = ref(false)
const selectedAccount = ref(null)

const incomeCount = computed(() =>
  accountStore.accounts.filter(a => a.group === 'ingreso').length
)

const expenseCount = computed(() =>
  accountStore.accounts.filter(a =>
    a.group === 'gasto_operativo' || a.group === 'costo_directo'
  ).length
)

const openCreateModal = () => {
  selectedAccount.value = null
  showModal.value = true
}

const openEditModal = (account) => {
  selectedAccount.value = account
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedAccount.value = null
}

const handleSaved = async () => {
  await accountStore.fetchAccounts()
}

const handleDelete = async (id) => {
  try {
    await accountStore.deleteAccount(id)
  } catch (error) {
    console.error('Error al eliminar cuenta:', error)
  }
}

const handleToggle = async (id) => {
  try {
    await accountStore.toggleAccount(id)
  } catch (error) {
    console.error('Error al cambiar estado de cuenta:', error)
  }
}
 

onMounted(async () => {
  await Promise.all([
    accountStore.fetchAccounts(),
    costClassStore.fetchCostClasses()
  ])
})
</script>
