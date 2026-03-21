<script setup lang="ts">
import { inject, computed, type Ref } from "vue";

const props = defineProps<{
  index: number;
}>();

const activeTab = inject<Ref<number>>("activeTab");

const isActive = computed(() => activeTab?.value === props.index);
</script>

<template>
  <div :class="['tab-panel', { active: isActive }]">
    <slot />
  </div>
</template>
