import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  validatePassword,
  validateRequiredText,
  validateImageFile,
} from "./validationHelper";

describe("frontend validationHelper", () => {
  describe("isValidEmail", () => {
    it("should return true for valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("niken@delcom.org")).toBe(true);
    });

    it("should return false for invalid emails", () => {
      expect(isValidEmail("plainaddress")).toBe(false);
      expect(isValidEmail("missing@domain")).toBe(false);
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should return invalid when password is empty or null", () => {
      expect(validatePassword("").isValid).toBe(false);
      expect(validatePassword(null).isValid).toBe(false);
    });

    it("should return invalid when password is shorter than minLength", () => {
      const res = validatePassword("12345", 6);
      expect(res.isValid).toBe(false);
      expect(res.message).toContain("minimal harus terdiri dari 6 karakter");
    });

    it("should return valid for passwords satisfying minimum length", () => {
      const res = validatePassword("securePass123", 6);
      expect(res.isValid).toBe(true);
    });
  });

  describe("validateRequiredText", () => {
    it("should reject empty or whitespace-only text", () => {
      const res = validateRequiredText("   ", "Nama Folder", 50);
      expect(res.isValid).toBe(false);
      expect(res.message).toContain("Nama Folder wajib diisi");
    });

    it("should reject text exceeding maximum length", () => {
      const longText = "a".repeat(55);
      const res = validateRequiredText(longText, "Nama", 50);
      expect(res.isValid).toBe(false);
      expect(res.message).toContain("maksimal terdiri dari 50 karakter");
    });

    it("should accept valid text", () => {
      const res = validateRequiredText("Belajar Vue 3", "Judul", 50);
      expect(res.isValid).toBe(true);
    });
  });

  describe("validateImageFile", () => {
    it("should throw error if file is missing", () => {
      expect(() => validateImageFile(null)).toThrow("Pilih berkas gambar");
    });

    it("should throw error if file is not an image", () => {
      const file = { type: "application/pdf", size: 1000 };
      expect(() => validateImageFile(file)).toThrow("harus berupa format gambar");
    });

    it("should throw error if file exceeds max size in MB", () => {
      const largeFile = { type: "image/png", size: 6 * 1024 * 1024 };
      expect(() => validateImageFile(largeFile, 5)).toThrow("melebihi batas maksimal 5MB");
    });

    it("should pass for valid image file", () => {
      const validFile = { type: "image/jpeg", size: 1024 * 100 };
      expect(validateImageFile(validFile, 5)).toBe(true);
    });
  });
});
