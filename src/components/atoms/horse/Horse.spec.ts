import { describe, expect, it } from "vitest";

import Horse from "./Horse.vue";
import { mount } from "@vue/test-utils";

function getStyleAttr(wrapper: any) {
  return wrapper.attributes("style") ?? "";
}

function extractCssVar(style: string, varName: string) {
  const re = new RegExp(`${varName}\\s*:\\s*([^;]+)`);
  const m = style.match(re);
  return m ? m[1].trim() : null;
}

function expectCssVar(style: string, varName: string, expected: string) {
  expect(extractCssVar(style, varName)).toBe(expected);
}

function clamp01to100(n: number) {
  return Math.max(1, Math.min(100, n));
}

function expectedGallopDurationMs(condition: number) {
  const c = clamp01to100(condition);
  const slowest = 1500;
  const fastest = 600;
  const t = (c - 1) / 99;
  return Math.round(slowest + (fastest - slowest) * t);
}

function expectedGallopAmp(condition: number) {
  const c = clamp01to100(condition);
  const t = (c - 1) / 99;
  const min = 0.35;
  const max = 1.0;
  return (min + (max - min) * t).toFixed(3);
}

describe("Horse", () => {
  it("renders root with role and aria-label", () => {
    const wrapper = mount(Horse);
    expect(wrapper.attributes("role")).toBe("img");
    expect(wrapper.attributes("aria-label")).toBe("Horse");
  });

  it("renders HorseIcon wrapper", () => {
    const wrapper = mount(Horse);
    expect(wrapper.find(".horse__icon").exists()).toBe(true);
    expect(wrapper.find(".horse__svg").exists()).toBe(true);
  });

  it("default props apply classes and style vars", () => {
    const wrapper = mount(Horse);

    expect(wrapper.classes()).toContain("is-ready");
    expect(wrapper.classes()).not.toContain("is-running");
    expect(wrapper.classes()).not.toContain("is-won");

    const style = getStyleAttr(wrapper);

    expect(extractCssVar(style, "--horse-color")).toBeTruthy();
    expect(extractCssVar(style, "--gallop-duration")).toBeTruthy();
    expect(extractCssVar(style, "--gallop-amp")).toBeTruthy();

    expectCssVar(
      style,
      "--gallop-duration",
      `${expectedGallopDurationMs(50)}ms`
    );
    expectCssVar(style, "--gallop-amp", expectedGallopAmp(50));
  });

  it("state classes: ready / running / won", async () => {
    const wrapper = mount(Horse, { props: { state: "ready" } });
    expect(wrapper.classes()).toContain("is-ready");
    expect(wrapper.classes()).not.toContain("is-running");
    expect(wrapper.classes()).not.toContain("is-won");

    await wrapper.setProps({ state: "running" });
    expect(wrapper.classes()).toContain("is-running");
    expect(wrapper.classes()).not.toContain("is-ready");
    expect(wrapper.classes()).not.toContain("is-won");

    await wrapper.setProps({ state: "won" });
    expect(wrapper.classes()).toContain("is-won");
    expect(wrapper.classes()).not.toContain("is-running");
    expect(wrapper.classes()).not.toContain("is-ready");
  });

  it("icon state classes follow state", async () => {
    const wrapper = mount(Horse, { props: { state: "ready" } });
    const icon = () => wrapper.find(".horse__icon");

    expect(icon().classes()).not.toContain("is-running");
    expect(icon().classes()).not.toContain("is-won");

    await wrapper.setProps({ state: "running" });
    expect(icon().classes()).toContain("is-running");
    expect(icon().classes()).not.toContain("is-won");

    await wrapper.setProps({ state: "won" });
    expect(icon().classes()).toContain("is-won");
    expect(icon().classes()).not.toContain("is-running");
  });

  it("uses provided color in CSS vars", () => {
    const wrapper = mount(Horse, { props: { color: "#FF0000" } });
    const style = getStyleAttr(wrapper);

    expectCssVar(style, "--horse-color", "#FF0000");
    expect(style.replace(/\s+/g, " ")).toContain("color: var(--horse-color)");
  });

  it("falls back to danger color when color is empty string", () => {
    const wrapper = mount(Horse, { props: { color: "" } });
    const style = getStyleAttr(wrapper);

    expectCssVar(style, "--horse-color", "var(--color-danger)");
  });

  it("clamps condition below 1 to 1 and sets duration/amp", () => {
    const wrapper = mount(Horse, { props: { condition: 0 } });
    const style = getStyleAttr(wrapper);

    expectCssVar(
      style,
      "--gallop-duration",
      `${expectedGallopDurationMs(1)}ms`
    );
    expectCssVar(style, "--gallop-amp", expectedGallopAmp(1));
  });

  it("clamps condition above 100 to 100 and sets duration/amp", () => {
    const wrapper = mount(Horse, { props: { condition: 999 } });
    const style = getStyleAttr(wrapper);

    expectCssVar(
      style,
      "--gallop-duration",
      `${expectedGallopDurationMs(100)}ms`
    );
    expectCssVar(style, "--gallop-amp", expectedGallopAmp(100));
  });

  it("computes duration/amp for a few representative conditions", () => {
    const cases = [1, 25, 50, 75, 100];

    for (const c of cases) {
      const wrapper = mount(Horse, { props: { condition: c } });
      const style = getStyleAttr(wrapper);

      expectCssVar(
        style,
        "--gallop-duration",
        `${expectedGallopDurationMs(c)}ms`
      );
      expectCssVar(style, "--gallop-amp", expectedGallopAmp(c));
    }
  });

  it("updates CSS vars when condition changes", async () => {
    const wrapper = mount(Horse, { props: { condition: 1 } });

    let style = getStyleAttr(wrapper);
    expectCssVar(
      style,
      "--gallop-duration",
      `${expectedGallopDurationMs(1)}ms`
    );
    expectCssVar(style, "--gallop-amp", expectedGallopAmp(1));

    await wrapper.setProps({ condition: 100 });

    style = getStyleAttr(wrapper);
    expectCssVar(
      style,
      "--gallop-duration",
      `${expectedGallopDurationMs(100)}ms`
    );
    expectCssVar(style, "--gallop-amp", expectedGallopAmp(100));
  });

  it("updates CSS var when color changes", async () => {
    const wrapper = mount(Horse, { props: { color: "#00FF00" } });

    let style = getStyleAttr(wrapper);
    expectCssVar(style, "--horse-color", "#00FF00");

    await wrapper.setProps({ color: "#0000FF" });

    style = getStyleAttr(wrapper);
    expectCssVar(style, "--horse-color", "#0000FF");
  });

  it("updates state classes when state changes", async () => {
    const wrapper = mount(Horse, { props: { state: "ready" } });
    expect(wrapper.classes()).toContain("is-ready");

    await wrapper.setProps({ state: "running" });
    expect(wrapper.classes()).toContain("is-running");

    await wrapper.setProps({ state: "won" });
    expect(wrapper.classes()).toContain("is-won");
  });
});
