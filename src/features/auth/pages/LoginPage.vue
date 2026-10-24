<template>
  <form @submit.prevent="onSubmitHandler" class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" for="username">
        Username / Email
      </label>
      <div class="relative">
        <Mail
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          id="username"
          name="username"
          data-testid="login-email-input"
          v-model="email"
          placeholder="admin atau nama@email.com"
          aria-label="Username atau Email"
          autocomplete="username"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 transition-all"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" for="password">
        Kata Sandi
      </label>
      <div class="relative">
        <Lock
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="password"
          id="password"
          name="password"
          data-testid="login-password-input"
          v-model="password"
          placeholder="••••••••"
          aria-label="Kata Sandi"
          autocomplete="current-password"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 transition-all"
          required
        />
      </div>
    </div>

    <div class="pt-2">
      <button
        type="submit"
        id="btn-submit"
        name="btn-submit"
        data-testid="login-submit-button"
        :disabled="loading"
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-amber-800 hover:bg-amber-700 active:bg-amber-900 rounded-xl shadow-lg shadow-amber-900/40 transition-all disabled:opacity-60"
      >
        <template v-if="loading">
          <Loader2 :size="18" class="animate-spin" />
          <span>Sedang Masuk...</span>
        </template>
        <template v-else>
          <LogIn :size="18" :stroke-width="2.5" />
          <span>Masuk Sekarang</span>
        </template>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Mail, Lock, Loader2, LogIn } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import apiHelper from "../../../helpers/apiHelper";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const usersStore = useUsersStore();

const email = ref("");
const password = ref("");
const loading = ref(false);

watch(
  () => authStore.isAuthLogin,
  async (isAuthLogin) => {
    if (isAuthLogin === true) {
      const authToken = apiHelper.getAccessToken();
      if (authToken) {
        await usersStore.asyncSetProfile();
        loading.value = false;
        if (router) {
          const redirect = route?.query?.redirect || "/";
          router.push(redirect);
        }
      } else {
        loading.value = false;
        authStore.setIsAuthLogin(false);
      }
    }
  }
);

watch(
  () => usersStore.isProfile,
  (isProfile) => {
    if (isProfile) {
      loading.value = false;
      authStore.setIsAuthLogin(false);
      usersStore.setIsProfile(false);
      if (router && apiHelper.getAccessToken()) {
        const redirect = route?.query?.redirect || "/";
        router.push(redirect);
      }
    }
  }
);

async function onSubmitHandler() {
  if (!email.value || !email.value.trim()) {
    showErrorDialog("Alamat email atau username wajib diisi!");
    return;
  }
  if (!password.value) {
    showErrorDialog("Kata sandi wajib diisi!");
    return;
  }

  loading.value = true;
  try {
    await authStore.asyncSetIsAuthLogin(email.value.trim(), password.value);
    if (!apiHelper.getAccessToken()) {
      loading.value = false;
    }
  } catch {
    loading.value = false;
  }
}
</script>
