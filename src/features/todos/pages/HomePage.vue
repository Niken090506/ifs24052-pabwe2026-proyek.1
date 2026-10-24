<script setup>
import { computed } from "vue";
import TaskCard from "../components/TaskCard.vue";
import FocusTimer from "../../focus/components/FocusTimer.vue";
import AmbientSound from "../../focus/components/AmbientSound.vue";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { useFocusStore } from "../../focus/states/focusStore";

const authStore = useAuthStore();
const usersStore = useUsersStore();
const focusStore = useFocusStore();

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good Afternoon";
  } else {
    return "Good Night";
  }
});

const userName = computed(() => {
  if (authStore.user && authStore.user.name) {
    return authStore.user.name;
  }
  if (usersStore.profile && usersStore.profile.name) {
    return usersStore.profile.name;
  }
  return "Guest";
});
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-4 flex flex-col justify-between min-h-[calc(100vh-140px)]">
    <!-- Normal Mode Dashboard Grid -->
    <div
      v-if="!focusStore.isFullscreen"
      class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center justify-between my-auto transition-all duration-500"
    >
      <!-- Left Column: Quotes & Today's Plan -->
      <div class="lg:col-span-3 flex flex-col gap-6 items-start">
        <div class="space-y-2 select-none">
          <p class="font-serif-moda text-xs text-amber-200/90 italic tracking-wide">
            "The best way to predict the future is to create it"
          </p>
          <h2 class="text-2xl md:text-3xl font-serif-moda text-white font-normal leading-snug">
            {{ greeting }},<br />
            <span class="font-medium text-amber-300">{{ userName }}</span>
          </h2>
          <p class="text-xs text-slate-300 leading-relaxed font-light">
            Ready to focus and<br />
            make progress today?
          </p>
        </div>

        <!-- Today's Plan Card (toggled via button ✓) -->
        <TaskCard v-if="focusStore.showTodos" class="w-full animate-in fade-in duration-300" />
      </div>

      <!-- Center Column: Focus Timer -->
      <div
        class="flex justify-center py-6 transition-all duration-300"
        :class="[
          !focusStore.showTodos && !focusStore.showAmbient ? 'lg:col-span-12' : '',
          !focusStore.showTodos && focusStore.showAmbient ? 'lg:col-span-9' : '',
          focusStore.showTodos && !focusStore.showAmbient ? 'lg:col-span-9' : '',
          focusStore.showTodos && focusStore.showAmbient ? 'lg:col-span-6' : '',
        ]"
      >
        <FocusTimer />
      </div>

      <!-- Right Column: Ambient Sound Card (toggled via button ♫) -->
      <div
        v-if="focusStore.showAmbient"
        class="lg:col-span-3 flex justify-end animate-in fade-in duration-300"
      >
        <AmbientSound />
      </div>
    </div>

    <!-- Fullscreen Mode Layout (Clean Zen Focus) -->
    <div
      v-else
      class="relative w-full flex flex-col items-center justify-center my-auto py-12 transition-all duration-500"
    >
      <!-- Center Focus Timer -->
      <div class="w-full max-w-xl flex justify-center scale-110 py-10 transition-all duration-500">
        <FocusTimer />
      </div>

      <!-- Fullscreen Floating Today's Plan (Appears when button ✓ is pressed) -->
      <div
        v-if="focusStore.showTodos"
        class="fixed left-6 sm:left-12 top-1/2 -translate-y-1/2 z-40 max-w-sm w-full animate-in fade-in slide-in-from-left duration-300 shadow-2xl"
      >
        <TaskCard />
      </div>

      <!-- Fullscreen Floating Ambient Sound (Appears when button ♫ is pressed) -->
      <div
        v-if="focusStore.showAmbient"
        class="fixed right-6 sm:right-12 top-1/2 -translate-y-1/2 z-40 max-w-sm w-full animate-in fade-in slide-in-from-right duration-300 shadow-2xl"
      >
        <AmbientSound />
      </div>
    </div>
  </div>
</template>
