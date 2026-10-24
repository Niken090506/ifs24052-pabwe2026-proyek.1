import { describe, it, expect, beforeEach, vi } from "vitest";
import apiHelper from "./apiHelper";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should get and set access token correctly", () => {
    expect(apiHelper.getAccessToken()).toBeNull();
    apiHelper.putAccessToken("dummy-token");
    expect(apiHelper.getAccessToken()).toBe("dummy-token");
    apiHelper.putAccessToken("");
    expect(apiHelper.getAccessToken()).toBeNull();
  });

  it("should fetch data without query and append Authorization header when token exists", async () => {
    apiHelper.putAccessToken("test-token");
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    global.fetch = mockFetch;

    await apiHelper.fetchData("http://localhost:8765/api/v1/users/", {
      method: "GET",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8765/api/v1/users",
      expect.objectContaining({
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
        },
      })
    );
  });

  it("should handle url with query parameters and without trailing slash correctly", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200 });
    global.fetch = mockFetch;

    await apiHelper.fetchData("http://localhost:8765/api/v1/aucations?is_closed=1", {
      method: "GET",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8765/api/v1/aucations?is_closed=1",
      expect.objectContaining({
        method: "GET",
        headers: {},
      })
    );
  });

  it("should extract data from successful API response using handleResponse", async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: { id: 1, name: "Niken" },
      }),
    };

    const data = await apiHelper.handleResponse(mockResponse);
    expect(data).toEqual({ id: 1, name: "Niken" });
  });

  it("should throw error when API response indicates failure", async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockResolvedValue({
        success: false,
        message: "Email atau kata sandi salah",
      }),
    };

    await expect(apiHelper.handleResponse(mockResponse)).rejects.toThrow(
      "Email atau kata sandi salah"
    );
  });

  it("should throw default message if JSON parsing fails", async () => {
    const mockResponse = {
      ok: false,
      json: vi.fn().mockRejectedValue(new Error("Invalid JSON")),
    };

    await expect(
      apiHelper.handleResponse(mockResponse, "Gagal memproses server")
    ).rejects.toThrow("Gagal memproses server");
  });
});

