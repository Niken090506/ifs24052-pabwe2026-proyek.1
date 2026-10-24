import { describe, it, expect, vi, beforeEach } from "vitest";
import todoApi from "./todoApi";
import apiHelper from "../../../helpers/apiHelper";

describe("todoApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should get todos successfully", async () => {
    const mockTodos = [{ id: 1, title: "Test Todo", completed: false }];
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, data: mockTodos }),
    });

    const result = await todoApi.getTodos();
    expect(result).toEqual(mockTodos);
  });

  it("should throw error if getTodos fails", async () => {
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: false, message: "Error" }),
    });

    await expect(todoApi.getTodos()).rejects.toThrow("Error");
  });

  it("should post new todo successfully", async () => {
    const newTodo = { id: 2, title: "New Task", completed: false };
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, data: newTodo }),
    });

    const result = await todoApi.postTodo("New Task");
    expect(result).toEqual(newTodo);
  });

  it("should throw error if postTodo fails", async () => {
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: false, message: "Title required" }),
    });

    await expect(todoApi.postTodo("")).rejects.toThrow("Title required");
  });

  it("should put update todo successfully", async () => {
    const updated = { id: 1, title: "Updated", completed: true };
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, data: updated }),
    });

    const result = await todoApi.putTodo(1, { completed: true });
    expect(result).toEqual(updated);
  });

  it("should delete todo successfully", async () => {
    vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
      json: async () => ({ success: true, message: "Deleted" }),
    });

    const result = await todoApi.deleteTodo(1);
    expect(result).toBe("Deleted");
  });
});
