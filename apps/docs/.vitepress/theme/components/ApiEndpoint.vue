<script setup lang="ts">
defineProps<{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
}>()
</script>

<template>
  <div class="api-endpoint">
    <span :class="['api-method', method.toLowerCase()]">{{ method }}</span>
    <code class="api-path">{{ path }}</code>
  </div>
</template>
