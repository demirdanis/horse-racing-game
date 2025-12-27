import { describe, expect, it } from "vitest";

import Horse from "./Horse.vue";
import { mount } from "@vue/test-utils";

describe("Horse", () => {
  it("renders svg", () => {
    const wrapper = mount(Horse);
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("default state is ready", () => {
    const wrapper = mount(Horse);
    expect(wrapper.classes()).toContain("is-ready");
  });

  it("applies running class when state=running", () => {
    const wrapper = mount(Horse, {
      props: { state: "running" },
    });
    expect(wrapper.classes()).toContain("is-running");
  });

  it("applies won class when state=won", () => {
    const wrapper = mount(Horse, {
      props: { state: "won" },
    });
    expect(wrapper.classes()).toContain("is-won");
  });

  it("clamps condition 1..100 and sets CSS var", () => {
    const wrapper = mount(Horse, {
      props: { state: "running", condition: 999 },
    });

    const style = wrapper.attributes("style") ?? "";
    // condition 999 => clamp 100 => duration should be around "550ms"
    expect(style).toMatch(/--run-dur:\s*550ms/);
  });

  it("uses provided color as css var", () => {
    const wrapper = mount(Horse, {
      props: { color: "#FF0000" },
    });

    const style = wrapper.attributes("style") ?? "";
    expect(style).toMatch(/--horse-color:\s*#FF0000/);
  });

  it("emits click", async () => {
    const wrapper = mount(Horse);
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
    expect(wrapper.emitted("click")?.length).toBe(1);
  });
});
