<template>
  <router-link
    :to="to"
    class="px-3 py-2 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary-deep)] hover:bg-[var(--color-primary-soft)] rounded-lg transition"
    :class="{ 'text-[var(--color-primary-deep)] bg-[var(--color-primary-soft)]': isActive }"
  >
    {{ label }}
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  to: String,
  label: String,
  icon: String
})

const route = useRoute()

const isActive = computed(() => {
  return route.path === props.to
})
</script>

<style scoped>
a {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
