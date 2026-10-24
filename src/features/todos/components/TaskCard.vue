<script setup>
import { ref, onMounted } from "vue";
import { useTodosStore } from "../states/todosStore";
import AddTaskModal from "../modals/AddTaskModal.vue";

const todosStore = useTodosStore();
const isModalOpen = ref(false);

onMounted(() => {
  todosStore.fetchTodos();
});
</script>

<template>
  <div class="nix-glass rounded-2xl p-5 border border-white/10 w-full max-w-sm flex flex-col justify-between shadow-2xl transition-all">
    <!-- Header -->
    <div class="flex items-center justify-between pb-3 border-b border-white/10">
      <h3 class="text-sm font-semibold tracking-wide text-slate-100">Today's Plan</h3>
      <button
        @click="isModalOpen = true"
        class="text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-full transition-all flex items-center gap-1"
      >
        <span>+</span> Add Task
      </button>
    </div>

    <!-- Task List -->
    <div class="my-3 space-y-2 max-h-56 overflow-y-auto pr-1">
      <div
        v-if="todosStore.loading && todosStore.todos.length === 0"
        class="text-xs text-slate-400 py-4 text-center italic"
      >
        Loading tasks...
      </div>

      <div
        v-else-if="todosStore.todos.length === 0"
        class="text-xs text-slate-400 py-6 text-center italic"
      >
        No tasks for today.
      </div>

      <div
        v-for="task in todosStore.todos"
        :key="task.id"
        class="group flex items-center justify-between gap-3 p-2 rounded-xl bg-black/20 hover:bg-black/30 border border-white/5 transition-all"
        :class="{ 'opacity-60': task.completed }"
      >
        <div class="flex items-center gap-3 overflow-hidden">
          <button
            @click="todosStore.toggleTodo(task)"
            class="w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-all flex-shrink-0"
            :class="
              task.completed
                ? 'bg-amber-500 border-amber-500 text-black font-bold'
                : 'border-white/30 hover:border-amber-400 text-transparent'
            "
          >
            ✓
          </button>
          <span
            class="text-xs text-slate-200 truncate select-none"
            :class="{ 'line-through text-slate-400': task.completed }"
          >
            {{ task.title }}
          </span>
        </div>

        <button
          @click="todosStore.removeTodo(task.id)"
          class="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 text-sm px-1.5 py-0.5 rounded transition-all leading-none"
          title="Delete task"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Footer button -->
    <div class="pt-2 border-t border-white/5 text-center">
      <button
        @click="isModalOpen = true"
        class="text-xs text-slate-400 hover:text-white transition-colors"
      >
        View All Tasks
      </button>
    </div>

    <AddTaskModal :is-open="isModalOpen" @close="isModalOpen = false" />
  </div>
</template>
