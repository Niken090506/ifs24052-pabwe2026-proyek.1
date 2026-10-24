<template>
  <form @submit.prevent="onSubmitHandler" class="space-y-4">
    <div>
      <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" for="register-name-input">
        Nama Lengkap
      </label>
      <div class="relative">
        <User
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          id="register-name-input"
          data-testid="register-name-input"
          v-model="name"
          placeholder="Nama Lengkap Anda"
          aria-label="Nama Lengkap"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 transition-all"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" for="register-email-input">
        Alamat Email
      </label>
      <div class="relative">
        <Mail
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="email"
          id="register-email-input"
          data-testid="register-email-input"
          v-model="email"
          placeholder="nama@email.com"
          aria-label="Alamat Email"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 transition-all"
          required
        />
      </div>
    </div>

    <div>
      <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5" for="register-password-input">
        Kata Sandi
      </label>
      <div class="relative">
        <Lock
          :size="18"
          class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="password"
          id="register-password-input"
          data-testid="register-password-input"
          v-model="password"
          placeholder="Minimal 6 karakter"
          aria-label="Kata Sandi"
          class="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 transition-all"
          required
        />
      </div>
    </div>

    <div class="pt-2">
      <button
        type="submit"
        id="register-submit-button"
        data-testid="register-submit-button"
        :disabled="loading"
        class="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-amber-800 hover:bg-amber-700 active:bg-amber-900 rounded-xl shadow-lg shadow-amber-900/40 transition-all disabled:opacity-60"
      >
        <template v-if="loading">
          <Loader2 :size="18" class="animate-spin" />
          <span>Mendaftarkan Akun...</span>
        </template>
        <template v-else>
          <UserPlus :size="18" :stroke-width="2.5" />
          <span>Daftar Akun</span>
        </template>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { User, Mail, Lock, Loader2, UserPlus } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { isValidEmail, validatePassword, validateRequiredText } from "../../../helpers/validationHelper";

const router = useRouter();
const authStore = useAuthStore();

const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);

watch(
  () => authStore.isAuthRegister,
  (isAuthRegister) => {
    if (isAuthRegister) {
      loading.value = false;
      authStore.setIsAuthRegister(false);
      name.value = "";
      email.value = "";
      password.value = "";
      router.push("/auth/login");
    } else {
      loading.value = false;
    }
  }
);

async function onSubmitHandler() {
  const nameVal = validateRequiredText(name.value, "Nama Lengkap", 50);
  if (!nameVal.isValid) {
    showErrorDialog(nameVal.message);
    return;
  }
  if (!isValidEmail(email.value)) {
    showErrorDialog("Alamat email tidak valid. Masukkan format email yang benar!");
    return;
  }
  const passVal = validatePassword(password.value, 6);
  if (!passVal.isValid) {
    showErrorDialog(passVal.message);
    return;
  }

  loading.value = true;
  try {
    await authStore.asyncSetIsAuthRegister(name.value.trim(), email.value.trim(), password.value);
  } finally {
    loading.value = false;
  }
}
</script>
