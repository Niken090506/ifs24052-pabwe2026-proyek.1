<script setup>
import { ref } from "vue";
import { useFocusStore } from "../states/focusStore";
import { showWarningDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const focusStore = useFocusStore();
const hours = ref(0);
const minutes = ref(45);

function handleSave() {
  const totalMinutes = Number(hours.value) * 60 + Number(minutes.value);
  if (totalMinutes <= 0) {
    showWarningDialog("Silakan masukkan durasi fokus yang valid (minimal 1 menit).");
    return;
  }
  focusStore.setPreset(totalMinutes);
  emit("close");
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-sm rounded-2xl nix-glass p-6 text-slate-100 shadow-2xl border border-amber-900/30"
    >
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 leading-none"
      >
        ×
      </button>

      <p class="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-1">
        Focus Session
      </p>

      <h2 class="text-xl font-semibold mb-5 text-white">
        Set custom timer
      </h2>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label class="block text-xs text-slate-300 mb-1.5 font-medium">Hours</label>
          <input
            v-model.number="hours"
            type="number"
            min="0"
            max="23"
            class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-center text-lg font-mono text-slate-100 focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-300 mb-1.5 font-medium">Minutes</label>
          <input
            v-model.number="minutes"
            type="number"
            min="1"
            max="59"
            class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-center text-lg font-mono text-slate-100 focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleSave"
          class="px-5 py-2 rounded-xl text-sm font-bold bg-amber-800 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/40 transition-all"
        >
          Set Timer
        </button>
      </div>
    </div>
  </div>
</template>
