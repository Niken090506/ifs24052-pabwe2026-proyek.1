import { defineStore } from "pinia";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { useTodosStore } from "../../todos/states/todosStore";
import { useNotebookStore } from "../../notebook/states/notebookStore";
import { useFocusStore } from "../../focus/states/focusStore";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
    user: (() => {
      try {
        const stored = localStorage.getItem("nixbayUser");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })(),
  }),

  getters: {
    isAuthenticated: () => Boolean(apiHelper.getAccessToken()),
    userName: (state) => state.user?.name || "Guest",
  },

  actions: {
    setIsAuthLogin(value) {
      this.isAuthLogin = value;
    },
    setIsAuthRegister(value) {
      this.isAuthRegister = value;
    },
    setIsAuthLogout(value) {
      this.isAuthLogout = value;
    },
    setUser(user) {
      this.user = user;
      if (user) {
        localStorage.setItem("nixbayUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("nixbayUser");
      }
    },
    async asyncSetIsAuthLogin(email, password) {
      try {
        const data = await authApi.postLogin(email, password);
        apiHelper.putAccessToken(data.token);
        if (data.user) {
          this.setUser(data.user);
        }
        this.setIsAuthLogin(true);

        // Fetch fresh user-scoped tasks, notebook, and focus sessions
        try {
          const todosStore = useTodosStore();
          await todosStore.fetchTodos();
          const notebookStore = useNotebookStore();
          await notebookStore.fetchFolders();
          await notebookStore.fetchNotes();
          const focusStore = useFocusStore();
          await focusStore.fetchSessions();
        } catch {}

        showSuccessDialog("Login berhasil! Selamat datang kembali.");
      } catch (error) {
        this.setIsAuthLogin(false);
        showErrorDialog(error.message);
      }
    },
    async asyncSetIsAuthRegister(name, email, password) {
      try {
        const message = await authApi.postRegister(name, email, password);
        this.setIsAuthRegister(true);
        showSuccessDialog(message || "Pendaftaran akun berhasil! Silakan masuk.");
      } catch (error) {
        this.setIsAuthRegister(false);
        showErrorDialog(error.message);
      }
    },
    async asyncSetIsAuthLogout() {
      try {
        await authApi.postLogout();
      } catch (error) {
        // Still proceed with clearing token locally even if server error
      } finally {
        apiHelper.putAccessToken("");
        this.setUser(null);
        this.setIsAuthLogout(true);

        // Reset tasks, notes, and study progress
        try {
          const todosStore = useTodosStore();
          todosStore.todos = [];
          const notebookStore = useNotebookStore();
          notebookStore.notes = [];
          notebookStore.folders = [];
          notebookStore.totalNotes = 0;
          const focusStore = useFocusStore();
          focusStore.sessions = [];
          focusStore.stats = {
            totalSessions: 0,
            totalMinutes: 0,
            totalHours: "0.0",
          };
        } catch {}

        showSuccessDialog("Anda telah berhasil keluar.");
      }
    },
  },
});
