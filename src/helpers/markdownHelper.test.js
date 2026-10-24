import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  parseMarkdownTables,
  renderMarkdownToHtml,
} from "./markdownHelper";

describe("markdownHelper", () => {
  describe("escapeHtml", () => {
    it("should return empty string for null, undefined, or empty values", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
      expect(escapeHtml("")).toBe("");
    });

    it("should escape &, <, and > characters safely", () => {
      const input = '<script>alert("XSS & attack")</script>';
      const result = escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert("XSS &amp; attack")&lt;/script&gt;');
    });
  });

  describe("renderMarkdownToHtml", () => {
    it("should return default placeholder when input is empty or whitespace", () => {
      const result = renderMarkdownToHtml("");
      expect(result).toContain("Belum ada konten catatan");

      const customPlaceholder = "<p>Catatan Kosong</p>";
      expect(renderMarkdownToHtml("   ", customPlaceholder)).toBe(customPlaceholder);
    });

    it("should render markdown headings (h1, h2, h3, h4)", () => {
      const md = "# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4";
      const html = renderMarkdownToHtml(md);

      expect(html).toContain('<h1 class="text-xl sm:text-2xl font-serif-moda font-normal text-amber-300 mt-5 mb-2 pb-1.5 border-b border-white/15">Heading 1</h1>');
      expect(html).toContain('<h2 class="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-white/10">Heading 2</h2>');
      expect(html).toContain('<h3 class="text-base font-bold text-amber-100 mt-3.5 mb-1.5">Heading 3</h3>');
      expect(html).toContain('<h4 class="text-sm font-bold text-slate-200 mt-3 mb-1 uppercase tracking-wider">Heading 4</h4>');
    });

    it("should render bold, italic, and strikethrough styling", () => {
      const md = "**Tebal** dan *Miring* serta ~~Coret~~";
      const html = renderMarkdownToHtml(md);

      expect(html).toContain("<strong>Tebal</strong>");
      expect(html).toContain("<em>Miring</em>");
      expect(html).toContain("<del class='text-slate-400'>Coret</del>");
    });

    it("should render inline code and fenced code blocks", () => {
      const md = "Gunakan `npm run dev` untuk menjalankan proyek.\n\n```js\nconsole.log('hello');\n```";
      const html = renderMarkdownToHtml(md);

      expect(html).toContain('<code class="px-1.5 py-0.5 rounded bg-black/50 text-amber-300 font-mono text-xs border border-white/10">npm run dev</code>');
      expect(html).toContain('<pre class="my-3 p-3.5 rounded-xl bg-black/60 border border-white/10 overflow-x-auto text-xs font-mono text-amber-200"><code>console.log(\'hello\');</code></pre>');
    });

    it("should render blockquotes", () => {
      const md = "> Catatan penting dari perkuliahan";
      const html = renderMarkdownToHtml(md);

      expect(html).toContain('<blockquote class="my-2.5 pl-3.5 border-l-2 border-amber-400/80 text-slate-300 italic bg-amber-500/5 py-1 rounded-r-lg">Catatan penting dari perkuliahan</blockquote>');
    });

    it("should render task list items", () => {
      const md = "- [x] Selesai membaca\n- [ ] Belum dikerjakan";
      const html = renderMarkdownToHtml(md);

      expect(html).toContain('☑');
      expect(html).toContain('line-through text-slate-400');
      expect(html).toContain('☐');
    });

    it("should render bullet and numbered lists", () => {
      const md = "- Item pertama\n- Item kedua\n1. Langkah satu\n2. Langkah dua";
      const html = renderMarkdownToHtml(md);

      expect(html).toContain('<li class="ml-5 list-disc text-slate-200 my-0.5">Item pertama</li>');
      expect(html).toContain('<li class="ml-5 list-decimal text-slate-200 my-0.5">Langkah satu</li>');
    });

    it("should render links and images", () => {
      const md = "![Foto](/images/photo.png)\n[Link Google](https://google.com)";
      const html = renderMarkdownToHtml(md);

      expect(html).toContain('<img src="/images/photo.png" alt="Foto"');
      expect(html).toContain('<a href="https://google.com" target="_blank" rel="noopener noreferrer"');
      expect(html).toContain("Link Google</a>");
    });

    it("should parse and render markdown tables properly", () => {
      const tableMd = `| Kolom 1 | Kolom 2 |
| --- | --- |
| Data 1 | Data 2 |`;
      const html = renderMarkdownToHtml(tableMd);

      expect(html).toContain("<table");
      expect(html).toContain("<th");
      expect(html).toContain("Kolom 1");
      expect(html).toContain("<td");
      expect(html).toContain("Data 1");
    });
  });

  describe("parseMarkdownTables", () => {
    it("should leave non-table lines untouched", () => {
      const lines = ["Paragraf biasa", "Baris kedua"];
      const output = parseMarkdownTables(lines);
      expect(output).toEqual(lines);
    });
  });
});
