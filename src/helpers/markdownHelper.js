/**
 * Modul utility untuk parsing dan rendering Markdown ke format HTML interaktif.
 * Mendukung heading, blockquote, task list, bullet list, table, styling teks, gambar, dan blok kode.
 */

/**
 * Melakukan sanitasi karakter HTML dasar untuk mencegah serangan XSS.
 * @param {string} str - Teks mentah yang akan disanitasi.
 * @returns {string} Teks yang telah diescape.
 */
export function escapeHtml(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Mengubah baris-baris Markdown bertipe tabel menjadi HTML <table> berkelas Tailwind yang elegan.
 * @param {string[]} lines - Kumpulan baris teks markdown.
 * @returns {string[]} Kumpulan baris dengan blok tabel yang sudah ditransformasi ke HTML.
 */
export function parseMarkdownTables(lines) {
  let inTable = false;
  let tableHtml = "";
  const outputLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|") && line.endsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableHtml = '<div class="my-4 overflow-x-auto rounded-xl border border-white/10 shadow-lg"><table class="w-full text-left text-xs border-collapse">';
        const cells = line.split("|").slice(1, -1);
        tableHtml += '<tr class="bg-amber-600/20 text-amber-200 font-bold border-b border-white/10">';
        cells.forEach((c) => {
          tableHtml += `<th class="p-2.5 border-r border-white/10 last:border-r-0">${c.trim()}</th>`;
        });
        tableHtml += "</tr>";
      } else if (line.includes("---")) {
        // Baris pemisah header tabel, lewati
      } else {
        const cells = line.split("|").slice(1, -1);
        tableHtml += '<tr class="border-b border-white/5 hover:bg-white/5">';
        cells.forEach((c) => {
          tableHtml += `<td class="p-2.5 border-r border-white/10 last:border-r-0 text-slate-200">${c.trim()}</td>`;
        });
        tableHtml += "</tr>";
      }
    } else {
      if (inTable) {
        tableHtml += "</table></div>";
        outputLines.push(tableHtml);
        inTable = false;
        tableHtml = "";
      }
      outputLines.push(line);
    }
  }

  if (inTable) {
    tableHtml += "</table></div>";
    outputLines.push(tableHtml);
  }

  return outputLines;
}

/**
 * Merender string Markdown menjadi representasi HTML siap pakai untuk preview catatan.
 * @param {string} markdown - Konten markdown mentah.
 * @param {string} [placeholder] - Teks fallback ketika konten catatan masih kosong.
 * @returns {string} String HTML hasil render.
 */
export function renderMarkdownToHtml(markdown, placeholder) {
  const defaultPlaceholder =
    "<p class='text-slate-400 italic text-sm'>Belum ada konten catatan. Gunakan tab 'Tulis' untuk mulai membuat catatan...</p>";

  if (!markdown || !markdown.trim()) {
    return placeholder || defaultPlaceholder;
  }

  // 1. Sanitasi HTML mentah
  let text = escapeHtml(markdown);

  // 2. Blok kode multi-baris: ```lang \n code \n ```
  text = text.replace(/```([a-z0-9]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
    return `<pre class="my-3 p-3.5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto text-xs font-mono text-amber-200"><code>${code.trim()}</code></pre>`;
  });

  // 3. Blok kode inline: `code`
  text = text.replace(
    /`([^`]+)`/g,
    `<code class="px-1.5 py-0.5 rounded bg-black/50 text-amber-300 font-mono text-xs border border-white/10">$1</code>`
  );

  // 4. Gambar: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    return `<figure class="my-4 text-center">
      <img src="${url}" alt="${alt}" class="max-w-full rounded-2xl border border-white/10 shadow-xl object-cover max-h-80 mx-auto hover:scale-[1.01] transition-transform" />
      ${alt ? `<figcaption class="text-center text-[11px] text-slate-400 mt-1.5 italic">${alt}</figcaption>` : ""}
    </figure>`;
  });

  // 5. Tautan (Links): [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener noreferrer" class="text-amber-300 hover:text-amber-200 underline font-medium">$1</a>`
  );

  // 6. Penekanan teks: Bold, Italic, Strikethrough
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  text = text.replace(/~~(.*?)~~/g, "<del class='text-slate-400'>$1</del>");

  // 7. Heading (H1-H4)
  text = text.replace(/^#### (.*$)/gim, '<h4 class="text-sm font-bold text-slate-200 mt-3 mb-1 uppercase tracking-wider">$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-amber-100 mt-3.5 mb-1.5">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-xl sm:text-2xl font-serif-moda font-normal text-amber-300 mt-5 mb-2 pb-1.5 border-b border-white/15">$1</h1>');

  // 8. Kutipan (Blockquotes)
  text = text.replace(
    /^(?:>|&gt;)\s?(.*$)/gim,
    '<blockquote class="my-2.5 pl-3.5 border-l-2 border-amber-400/80 text-slate-300 italic bg-amber-500/5 py-1 rounded-r-lg">$1</blockquote>'
  );


  // 9. Task lists (Checklist)
  text = text.replace(
    /^- \[x\] (.*$)/gim,
    '<div class="flex items-center gap-2 text-emerald-400 my-1"><span class="text-sm">☑</span> <span class="line-through text-slate-400">$1</span></div>'
  );
  text = text.replace(
    /^- \[ \] (.*$)/gim,
    '<div class="flex items-center gap-2 text-slate-200 my-1"><span class="text-sm">☐</span> <span>$1</span></div>'
  );

  // 10. Daftar berpoin & bernomor
  text = text.replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-slate-200 my-0.5">$1</li>');
  text = text.replace(/^\d+\. (.*$)/gim, '<li class="ml-5 list-decimal text-slate-200 my-0.5">$1</li>');

  // 11. Parsing Tabel Markdown
  const lines = text.split("\n");
  const processedLines = parseMarkdownTables(lines);

  text = processedLines.join("<br />");
  text = text.replace(/(<br \/>\s*){2,}/g, "<br /><br />");

  return text;
}

export default {
  escapeHtml,
  parseMarkdownTables,
  renderMarkdownToHtml,
};
