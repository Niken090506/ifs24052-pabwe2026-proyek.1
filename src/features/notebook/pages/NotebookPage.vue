<script setup>
import { ref, onMounted } from "vue";
import { useNotebookStore } from "../states/notebookStore";
import AddFolderModal from "../modals/AddFolderModal.vue";
import NoteEditorModal from "../modals/NoteEditorModal.vue";
import { getFolderIcon, formatNoteTime } from "../../../helpers/notebookHelper";


const notebookStore = useNotebookStore();
const isFolderModalOpen = ref(false);
const isNoteModalOpen = ref(false);
const noteToEdit = ref(null);

onMounted(async () => {
  await notebookStore.fetchFolders();
  await notebookStore.fetchNotes();
});

function openNewNote() {
  noteToEdit.value = null;
  isNoteModalOpen.value = true;
}

function openEditNote(note) {
  noteToEdit.value = note;
  isNoteModalOpen.value = true;
}

function getActiveFolderIcon() {
  if (notebookStore.activeFolderId === "all") return "▣";
  const f = notebookStore.folders.find((x) => String(x.id) === String(notebookStore.activeFolderId));
  return f ? getFolderIcon(f.icon) : "📁";
}

function getFolderIconById(folderId) {
  if (!folderId) return "📁";
  const f = notebookStore.folders.find((x) => String(x.id) === String(folderId));
  return f ? f.icon : "📁";
}

function hasImage(content) {
  if (!content) return false;
  return /!\[.*?\]\(.*?\)/.test(content);
}

function cleanPreviewText(text) {
  if (!text) return "";
  return text.replace(/!\[.*?\]\(.*?\)/g, "🖼️ [Gambar] ").replace(/#+\s+/g, "").trim();
}
</script>

<template>
  <div class="w-full max-w-5xl mx-auto py-4 px-2">
    <div class="nix-glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-2xl border border-white/10 min-h-[580px]">
      <!-- Sidebar / Folder List -->
      <aside class="w-full md:w-64 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
        <div>
          <div class="mb-6">
            <h2 class="font-serif-moda text-2xl font-normal text-white tracking-wide">
              My Notebook
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              All your notes in one place
            </p>
          </div>

          <div class="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            <!-- All Notes Folder -->
            <button
              @click="notebookStore.setFolder('all')"
              class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all"
              :class="
                notebookStore.activeFolderId === 'all'
                  ? 'bg-white/15 text-white font-semibold shadow-inner'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              "
            >
              <div class="flex items-center gap-2.5">
                <span class="text-amber-400">▣</span>
                <span>All Notes</span>
              </div>
              <span class="text-[11px] text-slate-400 px-1.5 py-0.5 rounded-md bg-black/20">
                {{ notebookStore.totalNotes }}
              </span>
            </button>

            <!-- Custom Folders -->
            <div
              v-for="folder in notebookStore.folders"
              :key="folder.id"
              class="group flex items-center justify-between rounded-xl hover:bg-white/5 transition-all"
              :class="{
                'bg-white/15 font-semibold text-white': String(notebookStore.activeFolderId) === String(folder.id),
              }"
            >
              <button
                @click="notebookStore.setFolder(folder.id)"
                class="flex-1 flex items-center justify-between px-3.5 py-2.5 text-xs text-left"
                :class="
                  String(notebookStore.activeFolderId) === String(folder.id)
                    ? 'text-white font-semibold'
                    : 'text-slate-300 group-hover:text-white'
                "
              >
                <div class="flex items-center gap-2.5 truncate">
                  <span class="w-5 text-center text-xs font-mono shrink-0 text-amber-300">
                    {{ getFolderIcon(folder.icon) }}
                  </span>
                  <span class="truncate">{{ folder.name }}</span>
                </div>
                <span class="text-[11px] text-slate-400 px-1.5 py-0.5 rounded-md bg-black/20 ml-2">
                  {{ folder.note_count || 0 }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <button
          @click="isFolderModalOpen = true"
          class="mt-6 w-full py-2.5 px-4 rounded-xl border border-dashed border-white/20 hover:border-amber-400/50 text-xs font-medium text-slate-300 hover:text-amber-300 flex items-center justify-center gap-2 transition-all hover:bg-white/5"
        >
          <span>+</span> New Folder
        </button>
      </aside>

      <!-- Main Notes Area -->
      <section class="flex-1 flex flex-col justify-between">
        <div>
          <!-- Search & New Note Action -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div class="relative w-full sm:w-80">
              <input
                :value="notebookStore.searchQuery"
                @input="notebookStore.setSearch($event.target.value)"
                type="text"
                placeholder="Search notes..."
                class="w-full bg-black/30 border border-white/10 rounded-full pl-4 pr-10 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 transition-all"
              />
              <span class="absolute right-3.5 top-2.5 text-xs text-slate-400">⌕</span>
            </div>

            <button
              @click="openNewNote"
              class="w-full sm:w-auto px-5 py-2 rounded-full text-xs font-semibold bg-amber-800/80 hover:bg-amber-700 text-white shadow-lg shadow-amber-950/50 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>+</span> New Note
            </button>
          </div>

          <!-- Recent Notes Section -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span class="text-amber-400">{{ getActiveFolderIcon() }}</span>
                <span>Recent Notes ({{ notebookStore.activeFolderName }})</span>
              </h3>
            </div>

            <!-- Empty State -->
            <div
              v-if="notebookStore.filteredNotes.length === 0"
              class="py-16 text-center text-slate-400 text-xs italic"
            >
              {{ notebookStore.loading ? "Loading notes..." : "No notes found in this folder." }}
            </div>

            <!-- Notes List -->
            <div v-else class="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              <article
                v-for="note in notebookStore.filteredNotes"
                :key="note.id"
                class="group relative flex items-start justify-between gap-4 p-4 rounded-2xl bg-black/25 hover:bg-black/40 border border-white/5 hover:border-white/15 cursor-pointer transition-all duration-200"
                @click="openEditNote(note)"
              >
                <div class="flex items-start gap-4 overflow-hidden">
                  <div
                    class="w-10 h-10 rounded-xl bg-amber-900/30 border border-amber-600/30 flex items-center justify-center text-amber-300 text-base flex-shrink-0 group-hover:scale-105 transition-transform"
                  >
                    ☰
                  </div>

                  <div class="overflow-hidden">
                    <h4 class="text-sm font-semibold text-white group-hover:text-amber-200 transition-colors truncate">
                      {{ note.title }}
                    </h4>

                    <p class="text-[11px] text-amber-400/80 mt-0.5 mb-1 flex items-center gap-1.5 truncate">
                      <span>{{ getFolderIcon(note.folder_icon || getFolderIconById(note.folder_id)) }}</span>
                      <span>{{ note.folder_name || "General" }}</span>
                    </p>

                    <div class="flex items-center gap-1.5 mt-0.5">
                      <span
                        v-if="hasImage(note.content)"
                        class="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30"
                        title="Catatan memiliki gambar"
                      >
                        🖼️ Gambar
                      </span>
                      <p class="text-xs text-slate-300 line-clamp-1">
                        {{ cleanPreviewText(note.preview || note.content) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-end justify-between self-stretch flex-shrink-0">
                  <span class="text-[11px] text-slate-400 whitespace-nowrap">
                    {{ formatNoteTime(note.updated_at || note.created_at) }}
                  </span>

                  <button
                    @click.stop="notebookStore.removeNote(note.id)"
                    class="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 text-xs p-1 rounded transition-all"
                    title="Delete note"
                  >
                    Delete
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modals -->
    <AddFolderModal :is-open="isFolderModalOpen" @close="isFolderModalOpen = false" />
    <NoteEditorModal
      :is-open="isNoteModalOpen"
      :note-to-edit="noteToEdit"
      @close="isNoteModalOpen = false"
    />
  </div>
</template>
