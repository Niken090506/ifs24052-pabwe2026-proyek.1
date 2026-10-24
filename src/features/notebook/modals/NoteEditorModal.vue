<script setup>
import { ref, watch, computed, nextTick } from "vue";
import { useNotebookStore } from "../states/notebookStore";
import notebookApi from "../api/notebookApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderMarkdownToHtml } from "../../../helpers/markdownHelper";
import { getFolderIcon } from "../../../helpers/notebookHelper";

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

// Dropdown states
const showHeadingMenu = ref(false);
const showListMenu = ref(false);
const showTableMenu = ref(false);
const showImageModal = ref(false);

// Image input states
const imageSourceType = ref("upload"); // 'upload' or 'url'
const imageUrlInput = ref("");
const imageAltInput = ref("");
const uploadingImage = ref(false);
const fileInputRef = ref(null);

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
    closeAllMenus();
  },
  { immediate: true }
);

function closeAllMenus() {
  showHeadingMenu.value = false;
  showListMenu.value = false;
  showTableMenu.value = false;
}

// Cursor and text selection manipulation helper
function getSelectionInfo() {
  const el = textareaRef.value;
  if (!el) return { start: 0, end: 0, text: "" };
  const start = el.selectionStart || 0;
  const end = el.selectionEnd || 0;
  const text = content.value.substring(start, end);
  return { start, end, text, el };
}

function insertFormatting(prefix, suffix, placeholder = "teks") {
  const { start, end, text, el } = getSelectionInfo();
  const selected = text || placeholder;
  const replacement = `${prefix}${selected}${suffix}`;
  content.value =
    content.value.substring(0, start) +
    replacement +
    content.value.substring(end);

  nextTick(() => {
    if (el) {
      el.focus();
      const newCursor = start + prefix.length + selected.length;
      el.setSelectionRange(newCursor, newCursor);
    }
  });
}

function insertHeading(level) {
  closeAllMenus();
  const { start, end, el } = getSelectionInfo();
  const hashes = "#".repeat(level) + " ";
  content.value =
    content.value.substring(0, start) +
    `\n${hashes}Heading ${level}\n` +
    content.value.substring(end);

  nextTick(() => {
    if (el) el.focus();
  });
}

function insertList(type) {
  closeAllMenus();
  const { start, end, el } = getSelectionInfo();
  let textToInsert = "";
  if (type === "bullet") {
    textToInsert = "\n- Item 1\n- Item 2\n- Item 3\n";
  } else if (type === "number") {
    textToInsert = "\n1. Item 1\n2. Item 2\n3. Item 3\n";
  } else if (type === "task") {
    textToInsert = "\n- [ ] Task yang harus dikerjakan\n- [x] Task yang sudah selesai\n";
  }

  content.value =
    content.value.substring(0, start) +
    textToInsert +
    content.value.substring(end);

  nextTick(() => {
    if (el) el.focus();
  });
}

function insertTable(rows = 3, cols = 3) {
  closeAllMenus();
  let header = "|";
  let separator = "|";
  for (let c = 1; c <= cols; c++) {
    header += ` Kolom ${c} |`;
    separator += " --- |";
  }
  let body = "";
  for (let r = 1; r <= rows; r++) {
    body += "\n|";
    for (let c = 1; c <= cols; c++) {
      body += ` Data ${r},${c} |`;
    }
  }

  const tableMd = `\n${header}\n${separator}${body}\n`;
  const { start, end, el } = getSelectionInfo();
  content.value =
    content.value.substring(0, start) + tableMd + content.value.substring(end);

  nextTick(() => {
    if (el) el.focus();
  });
}

function insertLink() {
  const url = prompt("Masukkan URL tautan:", "https://");
  if (!url) return;
  const { start, end, text, el } = getSelectionInfo();
  const label = text || "Tautan";
  const linkMd = `[${label}](${url})`;
  content.value =
    content.value.substring(0, start) + linkMd + content.value.substring(end);

  nextTick(() => {
    if (el) el.focus();
  });
}

function insertQuote() {
  insertFormatting("\n> ", "\n", "Kutipan atau poin penting...");
}

function insertCodeBlock() {
  insertFormatting("\n```javascript\n", "\n```\n", "// Tulis kode di sini");
}

function clearFormatting() {
  const { start, end, text, el } = getSelectionInfo();
  if (!text) return;
  // Strip common markdown characters
  const cleaned = text
    .replace(/^#+\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^-\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "");

  content.value =
    content.value.substring(0, start) + cleaned + content.value.substring(end);

  nextTick(() => {
    if (el) el.focus();
  });
}

// Image handling
function openImageDialog() {
  closeAllMenus();
  showImageModal.value = true;
  imageAltInput.value = "";
  imageUrlInput.value = "";
}

async function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showErrorDialog("Pilih file gambar yang valid!");
    return;
  }

  uploadingImage.value = true;
  try {
    const url = await notebookApi.uploadNoteImage(file);
    const altText = imageAltInput.value.trim() || file.name.replace(/\.[^/.]+$/, "");
    const imgMd = `\n![${altText}](${url})\n`;
    const { start, end } = getSelectionInfo();
    content.value =
      content.value.substring(0, start) + imgMd + content.value.substring(end);
    showImageModal.value = false;
  } catch (err) {
    showErrorDialog(err.message || "Gagal mengunggah gambar");
  } finally {
    uploadingImage.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
}

function insertImageUrl() {
  if (!imageUrlInput.value.trim()) return;
  const altText = imageAltInput.value.trim() || "Gambar Catatan";
  const imgMd = `\n![${altText}](${imageUrlInput.value.trim()})\n`;
  const { start, end } = getSelectionInfo();
  content.value =
    content.value.substring(0, start) + imgMd + content.value.substring(end);
  showImageModal.value = false;
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
        const imgMd = `\n![${altText}](${url})\n`;
        const { start, end } = getSelectionInfo();
        content.value =
          content.value.substring(0, start) + imgMd + content.value.substring(end);
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

      <h2 class="text-lg sm:text-xl font-semibold mb-4 text-white">
        {{ noteToEdit ? "Edit Note" : "New Note" }}
      </h2>

      <!-- Top Row: Title & Folder Selection -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div class="md:col-span-2">
          <label class="block text-xs text-slate-300 mb-1 font-medium">Note Title</label>
          <input
            v-model="title"
            type="text"
            placeholder="e.g. Alstrudat bab 1"
            maxlength="100"
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

      <!-- Rich Formatting Toolbar (Matches user's screenshot design) -->
      <div class="relative bg-zinc-900/90 border border-white/10 rounded-xl p-1.5 mb-2 flex flex-wrap items-center gap-1 shadow-inner select-none">
        <!-- H1 ⌄ Heading Menu -->
        <div class="relative">
          <button
            type="button"
            @click="showHeadingMenu = !showHeadingMenu; showListMenu = false; showTableMenu = false"
            class="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-bold text-slate-100 flex items-center gap-1 transition-all"
            title="Heading style"
          >
            <span>H1</span>
            <span class="text-[9px] text-slate-400">⌄</span>
          </button>

          <div
            v-if="showHeadingMenu"
            class="absolute left-0 top-full mt-1 w-36 rounded-xl bg-zinc-900 border border-white/15 p-1 shadow-2xl z-50 flex flex-col space-y-0.5 text-xs text-slate-200"
          >
            <button type="button" @click="insertHeading(1)" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left font-bold text-amber-300">
              H1 Heading
            </button>
            <button type="button" @click="insertHeading(2)" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left font-semibold text-amber-200">
              H2 Heading
            </button>
            <button type="button" @click="insertHeading(3)" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left font-medium text-amber-100">
              H3 Heading
            </button>
            <button type="button" @click="insertHeading(4)" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left text-slate-300">
              H4 Heading
            </button>
          </div>
        </div>

        <!-- :: ⌄ List Menu -->
        <div class="relative">
          <button
            type="button"
            @click="showListMenu = !showListMenu; showHeadingMenu = false; showTableMenu = false"
            class="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-bold text-slate-100 flex items-center gap-1 transition-all"
            title="List formats"
          >
            <span class="text-sm leading-none">⋮≡</span>
            <span class="text-[9px] text-slate-400">⌄</span>
          </button>

          <div
            v-if="showListMenu"
            class="absolute left-0 top-full mt-1 w-40 rounded-xl bg-zinc-900 border border-white/15 p-1 shadow-2xl z-50 flex flex-col space-y-0.5 text-xs text-slate-200"
          >
            <button type="button" @click="insertList('bullet')" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2">
              <span>•</span> Bullet List
            </button>
            <button type="button" @click="insertList('number')" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2">
              <span>1.</span> Numbered List
            </button>
            <button type="button" @click="insertList('task')" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2 text-emerald-300">
              <span>☑</span> Task Checklist
            </button>
          </div>
        </div>

        <div class="w-px h-5 bg-white/10 mx-0.5"></div>

        <!-- B Bold -->
        <button
          type="button"
          @click="insertFormatting('**', '**', 'teks tebal')"
          class="w-8 h-8 rounded-lg hover:bg-white/10 font-bold text-xs text-white flex items-center justify-center transition-all"
          title="Tebal (Bold)"
        >
          B
        </button>

        <!-- I Italic -->
        <button
          type="button"
          @click="insertFormatting('*', '*', 'teks miring')"
          class="w-8 h-8 rounded-lg hover:bg-white/10 italic font-serif text-xs text-white flex items-center justify-center transition-all"
          title="Miring (Italic)"
        >
          I
        </button>

        <!-- S Strikethrough -->
        <button
          type="button"
          @click="insertFormatting('~~', '~~', 'teks coret')"
          class="w-8 h-8 rounded-lg hover:bg-white/10 line-through text-xs text-white flex items-center justify-center transition-all"
          title="Coret (Strikethrough)"
        >
          S
        </button>

        <div class="w-px h-5 bg-white/10 mx-0.5"></div>

        <!-- 🔗 Link -->
        <button
          type="button"
          @click="insertLink"
          class="w-8 h-8 rounded-lg hover:bg-white/10 text-xs flex items-center justify-center transition-all"
          title="Sisipkan Tautan (Link)"
        >
          🔗
        </button>

        <!-- 🖼️ Image Button (Fitur Gambar yang diminta) -->
        <button
          type="button"
          @click="openImageDialog"
          class="px-2.5 h-8 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
          title="Sisipkan Gambar (Unggah File / Tautan URL)"
        >
          <span class="text-sm">🖼️</span>
          <span class="text-xs">Gambar</span>
        </button>

        <!-- 田 ⌄ Table Dropdown -->
        <div class="relative">
          <button
            type="button"
            @click="showTableMenu = !showTableMenu; showHeadingMenu = false; showListMenu = false"
            class="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-xs font-bold text-slate-100 flex items-center gap-1 transition-all"
            title="Sisipkan Tabel"
          >
            <span class="text-sm">田</span>
            <span class="text-[9px] text-slate-400">⌄</span>
          </button>

          <div
            v-if="showTableMenu"
            class="absolute left-0 top-full mt-1 w-36 rounded-xl bg-zinc-900 border border-white/15 p-1 shadow-2xl z-50 flex flex-col space-y-0.5 text-xs text-slate-200"
          >
            <button type="button" @click="insertTable(2, 2)" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left">
              Tabel 2 × 2
            </button>
            <button type="button" @click="insertTable(3, 3)" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left">
              Tabel 3 × 3
            </button>
            <button type="button" @click="insertTable(4, 4)" class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left">
              Tabel 4 × 4
            </button>
          </div>
        </div>

        <!-- ❝ Quote -->
        <button
          type="button"
          @click="insertQuote"
          class="w-8 h-8 rounded-lg hover:bg-white/10 text-xs flex items-center justify-center text-slate-200 transition-all"
          title="Kutipan (Quote)"
        >
          ❝
        </button>

        <!-- <> Code block -->
        <button
          type="button"
          @click="insertCodeBlock"
          class="w-8 h-8 rounded-lg hover:bg-white/10 font-mono text-xs flex items-center justify-center text-slate-200 transition-all"
          title="Code Block"
        >
          &lt;&gt;
        </button>

        <div class="w-px h-5 bg-white/10 mx-0.5"></div>

        <!-- Ab ⌫ Clear formatting -->
        <button
          type="button"
          @click="clearFormatting"
          class="px-2 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-all"
          title="Hapus format (Clear formatting)"
        >
          <span class="font-mono text-xs">Ab</span>
          <span class="text-[10px]">⌫</span>
        </button>

        <!-- Right Side: Tab Switcher (Tulis / Live Preview) -->
        <div class="ml-auto flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            @click="activeTab = 'write'"
            class="px-3 py-1 rounded-lg transition-all"
            :class="
              activeTab === 'write'
                ? 'bg-amber-800 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            "
          >
            Tulis
          </button>
          <button
            type="button"
            @click="activeTab = 'preview'"
            class="px-3 py-1 rounded-lg transition-all"
            :class="
              activeTab === 'preview'
                ? 'bg-amber-800 text-white font-bold shadow-sm'
                : 'text-slate-300 hover:text-white'
            "
          >
            Preview
          </button>
        </div>
      </div>

      <!-- Editor Body: Write Mode or Preview Mode -->
      <div class="flex-1 flex flex-col mb-4 min-h-[260px] relative">
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

    <!-- Image Modal Dialog -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      @click.self="showImageModal = false"
    >
      <div class="relative w-full max-w-md rounded-2xl nix-glass p-6 text-slate-100 shadow-2xl border border-white/15">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
          <h3 class="text-sm font-bold text-white flex items-center gap-2">
            <span>🖼️</span> Sisipkan Gambar ke Catatan
          </h3>
          <button
            type="button"
            @click="showImageModal = false"
            class="text-slate-400 hover:text-white font-bold p-1 leading-none text-lg"
          >
            ×
          </button>
        </div>

        <!-- Image Source Selector -->
        <div class="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            @click="imageSourceType = 'upload'"
            class="py-2 text-xs font-semibold rounded-xl border transition-all"
            :class="
              imageSourceType === 'upload'
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                : 'bg-black/20 border-white/10 text-slate-300 hover:border-white/30'
            "
          >
            📁 Unggah dari Komputer
          </button>
          <button
            type="button"
            @click="imageSourceType = 'url'"
            class="py-2 text-xs font-semibold rounded-xl border transition-all"
            :class="
              imageSourceType === 'url'
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
                : 'bg-black/20 border-white/10 text-slate-300 hover:border-white/30'
            "
          >
            🔗 Tautan Gambar (URL)
          </button>
        </div>

        <!-- Description Alt Input -->
        <div class="mb-3">
          <label class="block text-xs text-slate-300 mb-1">Deskripsi / Keterangan Gambar (Alt Text)</label>
          <input
            v-model="imageAltInput"
            type="text"
            placeholder="Contoh: Diagram Alur Basis Data"
            class="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        <!-- Upload File Option -->
        <div v-if="imageSourceType === 'upload'" class="mb-5">
          <label class="block text-xs text-slate-300 mb-1.5">Pilih File Gambar (Maks 5MB)</label>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            @change="handleFileUpload"
            class="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-800 file:text-white hover:file:bg-amber-700 file:cursor-pointer"
          />
          <p v-if="uploadingImage" class="text-xs text-amber-300 mt-2 flex items-center gap-1.5">
            <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Mengunggah gambar ke server...
          </p>
        </div>

        <!-- URL Option -->
        <div v-else class="mb-5">
          <label class="block text-xs text-slate-300 mb-1">URL Gambar Langsung</label>
          <input
            v-model="imageUrlInput"
            type="url"
            placeholder="https://example.com/diagram.png"
            class="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/50"
          />
          <button
            type="button"
            @click="insertImageUrl"
            :disabled="!imageUrlInput.trim()"
            class="mt-3 w-full py-2.5 rounded-xl text-xs font-bold bg-amber-800 hover:bg-amber-700 text-white disabled:opacity-50 transition-all shadow-md"
          >
            Sisipkan Gambar
          </button>
        </div>

        <div class="flex justify-end pt-2 border-t border-white/10">
          <button
            type="button"
            @click="showImageModal = false"
            class="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
