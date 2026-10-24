import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useFocusStore } from "./focusStore";

describe("focusStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it("should initialize with 45 minutes default", () => {
    const store = useFocusStore();
    expect(store.selectedPreset).toBe(45);
    expect(store.remainingSeconds).toBe(45 * 60);
    expect(store.formattedTime).toBe("45:00");
    expect(store.buttonText).toBe("Start Focus");
  });

  it("should change preset correctly", () => {
    const store = useFocusStore();
    store.setPreset(25);
    expect(store.selectedPreset).toBe(25);
    expect(store.remainingSeconds).toBe(25 * 60);
    expect(store.formattedTime).toBe("25:00");
  });

  it("should toggle timer start and pause", () => {
    const store = useFocusStore();
    store.toggleTimer();
    expect(store.isRunning).toBe(true);
    expect(store.buttonText).toBe("Pause");

    store.toggleTimer();
    expect(store.isRunning).toBe(false);
  });

  it("should toggle mute state", () => {
    const store = useFocusStore();
    expect(store.isMuted).toBe(false);
    store.toggleMute();
    expect(store.isMuted).toBe(true);
  });

  it("should manage fullscreen state", () => {
    const store = useFocusStore();
    expect(store.isFullscreen).toBe(false);
    store.setIsFullscreen(true);
    expect(store.isFullscreen).toBe(true);
    store.setIsFullscreen(false);
    expect(store.isFullscreen).toBe(false);
  });

  it("should toggle showTodos and showAmbient visibility", () => {
    const store = useFocusStore();
    expect(store.showTodos).toBe(true);
    expect(store.showAmbient).toBe(true);

    store.toggleShowTodos();
    expect(store.showTodos).toBe(false);
    store.toggleShowTodos();
    expect(store.showTodos).toBe(true);

    store.toggleShowAmbient();
    expect(store.showAmbient).toBe(false);
    store.toggleShowAmbient();
    expect(store.showAmbient).toBe(true);
  });
});
