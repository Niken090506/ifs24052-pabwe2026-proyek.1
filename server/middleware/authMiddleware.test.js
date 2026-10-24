import { describe, it, expect, vi } from "vitest";
import { requireAuth, optionalAuth } from "./authMiddleware.js";
import * as authHelper from "../authHelper.js";

describe("authMiddleware", () => {
  it("should return 401 when getAuthUser returns null in requireAuth", () => {
    vi.spyOn(authHelper, "getAuthUser").mockReturnValue(null);

    const req = { headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Akses ditolak"),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("should attach user to req and call next() when valid user in requireAuth", () => {
    const mockUser = { id: 1, name: "Niken", email: "niken@delcom.org" };
    vi.spyOn(authHelper, "getAuthUser").mockReturnValue(mockUser);

    const req = { headers: { authorization: "Bearer valid-token" } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("should attach user to req in optionalAuth without blocking when null", () => {
    vi.spyOn(authHelper, "getAuthUser").mockReturnValue(null);

    const req = { headers: {} };
    const res = {};
    const next = vi.fn();

    optionalAuth(req, res, next);

    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalled();
  });
});
