<script setup>
import { useFocusStore } from "../states/focusStore";

const focusStore = useFocusStore();

const options = [
  { id: "rain", label: "🌧 Rain", sub: "Gentle rainfall" },
  { id: "relaxing_music", label: "🎵 Relaxing Music", sub: "Merry-Go-Round of Life (Grissini Project)" },
  { id: "suasana_hutan", label: "🌿 Suasana Hutan", sub: "Forest Nature Ambience" },
];
</script>

<template>
  <div class="nix-glass rounded-2xl p-5 border border-white/10 w-full max-w-sm flex flex-col justify-between shadow-2xl transition-all">
    <div>
      <div class="pb-3 border-b border-white/10">
        <h3 class="text-sm font-semibold tracking-wide text-slate-100">Ambient Sound</h3>
      </div>

      <p class="text-xs text-slate-300 mt-3 mb-4 leading-relaxed">
        Create a calm environment for your study session.
      </p>

      <div class="space-y-2">
        <button
          v-for="opt in options"
          :key="opt.id"
          @click="focusStore.toggleAmbient(opt.id)"
          class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium border transition-all text-left group"
          :class="
            focusStore.activeAmbient === opt.id
              ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
              : 'bg-black/20 hover:bg-black/30 border-white/5 text-slate-200 hover:border-white/20'
          "
        >
          <div class="flex flex-col pr-2">
            <span class="font-medium text-slate-100">{{ opt.label }}</span>
            <span v-if="opt.sub" class="text-[10px] text-slate-400 group-hover:text-slate-300 font-normal">
              {{ opt.sub }}
            </span>
          </div>
          <span
            v-if="focusStore.activeAmbient === opt.id"
            class="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider shrink-0"
          >
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Playing
          </span>
        </button>
      </div>
    </div>

    <div class="pt-3 border-t border-white/5 mt-4 flex items-center justify-between text-[11px] text-slate-400">
      <span>Calm ambience</span>
      <button
        v-if="focusStore.activeAmbient"
        @click="focusStore.stopAmbient"
        class="text-amber-300 hover:text-white underline text-[11px]"
      >
        Turn off
      </button>
    </div>
  </div>
</template>
