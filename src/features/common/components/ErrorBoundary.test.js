import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import ErrorBoundary from "./ErrorBoundary.vue";

describe("ErrorBoundary", () => {
  it("renders slot content when no error occurs", () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div id="normal-content">Halo Dunia</div>',
      },
    });

    expect(wrapper.find("#normal-content").exists()).toBe(true);
    expect(wrapper.text()).toContain("Halo Dunia");
    expect(wrapper.vm.hasError).toBe(false);
  });

  it("captures error from throwing child component and recovers on retry", async () => {
    let shouldThrow = true;
    const ProblemChild = defineComponent({
      name: "ProblemChild",
      setup() {
        return () => {
          if (shouldThrow) {
            throw new Error("Simulasi crash pada komponen");
          }
          return h("div", { id: "recovered" }, "Pulih kembali");
        };
      },
    });

    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: () => h(ProblemChild),
      },
    });

    await nextTick();

    expect(wrapper.vm.hasError).toBe(true);
    expect(wrapper.text()).toContain("Terjadi Kendala pada Tampilan");
    expect(wrapper.text()).toContain("Simulasi crash pada komponen");

    // Reset error after problem is resolved
    shouldThrow = false;
    wrapper.vm.resetError();
    await nextTick();
    expect(wrapper.vm.hasError).toBe(false);
    expect(wrapper.text()).toContain("Pulih kembali");
  });

  it("emits error-captured event with error context", async () => {
    const ProblemChild = defineComponent({
      name: "ProblemChild",
      setup() {
        return () => {
          throw new Error("Error detail");
        };
      },
    });

    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: () => h(ProblemChild),
      },
    });

    await nextTick();
    expect(wrapper.emitted("error-captured")).toBeTruthy();
    expect(wrapper.emitted("error-captured")[0][0].error.message).toBe("Error detail");
  });
});
