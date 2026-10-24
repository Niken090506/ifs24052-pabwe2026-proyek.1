<script setup>
import { ref } from "vue";
import { useTodosStore } from "../states/todosStore";

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const todosStore = useTodosStore();
const taskTitle = ref("");

async function handleSubmit() {
  if (!taskTitle.value.trim()) return;
  await todosStore.addTodo(taskTitle.value);
  taskTitle.value = "";
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
      class="relative w-full max-w-md rounded-2xl nix-glass p-6 text-slate-100 shadow-2xl border border-amber-900/30"
    >
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 leading-none"
      >
        ×
      </button>

      <p class="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-1">
        Today's Plan
      </p>

      <h2 class="text-xl font-semibold mb-4 text-white">
        Add a new task
      </h2>

      <form @submit.prevent="handleSubmit">
        <input
          v-model="taskTitle"
          type="text"
          placeholder="What do you need to do?"
          maxlength="80"
          autofocus
          class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 mb-4 transition-all"
        />

        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 rounded-xl text-sm font-bold bg-amber-800 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/40 transition-all"
          >
            Add Task
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
