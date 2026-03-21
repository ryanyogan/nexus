<script setup lang="ts">
import { ref, provide, onMounted } from "vue";

const props = defineProps<{
  labels: string[];
  defaultTab?: number;
}>();

const activeTab = ref(props.defaultTab ?? 0);

provide("activeTab", activeTab);

function selectTab(index: number) {
  activeTab.value = index;
}
</script>

<template>
  <div class="tabs-container">
    <div class="tabs-list">
      <button
        v-for="(label, index) in labels"
        :key="index"
        :class="['tab-button', { active: activeTab === index }]"
        @click="selectTab(index)"
      >
        {{ label }}
      </button>
    </div>
    <div class="tabs-content">
      <slot />
    </div>
  </div>
</template>
