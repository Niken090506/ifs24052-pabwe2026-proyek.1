import { describe, it, expect, vi, beforeEach } from "vitest";
import notebookApi from "./notebookApi";
import apiHelper from "../../../helpers/apiHelper";

describe("notebookApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should get folders successfully", async () => {
    const mockData = { totalNotes: 5, folders: [{ id: 1, name: "Alstrudat" }] };
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, data: mockData }),
    });

    const result = await notebookApi.getFolders();
    expect(result).toEqual(mockData);
  });

  it("should post folder successfully", async () => {
    const mockFolder = { id: 2, name: "Web Dev" };
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, data: mockFolder }),
    });

    const result = await notebookApi.postFolder("Web Dev", "code", "desc");
    expect(result).toEqual(mockFolder);
  });

  it("should get notes with query params", async () => {
    const mockNotes = [{ id: 1, title: "Note 1", content: "Content 1" }];
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, data: mockNotes }),
    });

    const result = await notebookApi.getNotes(1, "query");
    expect(result).toEqual(mockNotes);
  });

  it("should post note successfully", async () => {
    const mockNote = { id: 10, title: "New Note", content: "Markdown" };
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, data: mockNote }),
    });

    const result = await notebookApi.postNote("New Note", "Markdown", 1);
    expect(result).toEqual(mockNote);
  });

  it("should delete note successfully", async () => {
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, message: "Deleted" }),
    });

    const result = await notebookApi.deleteNote(1);
    expect(result).toBe("Deleted");
  });
});
