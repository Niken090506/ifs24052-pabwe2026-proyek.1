import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useMarkdownFormatter } from "./useMarkdownFormatter";

describe("useMarkdownFormatter", () => {
  let contentRef;
  let textareaRef;
  let mockEl;

  beforeEach(() => {
    contentRef = ref("");
    mockEl = {
      selectionStart: 0,
      selectionEnd: 0,
      focus: vi.fn(),
      setSelectionRange: vi.fn(),
    };
    textareaRef = ref(mockEl);
  });

  it("handles null textareaRef gracefully", () => {
    const nullRef = ref(null);
    const formatter = useMarkdownFormatter(contentRef, nullRef);
    const info = formatter.getSelectionInfo();
    expect(info).toEqual({ start: 0, end: 0, text: "", el: null });
  });

  it("inserts bold formatting on selected text", async () => {
    contentRef.value = "Halo dunia";
    mockEl.selectionStart = 5;
    mockEl.selectionEnd = 10;

    const formatter = useMarkdownFormatter(contentRef, textareaRef);
    formatter.insertFormatting("**", "**", "teks");

    expect(contentRef.value).toBe("Halo **dunia**");
  });

  it("inserts formatting with placeholder when no text is selected", async () => {
    contentRef.value = "Halo ";
    mockEl.selectionStart = 5;
    mockEl.selectionEnd = 5;

    const formatter = useMarkdownFormatter(contentRef, textareaRef);
    formatter.insertFormatting("*", "*", "miring");

    expect(contentRef.value).toBe("Halo *miring*");
  });

  it("inserts headings with proper hash count", () => {
    contentRef.value = "Catatan";
    mockEl.selectionStart = 7;
    mockEl.selectionEnd = 7;

    const formatter = useMarkdownFormatter(contentRef, textareaRef);
    formatter.insertHeading(2);

    expect(contentRef.value).toContain("\n## Heading 2\n");
  });

  it("inserts lists correctly (bullet, number, task)", () => {
    const formatter = useMarkdownFormatter(contentRef, textareaRef);

    formatter.insertList("bullet");
    expect(contentRef.value).toContain("- Item 1");

    contentRef.value = "";
    formatter.insertList("number");
    expect(contentRef.value).toContain("1. Item 1");

    contentRef.value = "";
    formatter.insertList("task");
    expect(contentRef.value).toContain("- [ ] Task yang harus dikerjakan");
  });

  it("inserts markdown table with specified rows and columns", () => {
    const formatter = useMarkdownFormatter(contentRef, textareaRef);
    formatter.insertTable(2, 2);

    expect(contentRef.value).toContain("| Kolom 1 | Kolom 2 |");
    expect(contentRef.value).toContain("| --- | --- |");
    expect(contentRef.value).toContain("| Data 1,1 | Data 1,2 |");
  });

  it("inserts link with custom URL or prompt", () => {
    contentRef.value = "Klik ini";
    mockEl.selectionStart = 5;
    mockEl.selectionEnd = 8;

    const formatter = useMarkdownFormatter(contentRef, textareaRef);
    formatter.insertLink("https://example.com");

    expect(contentRef.value).toBe("Klik [ini](https://example.com)");
  });

  it("inserts quote and code block", () => {
    const formatter = useMarkdownFormatter(contentRef, textareaRef);
    formatter.insertQuote();
    expect(contentRef.value).toContain("> Kutipan atau poin penting...");

    contentRef.value = "";
    formatter.insertCodeBlock("python");
    expect(contentRef.value).toContain("```python\n// Tulis kode di sini\n```");
  });

  it("inserts image markdown directly", () => {
    const formatter = useMarkdownFormatter(contentRef, textareaRef);
    formatter.insertImageMarkdown("\n![foto](/uploads/foto.png)\n");
    expect(contentRef.value).toContain("![foto](/uploads/foto.png)");
  });

  it("clears formatting from markdown formatted text", () => {
    contentRef.value = "**Teks tebal** dan *miring*";
    mockEl.selectionStart = 0;
    mockEl.selectionEnd = contentRef.value.length;

    const formatter = useMarkdownFormatter(contentRef, textareaRef);
    formatter.clearFormatting();

    expect(contentRef.value).toBe("Teks tebal dan miring");
  });
});
