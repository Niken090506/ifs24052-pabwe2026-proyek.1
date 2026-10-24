import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadImageFile } from "./uploadHelper";
import apiHelper from "./apiHelper";

describe("uploadHelper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should reject non-image files before network call", async () => {
    const fakeFile = { type: "text/plain", size: 500 };
    await expect(uploadImageFile("/test", fakeFile)).rejects.toThrow("harus berupa format gambar");
  });

  it("should successfully build FormData and upload valid file", async () => {
    const validFile = new File(["dummy content"], "picture.png", { type: "image/png" });
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({
        success: true,
        data: { url: "/uploads/picture-123.png" },
      }),
    });

    const data = await uploadImageFile("/notes/upload-image", validFile, "image", 5);
    expect(data).toEqual({ url: "/uploads/picture-123.png" });
  });
});
