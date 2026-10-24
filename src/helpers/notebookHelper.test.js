import { describe, it, expect } from "vitest";
import {
  getFolderIcon,
  hasMarkdownImage,
  formatNoteTime,
  FOLDER_ICON_MAP,
  AVAILABLE_FOLDER_ICONS,
} from "./notebookHelper";

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

  describe("AVAILABLE_FOLDER_ICONS", () => {
    it("should contain standard available icons with id and symbol", () => {
      expect(Array.isArray(AVAILABLE_FOLDER_ICONS)).toBe(true);
      expect(AVAILABLE_FOLDER_ICONS.length).toBeGreaterThanOrEqual(6);
      expect(AVAILABLE_FOLDER_ICONS[0]).toHaveProperty("id");
      expect(AVAILABLE_FOLDER_ICONS[0]).toHaveProperty("symbol");
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

  describe("formatNoteTime", () => {
    it("should return 'Today' when dateStr is falsy or invalid", () => {
      expect(formatNoteTime(null)).toBe("Today");
      expect(formatNoteTime("")).toBe("Today");
      expect(formatNoteTime("invalid-date-string")).toBe("Today");
    });

    it("should format valid ISO date string to localized time string", () => {
      const formatted = formatNoteTime("2026-10-24T14:30:00Z");
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(0);
    });
  });
});
