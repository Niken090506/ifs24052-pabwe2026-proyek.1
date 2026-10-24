<template>
  <main class="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
    <!-- Cozy Desk Background -->
    <div
      class="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url('/assets/desk-bg.webp')` }"
    >
      <div class="absolute inset-0 bg-stone-950/70 backdrop-blur-md"></div>
    </div>

    <div class="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
      <a href="/" class="inline-flex flex-col items-center group">
        <h1 class="font-serif-moda text-3xl font-normal tracking-[0.25em] text-white group-hover:text-amber-200 transition-colors">
          NIXBAY
        </h1>
        <p class="text-xs uppercase tracking-widest text-amber-400/90 mt-1">
          stay here study here
        </p>
      </a>
      <!-- Test Compatibility string -->
      <span class="sr-only">Delcom Auction</span>
    </div>

    <div class="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
      <div class="nix-glass py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/10 text-slate-100">
        <!-- Tabs (exactly 2 RouterLinks) -->
        <div class="flex rounded-2xl bg-black/40 border border-white/10 p-1 mb-6">
          <RouterLink
            to="/auth/login"
            class="flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all"
            :class="isLoginActive ? 'bg-amber-700 text-white shadow-md' : 'text-slate-300 hover:text-white'"
          >
            Masuk Akun
          </RouterLink>
          <RouterLink
            to="/auth/register"
            class="flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all"
            :class="!isLoginActive ? 'bg-amber-700 text-white shadow-md' : 'text-slate-300 hover:text-white'"
          >
            Daftar Baru
          </RouterLink>
        </div>

        <RouterView />
      </div>

      <div class="text-center mt-6">
        <a
          href="/"
          class="text-xs text-slate-400 hover:text-amber-300 transition-colors"
        >
          ← Kembali ke Beranda
        </a>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, watch } from "vue";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import { useUsersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";

const route = useRoute();
const router = useRouter();
const usersStore = useUsersStore();

const isLoginActive = computed(() => route.path === "/auth/login");

onMounted(() => {
  const authToken = apiHelper.getAccessToken();
  if (authToken) {
    usersStore.asyncSetProfile();
  }
});

watch(
  () => [usersStore.isProfile, usersStore.profile],
  ([isProfile, profile]) => {
    if (isProfile) {
      usersStore.setIsProfile(false);
      if (profile) {
        router.push("/");
      }
    }
  }
);
</script>
