import { nextTick } from "vue";

/**
 * Composable untuk menangani seluruh logika manipulasi dan formatting Markdown pada editor teks.
 * Memisahkan tanggung jawab formatting dari komponen NoteEditorModal.
 *
 * @param {import("vue").Ref<string>} contentRef - Ref reaktif yang menyimpan teks Markdown.
 * @param {import("vue").Ref<HTMLTextAreaElement|null>} textareaRef - Ref elemen DOM textarea.
 */
export function useMarkdownFormatter(contentRef, textareaRef) {
  /**
   * Mengambil posisi kursor dan teks yang sedang diblok/diseleksi.
   * @returns {{ start: number, end: number, text: string, el: HTMLTextAreaElement|null }}
   */
  function getSelectionInfo() {
    const el = textareaRef?.value || null;
    if (!el) {
      return { start: 0, end: 0, text: "", el: null };
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const text = (contentRef.value || "").substring(start, end);
    return { start, end, text, el };
  }

  /**
   * Menyisipkan prefix dan suffix format (seperti **bold**, *italic*, `code`, dll).
   * @param {string} prefix - Awalan markdown (misal "**")
   * @param {string} suffix - Akhiran markdown (misal "**")
   * @param {string} [placeholder="teks"] - Teks fallback jika tidak ada seleksi.
   */
  function insertFormatting(prefix, suffix, placeholder = "teks") {
    const { start, end, text, el } = getSelectionInfo();
    const current = contentRef.value || "";
    const selected = text || placeholder;
    const replacement = `${prefix}${selected}${suffix}`;

    contentRef.value =
      current.substring(0, start) + replacement + current.substring(end);

    nextTick(() => {
      if (el) {
        el.focus();
        const newCursor = start + prefix.length + selected.length;
        if (typeof el.setSelectionRange === "function") {
          el.setSelectionRange(newCursor, newCursor);
        }
      }
    });
  }

  /**
   * Menyisipkan heading markdown (# H1, ## H2, ### H3, dsb).
   * @param {number} level - Tingkat heading (1-6)
   */
  function insertHeading(level = 1) {
    const { start, end, el } = getSelectionInfo();
    const current = contentRef.value || "";
    const hashes = "#".repeat(Math.max(1, Math.min(6, level))) + " ";

    contentRef.value =
      current.substring(0, start) +
      `\n${hashes}Heading ${level}\n` +
      current.substring(end);

    nextTick(() => {
      if (el && typeof el.focus === "function") el.focus();
    });
  }

  /**
   * Menyisipkan format daftar (bullet list, numbered list, task list).
   * @param {"bullet"|"number"|"task"} type - Jenis list.
   */
  function insertList(type = "bullet") {
    const { start, end, el } = getSelectionInfo();
    const current = contentRef.value || "";
    let textToInsert = "\n- Item 1\n- Item 2\n- Item 3\n";

    if (type === "number") {
      textToInsert = "\n1. Item 1\n2. Item 2\n3. Item 3\n";
    } else if (type === "task") {
      textToInsert = "\n- [ ] Task yang harus dikerjakan\n- [x] Task yang sudah selesai\n";
    }

    contentRef.value =
      current.substring(0, start) + textToInsert + current.substring(end);

    nextTick(() => {
      if (el && typeof el.focus === "function") el.focus();
    });
  }

  /**
   * Menyisipkan tabel Markdown dengan jumlah baris dan kolom tertentu.
   * @param {number} [rows=3] - Jumlah baris data tabel.
   * @param {number} [cols=3] - Jumlah kolom tabel.
   */
  function insertTable(rows = 3, cols = 3) {
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
    const current = contentRef.value || "";

    contentRef.value =
      current.substring(0, start) + tableMd + current.substring(end);

    nextTick(() => {
      if (el && typeof el.focus === "function") el.focus();
    });
  }

  /**
   * Menyisipkan tautan (link) Markdown.
   * @param {string} [customUrl] - URL tautan (jika tidak disediakan, meminta via prompt).
   */
  function insertLink(customUrl) {
    let url = customUrl;
    if (url === undefined && typeof window !== "undefined" && typeof window.prompt === "function") {
      url = window.prompt("Masukkan URL tautan:", "https://");
    }
    if (!url) return;

    const { start, end, text, el } = getSelectionInfo();
    const label = text || "Tautan";
    const linkMd = `[${label}](${url})`;
    const current = contentRef.value || "";

    contentRef.value =
      current.substring(0, start) + linkMd + current.substring(end);

    nextTick(() => {
      if (el && typeof el.focus === "function") el.focus();
    });
  }

  /**
   * Menyisipkan blok kutipan (blockquote).
   */
  function insertQuote() {
    insertFormatting("\n> ", "\n", "Kutipan atau poin penting...");
  }

  /**
   * Menyisipkan code block dengan sintaks highlighting.
   * @param {string} [lang="javascript"] - Bahasa pemrograman.
   */
  function insertCodeBlock(lang = "javascript") {
    insertFormatting(`\n\`\`\`${lang}\n`, "\n```\n", "// Tulis kode di sini");
  }

  /**
   * Menyisipkan sintaks markdown gambar.
   * @param {string} mdImg - Markdown gambar (misal `![alt](url)`).
   */
  function insertImageMarkdown(mdImg) {
    if (!mdImg) return;
    const { start, end, el } = getSelectionInfo();
    const current = contentRef.value || "";

    contentRef.value =
      current.substring(0, start) + mdImg + current.substring(end);

    nextTick(() => {
      if (el && typeof el.focus === "function") el.focus();
    });
  }

  /**
   * Menghapus seluruh format markdown dari teks yang sedang diseleksi.
   */
  function clearFormatting() {
    const { start, end, text, el } = getSelectionInfo();
    if (!text) return;

    const cleaned = text
      .replace(/^#+\s+/gm, "")
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/~~(.*?)~~/g, "$1")
      .replace(/`{1,3}(.*?)`{1,3}/g, "$1")
      .replace(/^>\s+/gm, "")
      .replace(/^-\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "");

    const current = contentRef.value || "";
    contentRef.value =
      current.substring(0, start) + cleaned + current.substring(end);

    nextTick(() => {
      if (el && typeof el.focus === "function") el.focus();
    });
  }

  return {
    getSelectionInfo,
    insertFormatting,
    insertHeading,
    insertList,
    insertTable,
    insertLink,
    insertQuote,
    insertCodeBlock,
    insertImageMarkdown,
    clearFormatting,
  };
}

export default useMarkdownFormatter;
