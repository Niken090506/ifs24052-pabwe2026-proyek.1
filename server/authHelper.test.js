import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createSecureToken,
  verifySecureToken,
} from "./authHelper.js";

describe("server authHelper", () => {
  describe("hashPassword & verifyPassword", () => {
    it("should generate salted hash with separator for valid password", () => {
      const password = "SuperSecretPassword123!";
      const hashed = hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).toContain(":");
      const [salt, hash] = hashed.split(":");
      expect(salt.length).toBe(32); // 16 bytes hex
      expect(hash.length).toBe(128); // 64 bytes hex
    });

    it("should successfully verify correct password with salted hash", () => {
      const password = "MySecurePassword2026";
      const hashed = hashPassword(password);

      expect(verifyPassword(password, hashed)).toBe(true);
    });

    it("should reject incorrect password with salted hash", () => {
      const password = "MySecurePassword2026";
      const hashed = hashPassword(password);

      expect(verifyPassword("WrongPassword", hashed)).toBe(false);
    });

    it("should safely verify legacy plaintext password", () => {
      expect(verifyPassword("password123", "password123")).toBe(true);
      expect(verifyPassword("wrongpass", "password123")).toBe(false);
    });

    it("should return false for null, empty, or undefined input", () => {
      expect(verifyPassword("", "password123")).toBe(false);
      expect(verifyPassword(null, "password123")).toBe(false);
      expect(verifyPassword("password123", null)).toBe(false);
      expect(verifyPassword(undefined, undefined)).toBe(false);
    });
  });

  describe("createSecureToken & verifySecureToken", () => {
    it("should generate a valid HMAC-signed Base64 token", () => {
      const user = { id: 1, email: "niken@delcom.org" };
      const token = createSecureToken(user);

      expect(typeof token).toBe("string");
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      expect(decoded).toContain("::");
      expect(decoded).toContain("niken@delcom.org");
    });

    it("should successfully verify an authentic signed token", () => {
      const user = { id: 42, email: "test@delcom.org" };
      const token = createSecureToken(user);

      const verified = verifySecureToken(token);
      expect(verified).not.toBeNull();
      expect(verified.userId).toBe("42");
      expect(verified.email).toBe("test@delcom.org");
    });

    it("should reject tampered token with altered payload or signature", () => {
      const user = { id: 1, email: "user@delcom.org" };
      const validToken = createSecureToken(user);
      const decoded = Buffer.from(validToken, "base64").toString("utf-8");

      // Attempt to tamper user ID to admin (id: 999)
      const [payload, signature] = decoded.split("::");
      const tamperedDecoded = `999:admin@delcom.org:1700000000::${signature}`;
      const tamperedToken = Buffer.from(tamperedDecoded).toString("base64");

      const verified = verifySecureToken(tamperedToken);
      expect(verified).toBeNull();
    });

    it("should return null for invalid base64 or empty token", () => {
      expect(verifySecureToken("")).toBeNull();
      expect(verifySecureToken(null)).toBeNull();
      expect(verifySecureToken("!!!not-valid-base64&&&")).toBeNull();
    });
  });
});
