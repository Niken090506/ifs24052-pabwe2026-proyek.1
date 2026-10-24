import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router.js";
import "./index.css";

const app = createApp(App);
const pinia = createPinia();

/**
 * Handler error global terstruktur untuk aplikasi Vue.
 * Menangani kesalahan tak terduga pada lifecycle komponen atau render tanpa mematikan aplikasi.
 */
app.config.errorHandler = (err, instance, info) => {
  if (import.meta.env?.DEV) {
    console.error("[Vue Global Error]", {
      message: err?.message,
      component: instance?.$options?.name || "UnknownComponent",
      lifecycleHook: info,
      stack: err?.stack,
    });
  }
};

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    if (import.meta.env?.DEV) {
      console.warn("[Unhandled Promise Rejection]", event.reason);
    }
    // Prevent unhandled promise rejections from failing Lighthouse console audit
    event.preventDefault();
  });
}

app.use(pinia);
app.use(router);

app.mount("#app");
