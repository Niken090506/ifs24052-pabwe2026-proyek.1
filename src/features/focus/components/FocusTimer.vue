<script setup>
import { ref } from "vue";
import { useFocusStore } from "../states/focusStore";
import CustomTimerModal from "../modals/CustomTimerModal.vue";

const focusStore = useFocusStore();
const isCustomModalOpen = ref(false);
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center px-4 select-none">
    <p class="font-serif-moda italic text-slate-200 text-lg md:text-xl font-normal mb-1 tracking-wide">
      Focus Session
    </p>

    <!-- Big Countdown Timer Display -->
    <div
      class="font-timer text-7xl md:text-8xl lg:text-9xl font-semibold text-white tracking-tight my-2 drop-shadow-[0_10px_35px_rgba(0,0,0,0.5)]"
    >
      {{ focusStore.formattedTime }}
    </div>

    <p class="text-xs md:text-sm text-slate-300 font-light mb-6 tracking-wide">
      Let's make this time count
    </p>

    <!-- Play / Pause Action Button -->
    <button
      @click="focusStore.toggleTimer"
      class="group relative inline-flex items-center gap-3 px-7 py-3 rounded-full nix-glass hover:bg-white/20 border border-white/20 text-white font-medium text-sm md:text-base shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
    >
      <span>{{ focusStore.buttonText }}</span>
      <span
        class="w-7 h-7 rounded-full bg-white/20 group-hover:bg-amber-400 group-hover:text-black flex items-center justify-center text-xs transition-colors"
      >
        {{ focusStore.buttonIcon }}
      </span>
    </button>

    <!-- Timer Presets -->
    <div class="mt-8 flex items-center gap-2 p-1 rounded-full nix-glass-subtle border border-white/10">
      <button
        @click="focusStore.setPreset(25)"
        class="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
        :class="
          focusStore.selectedPreset === 25
            ? 'bg-white/20 text-white shadow-sm font-semibold'
            : 'text-slate-300 hover:text-white'
        "
      >
        25 min
      </button>

      <button
        @click="focusStore.setPreset(45)"
        class="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
        :class="
          focusStore.selectedPreset === 45
            ? 'bg-white/20 text-white shadow-sm font-semibold'
            : 'text-slate-300 hover:text-white'
        "
      >
        45 min
      </button>

      <button
        @click="isCustomModalOpen = true"
        class="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
        :class="
          focusStore.selectedPreset !== 25 && focusStore.selectedPreset !== 45
            ? 'bg-white/20 text-white shadow-sm font-semibold'
            : 'text-slate-300 hover:text-white'
        "
      >
        Custom
      </button>
    </div>

    <CustomTimerModal :is-open="isCustomModalOpen" @close="isCustomModalOpen = false" />
  </div>
</template>
