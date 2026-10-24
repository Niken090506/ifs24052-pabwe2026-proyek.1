<script setup>
import { ref } from "vue";

const props = defineProps({
  activeTab: {
    type: String,
    default: "write",
  },
});

const emit = defineEmits([
  "format",
  "heading",
  "list",
  "link",
  "open-image-dialog",
  "table",
  "quote",
  "code",
  "clear-format",
  "update:activeTab",
]);

const showHeadingMenu = ref(false);
const showListMenu = ref(false);
const showTableMenu = ref(false);

function closeAllMenus() {
  showHeadingMenu.value = false;
  showListMenu.value = false;
  showTableMenu.value = false;
}

function handleHeading(level) {
  emit("heading", level);
  closeAllMenus();
}

function handleList(type) {
  emit("list", type);
  closeAllMenus();
}

function handleTable(rows, cols) {
  emit("table", rows, cols);
  closeAllMenus();
}
</script>

<template>
  <div
    class="relative bg-zinc-900/90 border border-white/10 rounded-xl p-1.5 mb-2 flex flex-wrap items-center gap-1 shadow-inner select-none"
  >
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
        <button
          type="button"
          @click="handleHeading(1)"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left font-bold text-amber-300"
        >
          H1 Heading
        </button>
        <button
          type="button"
          @click="handleHeading(2)"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left font-semibold text-amber-200"
        >
          H2 Heading
        </button>
        <button
          type="button"
          @click="handleHeading(3)"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left font-medium text-amber-100"
        >
          H3 Heading
        </button>
        <button
          type="button"
          @click="handleHeading(4)"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left text-slate-300"
        >
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
        <button
          type="button"
          @click="handleList('bullet')"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2"
        >
          <span>•</span> Bullet List
        </button>
        <button
          type="button"
          @click="handleList('number')"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2"
        >
          <span>1.</span> Numbered List
        </button>
        <button
          type="button"
          @click="handleList('task')"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left flex items-center gap-2 text-emerald-300"
        >
          <span>☑</span> Task Checklist
        </button>
      </div>
    </div>

    <div class="w-px h-5 bg-white/10 mx-0.5"></div>

    <!-- B Bold -->
    <button
      type="button"
      @click="emit('format', '**', '**', 'teks tebal')"
      class="w-8 h-8 rounded-lg hover:bg-white/10 font-bold text-xs text-white flex items-center justify-center transition-all"
      title="Tebal (Bold)"
    >
      B
    </button>

    <!-- I Italic -->
    <button
      type="button"
      @click="emit('format', '*', '*', 'teks miring')"
      class="w-8 h-8 rounded-lg hover:bg-white/10 italic font-serif text-xs text-white flex items-center justify-center transition-all"
      title="Miring (Italic)"
    >
      I
    </button>

    <!-- S Strikethrough -->
    <button
      type="button"
      @click="emit('format', '~~', '~~', 'teks coret')"
      class="w-8 h-8 rounded-lg hover:bg-white/10 line-through text-xs text-white flex items-center justify-center transition-all"
      title="Coret (Strikethrough)"
    >
      S
    </button>

    <div class="w-px h-5 bg-white/10 mx-0.5"></div>

    <!-- 🔗 Link -->
    <button
      type="button"
      @click="emit('link')"
      class="w-8 h-8 rounded-lg hover:bg-white/10 text-xs flex items-center justify-center transition-all"
      title="Sisipkan Tautan (Link)"
    >
      🔗
    </button>

    <!-- 🖼️ Image Button -->
    <button
      type="button"
      @click="emit('open-image-dialog')"
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
        <button
          type="button"
          @click="handleTable(2, 2)"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left"
        >
          Tabel 2 × 2
        </button>
        <button
          type="button"
          @click="handleTable(3, 3)"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left"
        >
          Tabel 3 × 3
        </button>
        <button
          type="button"
          @click="handleTable(4, 4)"
          class="px-3 py-1.5 rounded-lg hover:bg-white/10 text-left"
        >
          Tabel 4 × 4
        </button>
      </div>
    </div>

    <!-- ❝ Quote -->
    <button
      type="button"
      @click="emit('quote')"
      class="w-8 h-8 rounded-lg hover:bg-white/10 text-xs flex items-center justify-center text-slate-200 transition-all"
      title="Kutipan (Quote)"
    >
      ❝
    </button>

    <!-- <> Code block -->
    <button
      type="button"
      @click="emit('code')"
      class="w-8 h-8 rounded-lg hover:bg-white/10 font-mono text-xs flex items-center justify-center text-slate-200 transition-all"
      title="Code Block"
    >
      &lt;&gt;
    </button>

    <div class="w-px h-5 bg-white/10 mx-0.5"></div>

    <!-- Ab ⌫ Clear formatting -->
    <button
      type="button"
      @click="emit('clear-format')"
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
        @click="emit('update:activeTab', 'write')"
        class="px-3 py-1 rounded-lg font-medium transition-all"
        :class="
          activeTab === 'write'
            ? 'bg-amber-600/30 text-amber-200 border border-amber-400/40 shadow-sm'
            : 'text-slate-400 hover:text-white'
        "
      >
        Tulis
      </button>
      <button
        type="button"
        @click="emit('update:activeTab', 'preview')"
        class="px-3 py-1 rounded-lg font-medium transition-all"
        :class="
          activeTab === 'preview'
            ? 'bg-amber-600/30 text-amber-200 border border-amber-400/40 shadow-sm'
            : 'text-slate-400 hover:text-white'
        "
      >
        Live Preview
      </button>
    </div>
  </div>
</template>
