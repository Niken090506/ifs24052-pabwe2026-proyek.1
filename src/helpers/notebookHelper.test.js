import { describe, it, expect } from "vitest";
import { getFolderIcon, hasMarkdownImage, FOLDER_ICON_MAP } from "./notebookHelper";

describe("notebookHelper", () => {
  describe("getFolderIcon", () => {
    it("should return default folder icon 📁 when icon is null, undefined, or empty", () => {
      expect(getFolderIcon(null)).toBe("📁");
      expect(getFolderIcon(undefined)).toBe("📁");
      expect(getFolderIcon("")).toBe("📁");
    });

    it("should return mapped icon for known icon names", () => {
      expect(getFolderIcon("code")).toBe("</>");
      expect(getFolderIcon("palette")).toBe("🎨");
      expect(getFolderIcon("database")).toBe("🗄️");
      expect(getFolderIcon("book")).toBe("📖");
    });

    it("should return the icon itself if not in map", () => {
      expect(getFolderIcon("🚀")).toBe("🚀");
      expect(getFolderIcon("custom")).toBe("custom");
    });
  });

  describe("hasMarkdownImage", () => {
    it("should return false for empty or non-string content", () => {
      expect(hasMarkdownImage("")).toBe(false);
      expect(hasMarkdownImage(null)).toBe(false);
      expect(hasMarkdownImage(undefined)).toBe(false);
    });

    it("should return false for regular text without image syntax", () => {
      expect(hasMarkdownImage("Ini catatan biasa tanpa gambar")).toBe(false);
      expect(hasMarkdownImage("[Link biasa](https://google.com)")).toBe(false);
    });

    it("should return true when content has markdown image syntax", () => {
      expect(hasMarkdownImage("Lihat diagram ini: ![Diagram](/images/flow.png)")).toBe(true);
    });
  });
});
