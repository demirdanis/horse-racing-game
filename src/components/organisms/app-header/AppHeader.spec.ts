import { describe, expect, it } from "vitest";

import AppHeader from "./AppHeader.vue";
import type { AppHeaderProps } from "./AppHeader.types";
import { mount } from "@vue/test-utils";

const ButtonStub = {
  name: "Button",
  props: ["variant", "disabled"],
  emits: ["click"],
  template: `
    <button
      class="btn-stub"
      :data-variant="variant"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `,
};

function mountHeader(props?: Partial<AppHeaderProps>) {
  return mount(AppHeader, {
    props: {
      title: "Horse Racing",
      state: "ready",
      generateDisabled: false,
      resetDisabled: false,
      startPauseDisabled: false,
      ...(props ?? {}),
    },
    global: {
      stubs: {
        Button: ButtonStub,
      },
    },
  });
}

describe("AppHeader", () => {
  it("renders title", () => {
    const wrapper = mountHeader({ title: "My Title" });
    expect(wrapper.find(".title").text()).toBe("My Title");
  });

  it("renders three buttons with correct variants", () => {
    const wrapper = mountHeader();

    const btns = wrapper.findAll("button.btn-stub");
    expect(btns.length).toBe(3);

    expect(btns[0].attributes("data-variant")).toBe("secondary");
    expect(btns[1].attributes("data-variant")).toBe("secondary");
    expect(btns[2].attributes("data-variant")).toBe("primary");
  });

  it('shows "Start" when state is not running', () => {
    const wrapper = mountHeader({ state: "ready" });
    const btns = wrapper.findAll("button.btn-stub");
    expect(btns[2].text()).toContain("Start");
  });

  it('shows "Resume" when state is paused', async () => {
    const wrapper = mountHeader({ state: "paused" });
    const btns = wrapper.findAll("button.btn-stub");
    expect(btns[2].text()).toContain("Resume");

    await btns[2].trigger("click");
    expect(wrapper.emitted("start")).toBeTruthy();
    expect(wrapper.emitted("pause")).toBeFalsy();
  });

  it('shows "Pause" when state is running', async () => {
    const wrapper = mountHeader({ state: "running" });
    const btns = wrapper.findAll("button.btn-stub");
    expect(btns[2].text()).toContain("Pause");

    await wrapper.setProps({ state: "ready" });
    expect(btns[2].text()).toContain("Start");
  });

  it("emits generate when Generate button clicked and not disabled", async () => {
    const wrapper = mountHeader({ generateDisabled: false });

    const btns = wrapper.findAll("button.btn-stub");
    await btns[0].trigger("click");

    expect(wrapper.emitted("generate")).toBeTruthy();
    expect(wrapper.emitted("generate")?.length).toBe(1);
  });

  it("does not emit generate when generateDisabled is true", async () => {
    const wrapper = mountHeader({ generateDisabled: true });

    const btns = wrapper.findAll("button.btn-stub");
    await btns[0].trigger("click");

    expect(wrapper.emitted("generate")).toBeFalsy();
  });

  it("emits reset when Reset button clicked and not disabled", async () => {
    const wrapper = mountHeader({ resetDisabled: false });

    const btns = wrapper.findAll("button.btn-stub");
    await btns[1].trigger("click");

    expect(wrapper.emitted("reset")).toBeTruthy();
    expect(wrapper.emitted("reset")?.length).toBe(1);
  });

  it("does not emit reset when resetDisabled is true", async () => {
    const wrapper = mountHeader({ resetDisabled: true });

    const btns = wrapper.findAll("button.btn-stub");
    await btns[1].trigger("click");

    expect(wrapper.emitted("reset")).toBeFalsy();
  });

  it("emits start when Start/Pause button clicked while not running and not disabled", async () => {
    const wrapper = mountHeader({ state: "ready", startPauseDisabled: false });

    const btns = wrapper.findAll("button.btn-stub");
    await btns[2].trigger("click");

    expect(wrapper.emitted("start")).toBeTruthy();
    expect(wrapper.emitted("start")?.length).toBe(1);
    expect(wrapper.emitted("pause")).toBeFalsy();
  });

  it("emits pause when Start/Pause button clicked while running and not disabled", async () => {
    const wrapper = mountHeader({
      state: "running",
      startPauseDisabled: false,
    });

    const btns = wrapper.findAll("button.btn-stub");
    await btns[2].trigger("click");

    expect(wrapper.emitted("pause")).toBeTruthy();
    expect(wrapper.emitted("pause")?.length).toBe(1);
    expect(wrapper.emitted("start")).toBeFalsy();
  });

  it("does not emit start/pause when startPauseDisabled is true", async () => {
    const wrapper = mountHeader({ state: "running", startPauseDisabled: true });

    const btns = wrapper.findAll("button.btn-stub");
    await btns[2].trigger("click");

    expect(wrapper.emitted("start")).toBeFalsy();
    expect(wrapper.emitted("pause")).toBeFalsy();
  });

  it("passes disabled props down to buttons", async () => {
    const wrapper = mountHeader({
      generateDisabled: true,
      resetDisabled: true,
      startPauseDisabled: true,
    });

    const btns = wrapper.findAll("button.btn-stub");
    expect(btns[0].attributes("disabled")).toBeDefined();
    expect(btns[1].attributes("disabled")).toBeDefined();
    expect(btns[2].attributes("disabled")).toBeDefined();

    await wrapper.setProps({
      generateDisabled: false,
      resetDisabled: false,
      startPauseDisabled: false,
    });

    expect(btns[0].attributes("disabled")).toBeUndefined();
    expect(btns[1].attributes("disabled")).toBeUndefined();
    expect(btns[2].attributes("disabled")).toBeUndefined();
  });
});
