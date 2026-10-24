import { defineStore } from "pinia";
import notebookApi from "../api/notebookApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

export const useNotebookStore = defineStore("notebook", {
  state: () => ({
    folders: [],
    totalNotes: 0,
    activeFolderId: "all",
    notes: [],
    selectedNote: null,
    searchQuery: "",
    loading: false,
    error: null,
  }),

  getters: {
    activeFolderName(state) {
      if (state.activeFolderId === "all") return "All Notes";
      const f = state.folders.find((x) => String(x.id) === String(state.activeFolderId));
      return f ? f.name : "All Notes";
    },
    filteredNotes(state) {
      if (!state.searchQuery.trim()) return state.notes;
      const q = state.searchQuery.toLowerCase();
      return state.notes.filter(
        (n) => n.title.toLowerCase().includes(q) || (n.content && n.content.toLowerCase().includes(q))
      );
    },
  },

  actions: {
    async fetchFolders() {
      try {
        const data = await notebookApi.getFolders();
        this.folders = data.folders || [];
        this.totalNotes = data.totalNotes || 0;
      } catch (err) {
        console.error(err);
      }
    },

    async fetchNotes() {
      this.loading = true;
      try {
        const data = await notebookApi.getNotes(this.activeFolderId, this.searchQuery);
        this.notes = data || [];
        this.error = null;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async setFolder(folderId) {
      this.activeFolderId = folderId;
      await this.fetchNotes();
    },

    setSearch(query) {
      this.searchQuery = query;
      this.fetchNotes();
    },

    async createFolder(name, icon = "folder", description = "") {
      try {
        const newFolder = await notebookApi.postFolder(name, icon, description);
        this.folders.push(newFolder);
        showSuccessDialog("Folder baru berhasil dibuat!");
        return newFolder;
      } catch (err) {
        showErrorDialog(err.message || "Gagal membuat folder");
      }
    },

    async createNote(title, content, folderId) {
      try {
        const newNote = await notebookApi.postNote(title, content, folderId);
        this.notes.unshift(newNote);
        this.totalNotes += 1;
        // update folder count
        const f = this.folders.find((x) => String(x.id) === String(folderId));
        if (f) f.note_count = (f.note_count || 0) + 1;
        showSuccessDialog("Catatan berhasil disimpan!");
        return newNote;
      } catch (err) {
        showErrorDialog(err.message || "Gagal menyimpan catatan");
      }
    },

    async updateNote(id, title, content, folderId) {
      try {
        const updated = await notebookApi.putNote(id, title, content, folderId);
        const idx = this.notes.findIndex((n) => n.id === id);
        if (idx !== -1) {
          this.notes[idx] = updated;
        }
        if (this.selectedNote && this.selectedNote.id === id) {
          this.selectedNote = updated;
        }
        showSuccessDialog("Catatan berhasil diperbarui!");
        return updated;
      } catch (err) {
        showErrorDialog(err.message || "Gagal memperbarui catatan");
      }
    },

    async removeNote(id) {
      try {
        await notebookApi.deleteNote(id);
        this.notes = this.notes.filter((n) => n.id !== id);
        this.totalNotes = Math.max(0, this.totalNotes - 1);
        if (this.selectedNote && this.selectedNote.id === id) {
          this.selectedNote = null;
        }
        await this.fetchFolders();
      } catch (err) {
        showErrorDialog(err.message || "Gagal menghapus catatan");
      }
    },
  },
});
