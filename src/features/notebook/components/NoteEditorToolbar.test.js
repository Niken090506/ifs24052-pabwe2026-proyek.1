import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NoteEditorToolbar from "./NoteEditorToolbar.vue";

describe("NoteEditorToolbar", () => {
  it("should render formatting buttons and emit format events", async () => {
    const wrapper = mount(NoteEditorToolbar, {
      props: { activeTab: "write" },
    });

    // Bold button
    const boldBtn = wrapper.find("button[title='Tebal (Bold)']");
    expect(boldBtn.exists()).toBe(true);
    await boldBtn.trigger("click");

    expect(wrapper.emitted("format")).toBeTruthy();
    expect(wrapper.emitted("format")[0]).toEqual(["**", "**", "teks tebal"]);
  });

  it("should toggle tabs between write and preview", async () => {
    const wrapper = mount(NoteEditorToolbar, {
      props: { activeTab: "write" },
    });

    const previewTabBtn = wrapper.findAll("button").find((b) => b.text().includes("Live Preview"));
    expect(previewTabBtn).toBeDefined();
    await previewTabBtn.trigger("click");

    expect(wrapper.emitted("update:activeTab")).toBeTruthy();
    expect(wrapper.emitted("update:activeTab")[0]).toEqual(["preview"]);
  });

  it("should emit open-image-dialog when image button clicked", async () => {
    const wrapper = mount(NoteEditorToolbar, {
      props: { activeTab: "write" },
    });

    const imgBtn = wrapper.find("button[title*='Sisipkan Gambar']");
    expect(imgBtn.exists()).toBe(true);
    await imgBtn.trigger("click");

    expect(wrapper.emitted("open-image-dialog")).toBeTruthy();
  });
});
