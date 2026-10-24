<script setup>
import { onMounted } from "vue";
import { useFocusStore } from "../../focus/states/focusStore";
import { useTodosStore } from "../../todos/states/todosStore";

const focusStore = useFocusStore();
const todosStore = useTodosStore();

onMounted(async () => {
  await focusStore.fetchSessions();
  await todosStore.fetchTodos();
});

function formatSessionDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto py-6 px-4">
    <div class="nix-glass rounded-3xl p-8 border border-white/10 shadow-2xl">
      <div class="mb-8">
        <h2 class="font-serif-moda text-3xl font-normal text-white">Study Progress</h2>
        <p class="text-xs text-slate-400 mt-1">Track your deep work and daily learning milestones</p>
      </div>

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="p-5 rounded-2xl bg-black/30 border border-white/10">
          <p class="text-xs text-slate-400 mb-1">Total Focus Time</p>
          <div class="text-3xl font-semibold text-amber-300 font-mono">
            {{ focusStore.stats.totalHours }} <span class="text-sm font-normal text-slate-300">hrs</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">{{ focusStore.stats.totalMinutes }} total minutes</p>
        </div>

        <div class="p-5 rounded-2xl bg-black/30 border border-white/10">
          <p class="text-xs text-slate-400 mb-1">Completed Sessions</p>
          <div class="text-3xl font-semibold text-white font-mono">
            {{ focusStore.stats.totalSessions }}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Pomodoro intervals completed</p>
        </div>

        <div class="p-5 rounded-2xl bg-black/30 border border-white/10">
          <p class="text-xs text-slate-400 mb-1">Tasks Completed</p>
          <div class="text-3xl font-semibold text-emerald-400 font-mono">
            {{ todosStore.todos.filter((t) => t.completed).length }}/{{ todosStore.todos.length }}
          </div>
          <p class="text-[11px] text-slate-400 mt-1">From Today's Plan</p>
        </div>
      </div>

      <!-- Recent Sessions Log -->
      <div>
        <h3 class="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
          Recent Focus Sessions
        </h3>

        <div v-if="focusStore.sessions.length === 0" class="py-12 text-center text-xs text-slate-400 italic">
          No focus sessions logged yet. Start a focus session from the Home page!
        </div>

        <div v-else class="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div
            v-for="s in focusStore.sessions"
            :key="s.id"
            class="flex items-center justify-between p-3.5 rounded-xl bg-black/20 border border-white/5 text-xs text-slate-200"
          >
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <span class="font-medium text-white">{{ s.duration_minutes }} minutes focus session</span>
            </div>
            <span class="text-slate-400 text-[11px]">{{ formatSessionDate(s.completed_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
