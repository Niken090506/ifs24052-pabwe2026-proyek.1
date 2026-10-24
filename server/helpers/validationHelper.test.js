import { describe, it, expect } from "vitest";
import { sanitizeText, isValidEmail, parseId } from "./validationHelper.js";

describe("backend validationHelper", () => {
  describe("sanitizeText", () => {
    it("should return empty string for non-string values", () => {
      expect(sanitizeText(null)).toBe("");
      expect(sanitizeText(undefined)).toBe("");
      expect(sanitizeText(123)).toBe("");
    });

    it("should strip < and > and trim whitespace", () => {
      const dirty = "  <script>alert('hack')</script> Hello World!  ";
      const cleaned = sanitizeText(dirty);
      expect(cleaned).toBe("scriptalert('hack')/script Hello World!");
      expect(cleaned.startsWith(" ")).toBe(false);
      expect(cleaned.endsWith(" ")).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("should return true for valid email formats", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("niken@delcom.org")).toBe(true);
      expect(isValidEmail("student.2026@sub.domain.co")).toBe(true);
    });

    it("should return false for invalid emails", () => {
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe("parseId", () => {
    it("should parse valid positive integer IDs", () => {
      expect(parseId("1")).toBe(1);
      expect(parseId("42")).toBe(42);
      expect(parseId(99)).toBe(99);
    });

    it("should return null for invalid, negative, decimal, or NaN IDs", () => {
      expect(parseId("0")).toBeNull();
      expect(parseId("-5")).toBeNull();
      expect(parseId("3.14")).toBeNull();
      expect(parseId("abc")).toBeNull();
      expect(parseId(null)).toBeNull();
      expect(parseId(undefined)).toBeNull();
    });
  });
});
