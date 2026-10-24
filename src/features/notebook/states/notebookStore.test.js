import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useNotebookStore } from "./notebookStore";
import notebookApi from "../api/notebookApi";

describe("notebookStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("should fetch folders and total notes", async () => {
    const store = useNotebookStore();
    vi.spyOn(notebookApi, "getFolders").mockResolvedValue({
      totalNotes: 3,
      folders: [{ id: 1, name: "Basdat" }],
    });

    await store.fetchFolders();
    expect(store.totalNotes).toBe(3);
    expect(store.folders.length).toBe(1);
  });

  it("should fetch notes and filter properly", async () => {
    const store = useNotebookStore();
    const mockNotes = [
      { id: 1, title: "SQL Basics", content: "Select query" },
      { id: 2, title: "Vue Pinia", content: "State management" },
    ];
    vi.spyOn(notebookApi, "getNotes").mockResolvedValue(mockNotes);

    await store.fetchNotes();
    expect(store.notes).toEqual(mockNotes);

    store.searchQuery = "SQL";
    expect(store.filteredNotes.length).toBe(1);
    expect(store.filteredNotes[0].title).toBe("SQL Basics");
  });

  it("should create folder and add to state", async () => {
    const store = useNotebookStore();
    const newF = { id: 10, name: "New Folder", note_count: 0 };
    vi.spyOn(notebookApi, "postFolder").mockResolvedValue(newF);

    const res = await store.createFolder("New Folder");
    expect(res).toEqual(newF);
    expect(store.folders).toContainEqual(newF);
  });

  it("should create note and increment total count", async () => {
    const store = useNotebookStore();
    const newN = { id: 5, title: "Note 5", content: "Content" };
    vi.spyOn(notebookApi, "postNote").mockResolvedValue(newN);

    await store.createNote("Note 5", "Content", null);
    expect(store.notes[0]).toEqual(newN);
    expect(store.totalNotes).toBe(1);
  });
});
