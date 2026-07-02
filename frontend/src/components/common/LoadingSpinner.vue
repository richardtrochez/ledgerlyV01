<template>
  <div :class="containerClasses">
    <svg
      :class="spinnerClasses"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <p v-if="text" :class="textClasses">{{ text }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary', // primary, white, gray
    validator: (value) => ['primary', 'white', 'gray'].includes(value)
  },
  text: {
    type: String,
    default: ''
  },
  center: {
    type: Boolean,
    default: false
  }
})

const containerClasses = computed(() => {
  const base = 'flex flex-col items-center gap-3'
  const centerClass = props.center ? 'justify-center min-h-[200px]' : ''
  return `${base} ${centerClass}`
})

const spinnerClasses = computed(() => {
  const base = 'animate-spin'
  
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colors = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-400'
  }

  return `${base} ${sizes[props.size]} ${colors[props.color]}`
})

const textClasses = computed(() => {
  const colors = {
    primary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-500'
  }

  return `text-sm font-medium ${colors[props.color]}`
})
</script>
