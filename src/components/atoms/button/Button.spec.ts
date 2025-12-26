import { describe, expect, it } from "vitest";

import Button from "./Button.vue";
import { mount } from "@vue/test-utils";

describe("Button", () => {
  it("renders slot content", () => {
    const wrapper = mount(Button, {
      slots: { default: "My Button" },
    });

    expect(wrapper.text()).toContain("My Button");
  });

  it("applies primary variant by default", () => {
    const wrapper = mount(Button, {
      slots: { default: "Button" },
    });

    expect(wrapper.classes()).toContain("primary");
  });

  it("applies secondary variant class when provided", () => {
    const wrapper = mount(Button, {
      props: { variant: "secondary" },
      slots: { default: "Button" },
    });

    expect(wrapper.classes()).toContain("secondary");
  });

  it("emits click when enabled", async () => {
    const wrapper = mount(Button, {
      props: { disabled: false },
      slots: { default: "Button" },
    });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("click")).toBeTruthy();
    expect(wrapper.emitted("click")?.length).toBe(1);
  });

  it("does not emit click when disabled", async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: "Button" },
    });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("click")).toBeFalsy();
    expect(wrapper.get("button").attributes("disabled")).toBeDefined();
  });
});
