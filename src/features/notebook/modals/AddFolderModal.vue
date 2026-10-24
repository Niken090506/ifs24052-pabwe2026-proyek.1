<script setup>
import { ref } from "vue";
import { useNotebookStore } from "../states/notebookStore";
import { AVAILABLE_FOLDER_ICONS } from "../../../helpers/notebookHelper";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const notebookStore = useNotebookStore();
const name = ref("");
const description = ref("");
const selectedIcon = ref("code");

const icons = AVAILABLE_FOLDER_ICONS;


async function handleCreate() {
  if (!name.value.trim()) return;
  await notebookStore.createFolder(name.value.trim(), selectedIcon.value, description.value.trim());
  name.value = "";
  description.value = "";
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
      class="relative w-full max-w-md rounded-2xl nix-glass p-7 text-slate-100 shadow-2xl border border-white/10"
    >
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 leading-none"
      >
        ×
      </button>

      <h2 class="text-xl font-semibold mb-5 text-white">
        Add Newbook
      </h2>

      <div class="mb-4">
        <div class="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
          <span>Notebook Name</span>
          <span class="text-slate-400">{{ name.length }}/50</span>
        </div>
        <input
          v-model="name"
          type="text"
          placeholder="e.g. Database System"
          maxlength="50"
          autofocus
          class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 transition-all"
        />
      </div>

      <div class="mb-5">
        <div class="flex items-center justify-between text-xs text-slate-300 mb-1.5 font-medium">
          <span>Description (optional)</span>
          <span class="text-slate-400">{{ description.length }}/100</span>
        </div>
        <textarea
          v-model="description"
          rows="3"
          maxlength="100"
          placeholder="Add a short description about this notebook"
          class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 resize-none transition-all"
        ></textarea>
      </div>

      <div class="mb-6">
        <label class="block text-xs text-slate-300 mb-2 font-medium">Choose an Icon</label>
        <div class="flex items-center gap-2">
          <button
            v-for="icon in icons"
            :key="icon.id"
            type="button"
            @click="selectedIcon = icon.id"
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm border transition-all"
            :class="
              selectedIcon === icon.id
                ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-md shadow-amber-500/20'
                : 'bg-black/30 border-white/10 text-slate-300 hover:border-white/30'
            "
          >
            {{ icon.symbol }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
        <button
          type="button"
          @click="emit('close')"
          class="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 transition-all"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="handleCreate"
          :disabled="!name.trim()"
          class="px-5 py-2.5 rounded-xl text-xs font-semibold bg-amber-700/80 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/40 transition-all"
        >
          Create Notebook
        </button>
      </div>
    </div>
  </div>
</template>
