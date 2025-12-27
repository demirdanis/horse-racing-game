import { describe, expect, it } from "vitest";

import RaceTrack from "./Track.vue";
import { mount } from "@vue/test-utils";

describe("RaceTrack", () => {
  it("renders slot content", () => {
    const wrapper = mount(RaceTrack, {
      slots: { default: "Runner" },
    });

    expect(wrapper.text()).toContain("Runner");
  });

  it("does not run animation when running=false", () => {
    const wrapper = mount(RaceTrack, {
      props: { running: false },
      slots: { default: "Runner" },
    });

    expect(wrapper.find(".runner").classes()).not.toContain("is-running");
  });

  it("adds running class when running=true", () => {
    const wrapper = mount(RaceTrack, {
      props: { running: true },
      slots: { default: "Runner" },
    });

    expect(wrapper.find(".runner").classes()).toContain("is-running");
  });

  it("emits finished on animationend when running", async () => {
    const wrapper = mount(RaceTrack, {
      props: { running: true, direction: "ltr" },
      slots: { default: "Runner" },
    });

    await wrapper.find(".runner").trigger("animationend", {
      animationName: "race-move-ltr",
    });

    expect(wrapper.emitted("finished")).toBeTruthy();
    expect(wrapper.emitted("finished")?.length).toBe(1);
  });

  it("does not emit finished on animationend when not running", async () => {
    const wrapper = mount(RaceTrack, {
      props: { running: false, direction: "ltr" },
      slots: { default: "Runner" },
    });

    await wrapper.find(".runner").trigger("animationend", {
      animationName: "race-move-ltr",
    });

    expect(wrapper.emitted("finished")).toBeFalsy();
  });
});
