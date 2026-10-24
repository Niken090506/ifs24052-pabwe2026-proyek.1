<template>
  <main class="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
    <!-- Cozy Wallpaper Desk Background -->
    <div
      class="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url('/assets/desk-bg.webp')` }"
    >
      <div class="absolute inset-0 bg-stone-950/70 backdrop-blur-md"></div>
    </div>

    <div class="relative z-10 max-w-md w-full text-center nix-glass p-8 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
      <!-- Decorative Badge -->
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-300 mb-6 shadow-sm ring-4 ring-amber-500/20">
        <TriangleAlert :size="40" :stroke-width="2" />
      </div>

      <!-- Status Code & Headings -->
      <h1 class="text-7xl sm:text-8xl font-black text-white tracking-tight font-timer">
        404
      </h1>
      <h2 class="mt-3 text-xl sm:text-2xl font-serif-moda font-normal text-amber-200 tracking-tight">
        Halaman Tidak Ditemukan
      </h2>
      <p class="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
        Maaf, rute atau halaman yang Anda cari tidak tersedia, telah dipindahkan, atau tidak pernah ada.
      </p>

      <!-- Action Buttons -->
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          data-testid="back-btn"
          @click="router.go(-1)"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition-all cursor-pointer"
        >
          <ArrowLeft :size="16" />
          <span>Kembali</span>
        </button>
        <button
          type="button"
          data-testid="home-btn"
          @click="router.push('/')"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-800 hover:bg-amber-700 shadow-lg shadow-amber-900/40 transition-all cursor-pointer"
        >
          <Home :size="16" />
          <span>Ke Halaman Utama</span>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useRouter } from "vue-router";
import { TriangleAlert, ArrowLeft, Home } from "lucide-vue-next";

const router = useRouter();
</script>
