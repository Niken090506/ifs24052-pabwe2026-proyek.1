/**
 * Peta representasi ikon folder buku catatan ke emotikon/simbol visual.
 */
export const FOLDER_ICON_MAP = {
  code: "</>",
  palette: "🎨",
  doc: "📄",
  math: "+/-",
  chart: "📈",
  graph: "⚡",
  database: "🗄️",
  globe: "🌐",
  user: "👤",
  book: "📖",
  folder: "📁",
};

/**
 * Mengonversi key nama ikon folder menjadi emoji representatif.
 * @param {string} [icon] - Key ikon folder (contoh: "code", "database").
 * @returns {string} Emoji representatif folder.
 */
export function getFolderIcon(icon) {
  if (!icon) return "📁";
  return FOLDER_ICON_MAP[icon] || icon;
}

/**
 * Mengecek apakah teks catatan mengandung format sintaks gambar Markdown.
 * @param {string} [content] - Teks isi catatan.
 * @returns {boolean} True jika mengandung gambar.
 */
export function hasMarkdownImage(content) {
  if (!content || typeof content !== "string") return false;
  return /!\[.*?\]\(.*?\)/.test(content);
}

export default {
  FOLDER_ICON_MAP,
  getFolderIcon,
  hasMarkdownImage,
};
