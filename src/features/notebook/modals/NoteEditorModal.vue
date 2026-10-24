<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { useNotebookStore } from "../states/notebookStore";
import notebookApi from "../api/notebookApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderMarkdownToHtml } from "../../../helpers/markdownHelper";
import { getFolderIcon } from "../../../helpers/notebookHelper";
import { useMarkdownFormatter } from "../composables/useMarkdownFormatter";
import NoteEditorToolbar from "../components/NoteEditorToolbar.vue";
import NoteImageInsertModal from "./NoteImageInsertModal.vue";

const props = defineProps({
  isOpen: Boolean,
  noteToEdit: Object,
});

const emit = defineEmits(["close"]);

const notebookStore = useNotebookStore();
const title = ref("");
const content = ref("");
const folderId = ref("");
const activeTab = ref("write"); // 'write' or 'preview'
const textareaRef = ref(null);
const showImageModal = ref(false);
const uploadingImage = ref(false);

watch(
  () => props.noteToEdit,
  (val) => {
    if (val) {
      title.value = val.title || "";
      content.value = val.content || "";
      folderId.value = val.folder_id || "";
    } else {
      title.value = "";
      content.value = "";
      folderId.value =
        notebookStore.activeFolderId !== "all" ? notebookStore.activeFolderId : "";
    }
    activeTab.value = "write";
  },
  { immediate: true }
);

// Markdown formatting and cursor manipulation extracted to composable
const {
  insertFormatting,
  insertHeading,
  insertList,
  insertTable,
  insertLink,
  insertQuote,
  insertCodeBlock,
  insertImageMarkdown,
  clearFormatting,
} = useMarkdownFormatter(content, textareaRef);

function handleInsertImageMd(mdImg) {
  insertImageMarkdown(mdImg);
}

// Drag & drop image directly to textarea
function handleTextareaDrop(e) {
  const files = e.dataTransfer?.files;
  if (files && files.length > 0 && files[0].type.startsWith("image/")) {
    e.preventDefault();
    const file = files[0];
    uploadingImage.value = true;
    notebookApi
      .uploadNoteImage(file)
      .then((url) => {
        const altText = file.name.replace(/\.[^/.]+$/, "");
        handleInsertImageMd(`\n![${altText}](${url})\n`);
      })
      .catch((err) => {
        showErrorDialog(err.message || "Gagal mengunggah gambar");
      })
      .finally(() => {
        uploadingImage.value = false;
      });
  }
}

// Markdown Live Renderer via shared markdownHelper utility
const renderedHtml = computed(() => {
  return renderMarkdownToHtml(content.value);
});

async function handleSave() {
  if (!title.value.trim()) return;

  if (props.noteToEdit && props.noteToEdit.id) {
    await notebookStore.updateNote(
      props.noteToEdit.id,
      title.value.trim(),
      content.value,
      folderId.value ? Number(folderId.value) : null
    );
  } else {
    await notebookStore.createNote(
      title.value.trim(),
      content.value,
      folderId.value ? Number(folderId.value) : null
    );
  }

  emit("close");
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 transition-all"
    @click.self="emit('close')"
  >
    <div
      class="relative w-full max-w-3xl rounded-2xl nix-glass p-5 sm:p-7 text-slate-100 shadow-2xl border border-white/10 flex flex-col max-h-[92vh] animate-in fade-in duration-200"
    >
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold p-1 leading-none"
      >
        ×
      </button>

      <!-- Header Section -->
      <div class="mb-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-amber-400/80 mb-1">
          Notebook Studio
        </p>
        <h2 class="text-xl font-semibold text-white">
          {{ noteToEdit ? "Edit Catatan" : "Buat Catatan Baru" }}
        </h2>
      </div>

      <!-- Form Inputs: Title & Folder -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div class="sm:col-span-2">
          <label class="block text-xs text-slate-300 mb-1 font-medium">Judul Catatan</label>
          <input
            v-model="title"
            type="text"
            placeholder="Masukkan judul catatan studi Anda..."
            autofocus
            class="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <div>
          <label class="block text-xs text-slate-300 mb-1 font-medium">Notebook Folder</label>
          <select
            v-model="folderId"
            class="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400/50"
          >
            <option value="">📁 (No Folder)</option>
            <option
              v-for="folder in notebookStore.folders"
              :key="folder.id"
              :value="folder.id"
            >
              {{ getFolderIcon(folder.icon) }} {{ folder.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Rich Formatting Toolbar Subcomponent -->
      <NoteEditorToolbar
        :active-tab="activeTab"
        @format="insertFormatting"
        @heading="insertHeading"
        @list="insertList"
        @table="insertTable"
        @link="insertLink"
        @quote="insertQuote"
        @code="insertCodeBlock"
        @clear-format="clearFormatting"
        @open-image-dialog="showImageModal = true"
        @update:active-tab="activeTab = $event"
      />

      <!-- Content Area: Tabs Container -->
      <div class="flex-1 flex flex-col min-h-[300px] sm:min-h-[340px] mb-4 overflow-hidden">
        <!-- Write Mode -->
        <div v-show="activeTab === 'write'" class="flex-1 flex flex-col relative">
          <textarea
            ref="textareaRef"
            v-model="content"
            @drop="handleTextareaDrop"
            placeholder="Tulis catatan studi Anda di sini... Anda bisa mengetik langsung, menggunakan toolbar di atas, menyisipkan gambar, tabel, checklist, atau drag-and-drop file gambar langsung ke sini."
            class="w-full flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50 resize-none leading-relaxed transition-all"
          ></textarea>
          <div class="absolute bottom-2.5 right-3 text-[11px] text-slate-400 pointer-events-none select-none">
            {{ content.length }} karakter | Mendukung Markdown & Gambar
          </div>
        </div>

        <!-- Live Preview Mode -->
        <div
          v-show="activeTab === 'preview'"
          class="flex-1 bg-black/40 border border-white/10 rounded-2xl p-5 overflow-y-auto max-h-[360px] text-slate-100 leading-relaxed text-sm select-text"
          v-html="renderedHtml"
        ></div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-between pt-3 border-t border-white/10">
        <div class="text-xs text-slate-400 hidden sm:block">
          💡 Tips: Anda dapat langsung men-drag & drop file gambar ke area pengetikan.
        </div>
        <div class="flex items-center gap-3 ml-auto">
          <button
            type="button"
            @click="emit('close')"
            class="px-5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            @click="handleSave"
            :disabled="!title.trim()"
            class="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-900/40 transition-all"
          >
            Simpan Catatan
          </button>
        </div>
      </div>
    </div>

    <!-- Image Insert Modal Subcomponent -->
    <NoteImageInsertModal
      :is-open="showImageModal"
      @close="showImageModal = false"
      @insert="handleInsertImageMd"
    />
  </div>
</template>
