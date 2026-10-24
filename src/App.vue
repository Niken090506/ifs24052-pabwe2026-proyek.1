<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>

<script setup>
import { RouterView } from "vue-router";
import ErrorBoundary from "./features/common/components/ErrorBoundary.vue";
</script>
