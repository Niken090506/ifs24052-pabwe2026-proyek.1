import { defineStore } from "pinia";
import todoApi from "../api/todoApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const useTodosStore = defineStore("todos", {
  state: () => ({
    todos: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTodos() {
      this.loading = true;
      try {
        const data = await todoApi.getTodos();
        this.todos = data || [];
        this.error = null;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async addTodo(title) {
      if (!title || !title.trim()) {
        showErrorDialog("Judul tugas tidak boleh kosong");
        return;
      }
      try {
        const newTodo = await todoApi.postTodo(title.trim());
        this.todos.unshift(newTodo);
        this.error = null;
      } catch (err) {
        this.error = err.message || "Gagal menambah tugas";
        showErrorDialog(this.error);
      }
    },

    async toggleTodo(todo) {
      const targetState = !todo.completed;
      // optimistic update
      todo.completed = targetState;
      try {
        await todoApi.putTodo(todo.id, { completed: targetState });
        this.error = null;
      } catch (err) {
        todo.completed = !targetState; // rollback
        this.error = err.message || "Gagal mengubah status tugas";
        showErrorDialog(this.error);
      }
    },

    async removeTodo(id) {
      const previous = [...this.todos];
      this.todos = this.todos.filter((t) => t.id !== id);
      try {
        await todoApi.deleteTodo(id);
        this.error = null;
      } catch (err) {
        this.todos = previous; // rollback
        this.error = err.message || "Gagal menghapus tugas";
        showErrorDialog(this.error);
      }
    },

  },
});
