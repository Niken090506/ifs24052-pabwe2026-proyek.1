<script setup>
import { ref } from "vue";
import notebookApi from "../api/notebookApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "insert"]);

const imageSourceType = ref("upload"); // 'upload' or 'url'
const imageUrlInput = ref("");
const imageAltInput = ref("");
const uploadingImage = ref(false);
const fileInputRef = ref(null);

function handleClose() {
  imageUrlInput.value = "";
  imageAltInput.value = "";
  uploadingImage.value = false;
  emit("close");
}

function insertImageUrl() {
  if (!imageUrlInput.value.trim()) return;
  const alt = imageAltInput.value.trim() || "Gambar Catatan";
  const url = imageUrlInput.value.trim();
  const mdImg = `\n![${alt}](${url})\n`;

  emit("insert", mdImg);
  handleClose();
}

function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showErrorDialog("Ukuran gambar melebihi 5MB. Silakan pilih berkas yang lebih kecil.");
    return;
  }

  uploadingImage.value = true;
  notebookApi
    .uploadNoteImage(file)
    .then((url) => {
      const alt = imageAltInput.value.trim() || file.name.replace(/\.[^/.]+$/, "");
      const imgMd = `\n![${alt}](${url})\n`;
      emit("insert", imgMd);
      handleClose();
    })
    .catch((err) => {
      showErrorDialog(err.message || "Gagal mengunggah gambar");
    })
    .finally(() => {
      uploadingImage.value = false;
      if (fileInputRef.value) fileInputRef.value.value = "";
    });
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    @click.self="handleClose"
  >
    <div
      class="relative w-full max-w-md rounded-2xl nix-glass p-6 text-slate-100 shadow-2xl border border-white/15"
    >
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span>🖼️</span> Sisipkan Gambar ke Catatan
        </h3>
        <button
          type="button"
          @click="handleClose"
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
          @click="handleClose"
          class="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 transition-all"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>
