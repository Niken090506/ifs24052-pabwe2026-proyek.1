<script setup>
import { ref, onMounted, computed } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { useFocusStore } from "../../focus/states/focusStore";
import { useUsersStore } from "../../users/states/usersStore";
import { useAuthStore } from "../../auth/states/authStore";

const route = useRoute();
const router = useRouter();
const focusStore = useFocusStore();
const usersStore = useUsersStore();
const authStore = useAuthStore();

onMounted(async () => {
  focusStore.initFullscreenListener();
  if (authStore.isAuthenticated) {
    await usersStore.asyncSetProfile();
  }
});

const isUserLoggedIn = computed(() => authStore.isAuthenticated);
const userDisplayName = computed(() => {
  return authStore.user?.name || usersStore.profile?.name || "User";
});

const userAvatar = computed(() => {
  return authStore.user?.avatar || usersStore.profile?.photo || usersStore.profile?.avatar || null;
});

const userInitial = computed(() => {
  const name = userDisplayName.value || "U";
  return name.charAt(0).toUpperCase();
});

async function handleLogout() {
  await authStore.asyncSetIsAuthLogout();
  router.push("/");
}

function toggleFullscreen() {
  focusStore.toggleFullscreen();
}

function handleToggleTodos() {
  if (route.path !== "/") {
    router.push("/");
    focusStore.showTodos = true;
    return;
  }
  focusStore.toggleShowTodos();
}

function handleToggleAmbient() {
  if (route.path !== "/") {
    router.push("/");
    focusStore.showAmbient = true;
    return;
  }
  focusStore.toggleShowAmbient();
}
</script>

<template>
  <div class="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden selection:bg-amber-500 selection:text-black">
    <!-- Cozy Wallpaper Desk Background -->
    <div
      class="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
      :style="{ backgroundImage: `url('/assets/desk-bg.webp')` }"
    >
      <!-- Warm Vignette and Blur Overlay -->
      <div class="absolute inset-0 bg-stone-950/50 backdrop-blur-[2px]"></div>
    </div>

    <!-- Header Navigation Bar -->
    <header class="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
      <!-- Brand Logo -->
      <RouterLink to="/" class="flex flex-col group select-none">
        <h1 class="font-serif-moda text-xl md:text-2xl font-normal tracking-[0.2em] text-white group-hover:text-amber-200 transition-colors">
          NIXBAY
        </h1>
        <span class="text-[10px] md:text-[11px] font-light tracking-widest text-slate-300 uppercase">
          stay here study here
        </span>
      </RouterLink>

      <!-- Center Pill Navigation -->
      <nav class="hidden sm:flex items-center gap-1.5 p-1.5 rounded-full nix-glass-subtle border border-white/10 shadow-xl">
        <RouterLink
          to="/"
          class="px-5 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="route.path === '/' ? 'bg-white/20 text-white font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
        >
          Home
        </RouterLink>
        <RouterLink
          to="/notebook"
          class="px-5 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="route.path === '/notebook' ? 'bg-white/20 text-white font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
        >
          Notebook
        </RouterLink>
        <RouterLink
          to="/progress"
          class="px-5 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="route.path === '/progress' ? 'bg-white/20 text-white font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
        >
          Progress
        </RouterLink>
        <RouterLink
          to="/users"
          class="px-5 py-1.5 rounded-full text-xs font-medium transition-all"
          :class="route.path === '/users' ? 'bg-white/20 text-white font-semibold shadow-sm' : 'text-slate-300 hover:text-white'"
        >
          Users
        </RouterLink>
      </nav>

      <!-- Right Actions: Sound Volume & Auth Actions -->
      <div class="flex items-center gap-3">
        <!-- Sound Mute/Active Toggle -->
        <button
          @click="focusStore.toggleMute"
          class="w-10 h-10 rounded-full nix-glass hover:bg-white/20 flex items-center justify-center text-slate-200 hover:text-white border border-white/10 transition-all"
          :title="focusStore.isMuted ? 'Unmute Sound' : 'Mute Sound'"
        >
          <span v-if="focusStore.isMuted" class="text-sm">🔇</span>
          <span v-else class="text-sm">🔊</span>
        </button>

        <!-- If Logged In: Profile Avatar and Logout -->
        <template v-if="isUserLoggedIn">
          <RouterLink
            to="/profile"
            class="relative w-10 h-10 rounded-full overflow-hidden border border-amber-300/40 hover:border-amber-400 p-0.5 transition-all shadow-lg hover:scale-105 flex items-center justify-center bg-black/40"
            :title="`Profil: ${userDisplayName}`"
          >
            <img
              v-if="userAvatar"
              :src="userAvatar"
              :alt="userDisplayName"
              class="w-full h-full object-cover rounded-full"
            />
            <div
              v-else
              class="w-full h-full rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold text-xs select-none"
            >
              {{ userInitial }}
            </div>
          </RouterLink>
          <button
            @click="handleLogout"
            class="hidden md:inline-flex px-3 py-1.5 rounded-xl nix-glass hover:bg-red-500/20 text-xs font-medium text-slate-300 hover:text-red-200 border border-white/10 transition-all"
            title="Keluar dari akun"
          >
            Keluar
          </button>
        </template>

        <!-- If NOT Logged In: Login & Register Button (Data profil tidak bisa diakses) -->
        <template v-else>
          <RouterLink
            to="/auth/login"
            class="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-800 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/40 transition-all"
          >
            Masuk Akun
          </RouterLink>
        </template>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="relative z-10 flex-1 flex flex-col justify-center py-2">
      <RouterView />
    </main>

    <!-- Bottom Controls & Shortcuts -->
    <footer class="relative z-20 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between pointer-events-none">
      <div class="pointer-events-auto">
        <button
          @click="handleToggleTodos"
          class="w-10 h-10 rounded-2xl nix-glass hover:bg-white/20 flex items-center justify-center border transition-all text-sm font-bold shadow-lg"
          :class="focusStore.showTodos ? 'border-amber-400 text-amber-300 bg-white/20 shadow-amber-500/20' : 'border-white/10 text-slate-200 hover:text-amber-300'"
          title="Toggle Today's Plan"
        >
          ✓
        </button>
      </div>

      <div class="flex items-center gap-2 pointer-events-auto">
        <button
          @click="handleToggleAmbient"
          class="w-10 h-10 rounded-2xl nix-glass hover:bg-white/20 flex items-center justify-center border transition-all text-sm shadow-lg"
          :class="focusStore.showAmbient ? 'border-amber-400 text-amber-300 bg-white/20 shadow-amber-500/20' : 'border-white/10 text-slate-200 hover:text-amber-300'"
          title="Toggle Music / Ambient Sound"
        >
          ♫
        </button>
        <button
          @click="toggleFullscreen"
          class="w-10 h-10 rounded-2xl nix-glass hover:bg-white/20 flex items-center justify-center border transition-all text-sm shadow-lg"
          :class="focusStore.isFullscreen ? 'border-amber-400 text-amber-300 bg-white/20 shadow-amber-500/20' : 'border-white/10 text-slate-200 hover:text-amber-300'"
          title="Fullscreen Mode"
        >
          ⛶
        </button>
      </div>
    </footer>
  </div>
</template>
