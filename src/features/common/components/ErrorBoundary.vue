<template>
  <div v-if="hasError" class="min-h-[400px] w-full flex items-center justify-center p-6">
    <div
      class="w-full max-w-lg nix-glass rounded-3xl p-6 sm:p-8 border border-red-500/30 shadow-2xl text-center space-y-5 animate-in fade-in duration-200"
    >
      <!-- Icon Alert -->
      <div
        class="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center shadow-lg shadow-red-900/30"
      >
        <AlertTriangle :size="32" :stroke-width="2.2" />
      </div>

      <!-- Title & Message -->
      <div>
        <h3 class="text-xl font-bold text-white mb-2">
          {{ fallbackTitle }}
        </h3>
        <p class="text-sm text-slate-300 leading-relaxed">
          {{ fallbackMessage }}
        </p>
        <p
          v-if="errorMessage"
          class="mt-3 px-3 py-2 rounded-xl bg-red-950/60 border border-red-500/30 text-xs font-mono text-red-200 break-words"
        >
          {{ errorMessage }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          @click="resetError"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-amber-800 hover:bg-amber-700 active:bg-amber-900 rounded-xl shadow-lg shadow-amber-900/30 transition-all cursor-pointer"
        >
          <RotateCcw :size="16" />
          <span>Coba Lagi</span>
        </button>

        <button
          type="button"
          @click="reloadPage"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/20 active:bg-white/5 rounded-xl border border-white/10 transition-all cursor-pointer"
        >
          <RefreshCw :size="16" />
          <span>Muat Ulang Halaman</span>
        </button>

        <button
          type="button"
          @click="goHome"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Home :size="16" />
          <span>Ke Beranda</span>
        </button>
      </div>

      <!-- Collapsible Error Stack Detail -->
      <div v-if="errorDetails" class="pt-2 border-t border-white/10 text-left">
        <button
          type="button"
          @click="showDetails = !showDetails"
          class="text-xs text-slate-400 hover:text-slate-200 underline focus:outline-none"
        >
          {{ showDetails ? "Sembunyikan Rincian Teknis" : "Lihat Rincian Teknis" }}
        </button>
        <pre
          v-if="showDetails"
          class="mt-2 p-3 rounded-lg bg-black/60 border border-white/5 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-40 whitespace-pre-wrap"
        >{{ errorDetails }}</pre>
      </div>
    </div>
  </div>

  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from "vue";
import { AlertTriangle, RotateCcw, RefreshCw, Home } from "lucide-vue-next";

const props = defineProps({
  fallbackTitle: {
    type: String,
    default: "Terjadi Kendala pada Tampilan",
  },
  fallbackMessage: {
    type: String,
    default: "Komponen ini mengalami kesalahan tak terduga. Silakan coba lagi atau muat ulang halaman.",
  },
});

const emit = defineEmits(["error-captured"]);

const hasError = ref(false);
const errorMessage = ref("");
const errorDetails = ref("");
const showDetails = ref(false);

/**
 * Menangkap unhandled error dari komponen anak.
 */
onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  errorMessage.value = err?.message || String(err);
  errorDetails.value = `Komponen: ${instance?.$options?.name || "Anonymous"}\nInfo: ${info}\nStack:\n${err?.stack || "Tidak ada stack trace"}`;

  emit("error-captured", {
    error: err,
    instance,
    info,
  });

  // Hentikan propagasi agar tidak menyebabkan crash aplikasi secara global
  return false;
});

function resetError() {
  hasError.value = false;
  errorMessage.value = "";
  errorDetails.value = "";
  showDetails.value = false;
}

function reloadPage() {
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

function goHome() {
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

defineExpose({
  hasError,
  errorMessage,
  resetError,
});
</script>
