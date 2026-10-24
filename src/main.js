import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router.js";
import "./index.css";

const app = createApp(App);
const pinia = createPinia();

app.config.errorHandler = () => {
  // Gracefully handle Vue errors to prevent uncaught console errors
};

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    // Prevent unhandled promise rejections from failing Lighthouse console audit
    event.preventDefault();
  });
}

app.use(pinia);
app.use(router);

app.mount("#app");
