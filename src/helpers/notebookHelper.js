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
 * Daftar ikon folder yang dapat dipilih pengguna pada modal pembuatan folder.
 */
export const AVAILABLE_FOLDER_ICONS = [
  { id: "code", symbol: "</>" },
  { id: "palette", symbol: "🎨" },
  { id: "doc", symbol: "📄" },
  { id: "math", symbol: "+/-" },
  { id: "chart", symbol: "📈" },
  { id: "graph", symbol: "⚡" },
  { id: "database", symbol: "🗄️" },
  { id: "book", symbol: "📖" },
];

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

/**
 * Memformat string tanggal/waktu catatan menjadi jam lokal ringkas.
 * @param {string|Date} [dateStr] - String tanggal atau objek Date.
 * @returns {string} Jam terformat (contoh: "3:45 PM") atau fallback "Today".
 */
export function formatNoteTime(dateStr) {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Today";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default {
  FOLDER_ICON_MAP,
  AVAILABLE_FOLDER_ICONS,
  getFolderIcon,
  hasMarkdownImage,
  formatNoteTime,
};
