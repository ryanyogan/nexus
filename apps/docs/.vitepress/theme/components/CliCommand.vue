<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  command: string;
}>();

const copied = ref(false);

function copyToClipboard() {
  navigator.clipboard.writeText(props.command);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="cli-command">
    <code>{{ command }}</code>
    <button class="cli-command-copy" @click="copyToClipboard">
      {{ copied ? "Copied!" : "Copy" }}
    </button>
  </div>
</template>
