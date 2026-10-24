import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTodosStore } from "./todosStore";
import todoApi from "../api/todoApi";

describe("todosStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("should fetch todos and update state", async () => {
    const store = useTodosStore();
    const mockList = [{ id: 1, title: "Test", completed: false }];
    vi.spyOn(todoApi, "getTodos").mockResolvedValue(mockList);

    await store.fetchTodos();
    expect(store.todos).toEqual(mockList);
    expect(store.loading).toBe(false);
  });

  it("should add todo to state", async () => {
    const store = useTodosStore();
    const mockTodo = { id: 2, title: "Study", completed: false };
    vi.spyOn(todoApi, "postTodo").mockResolvedValue(mockTodo);

    await store.addTodo("Study");
    expect(store.todos[0]).toEqual(mockTodo);
  });

  it("should toggle todo completed status", async () => {
    const store = useTodosStore();
    const mockTodo = { id: 1, title: "Read", completed: false };
    store.todos = [mockTodo];
    vi.spyOn(todoApi, "putTodo").mockResolvedValue({ ...mockTodo, completed: true });

    await store.toggleTodo(mockTodo);
    expect(mockTodo.completed).toBe(true);
  });

  it("should remove todo from state", async () => {
    const store = useTodosStore();
    store.todos = [{ id: 1, title: "Task 1", completed: false }];
    vi.spyOn(todoApi, "deleteTodo").mockResolvedValue("Deleted");

    await store.removeTodo(1);
    expect(store.todos.length).toBe(0);
  });
});
