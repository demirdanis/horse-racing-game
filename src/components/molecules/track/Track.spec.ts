import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Track from "./Track.vue";
import { h } from "vue";
import { mount } from "@vue/test-utils";

type RafCb = FrameRequestCallback;

let rafId = 0;
let rafQueue: RafCb[] = [];

function installRafMock() {
  rafId = 0;
  rafQueue = [];

  vi.stubGlobal("requestAnimationFrame", (cb: RafCb) => {
    rafQueue.push(cb);
    return ++rafId;
  });

  vi.stubGlobal("cancelAnimationFrame", (_id: number) => {});
}

function runNextRaf(ts: number) {
  const cb = rafQueue.shift();
  if (!cb) return false;
  cb(ts);
  return true;
}

function runRafSeries(times: number[]) {
  for (const t of times) {
    const ran = runNextRaf(t);
    if (!ran) break;
  }
}

async function tick() {
  await Promise.resolve();
}

async function startAndPrime(ts0 = 0) {
  await tick();
  runRafSeries([ts0]);
  await tick();
}

type TrackSlotProps = { progress: number };

describe("Track", () => {
  beforeEach(() => {
    installRafMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders lane number and slot content", () => {
    const wrapper = mount(Track, {
      props: { laneNumber: 7 },
      slots: { default: "Runner" },
    });

    expect(wrapper.find(".lane__text").text()).toBe("7");
    expect(wrapper.text()).toContain("Runner");
  });

  it("applies direction classes and updates on change", async () => {
    const wrapper = mount(Track, {
      props: { direction: "ltr" },
      slots: { default: "Runner" },
    });

    expect(wrapper.find(".track-root").classes()).toContain("is-ltr");
    expect(wrapper.find(".runner").classes()).toContain("dir-ltr");
    expect(wrapper.find(".track-root").classes()).not.toContain("is-rtl");
    expect(wrapper.find(".runner").classes()).not.toContain("dir-rtl");

    await wrapper.setProps({ direction: "rtl" });
    await tick();

    expect(wrapper.find(".track-root").classes()).toContain("is-rtl");
    expect(wrapper.find(".runner").classes()).toContain("dir-rtl");
    expect(wrapper.find(".track-root").classes()).not.toContain("is-ltr");
    expect(wrapper.find(".runner").classes()).not.toContain("dir-ltr");
  });

  it("applies state classes: ready / running / paused / finished", async () => {
    const wrapper = mount(Track, {
      props: { state: "ready" },
      slots: { default: "Runner" },
    });

    const runner = () => wrapper.find(".runner");

    expect(runner().classes()).not.toContain("is-running");
    expect(runner().classes()).not.toContain("is-paused");
    expect(runner().classes()).not.toContain("is-finished");

    await wrapper.setProps({ state: "running" });
    await tick();
    expect(runner().classes()).toContain("is-running");
    expect(runner().classes()).not.toContain("is-paused");

    await wrapper.setProps({ state: "paused" });
    await tick();
    expect(runner().classes()).toContain("is-paused");
    expect(runner().classes()).not.toContain("is-running");

    await wrapper.setProps({ state: "finished" });
    await tick();
    expect(runner().classes()).toContain("is-finished");
  });

  it("exposes progress to slot and starts at 0", async () => {
    const wrapper = mount(Track, {
      props: { state: "ready" },
      slots: {
        default: (slotProps: TrackSlotProps) =>
          h("span", { class: "p" }, slotProps.progress.toFixed(3)),
      },
    });

    await tick();
    expect(wrapper.find(".p").text()).toBe("0.000");
  });

  it("emits finished when duration elapses while running", async () => {
    const wrapper = mount(Track, {
      props: { state: "running", durationSec: 1 },
      slots: {
        default: (slotProps: TrackSlotProps) =>
          h("span", { class: "p" }, String(slotProps.progress)),
      },
    });

    await startAndPrime(0);
    runRafSeries([1000]);

    expect(wrapper.emitted("finished")).toBeTruthy();
    expect(wrapper.emitted("finished")?.length).toBe(1);
  });

  it("does not emit finished if paused before completion", async () => {
    const wrapper = mount(Track, {
      props: { state: "running", durationSec: 2 },
      slots: {
        default: (slotProps: TrackSlotProps) =>
          h("span", { class: "p" }, slotProps.progress.toFixed(3)),
      },
    });

    await startAndPrime(0);

    runRafSeries([500]);
    await tick();

    const p1 = Number(wrapper.find(".p").text());
    expect(p1).toBeGreaterThan(0);
    expect(p1).toBeLessThan(1);

    await wrapper.setProps({ state: "paused" });
    await tick();

    runRafSeries([1000, 1500, 2000, 3000]);
    await tick();

    expect(wrapper.emitted("finished")).toBeFalsy();

    const p2 = Number(wrapper.find(".p").text());
    expect(p2).toBeCloseTo(p1, 3);
  });

  it("resumes from paused progress (does not restart)", async () => {
    const wrapper = mount(Track, {
      props: { state: "running", durationSec: 2 },
      slots: {
        default: (slotProps: TrackSlotProps) =>
          h("span", { class: "p" }, slotProps.progress.toFixed(3)),
      },
    });

    await startAndPrime(0);

    runRafSeries([500]);
    await tick();

    const p1 = Number(wrapper.find(".p").text());
    expect(p1).toBeGreaterThan(0);
    expect(p1).toBeLessThan(1);

    await wrapper.setProps({ state: "paused" });
    await tick();

    await wrapper.setProps({ state: "running" });
    await tick();

    await startAndPrime(1000);

    const p2 = Number(wrapper.find(".p").text());
    expect(p2).toBeCloseTo(p1, 3);

    runRafSeries([2500]);
    await tick();

    expect(wrapper.emitted("finished")).toBeTruthy();
    expect(wrapper.emitted("finished")?.length).toBe(1);
  });

  it("resets progress to 0 when state becomes ready", async () => {
    const wrapper = mount(Track, {
      props: { state: "running", durationSec: 2 },
      slots: {
        default: (slotProps: TrackSlotProps) =>
          h("span", { class: "p" }, slotProps.progress.toFixed(3)),
      },
    });

    await startAndPrime(0);

    runRafSeries([500]);
    await tick();

    const p1 = Number(wrapper.find(".p").text());
    expect(p1).toBeGreaterThan(0);

    await wrapper.setProps({ state: "ready" });
    await tick();

    expect(wrapper.find(".p").text()).toBe("0.000");
    expect(wrapper.emitted("finished")).toBeFalsy();
  });

  it("does not advance when state is paused", async () => {
    const wrapper = mount(Track, {
      props: { state: "paused", durationSec: 1 },
      slots: {
        default: (slotProps: TrackSlotProps) =>
          h("span", { class: "p" }, slotProps.progress.toFixed(3)),
      },
    });

    await tick();

    runRafSeries([0, 1000, 2000]);
    await tick();

    expect(wrapper.find(".p").text()).toBe("0.000");
    expect(wrapper.emitted("finished")).toBeFalsy();
  });

  it("uses minimum duration 0.1s for progress calculation when durationSec is 0", async () => {
    const wrapper = mount(Track, {
      props: { state: "running", durationSec: 0 },
      slots: {
        default: (slotProps: TrackSlotProps) =>
          h("span", { class: "p" }, slotProps.progress.toFixed(3)),
      },
    });

    await startAndPrime(0);

    runRafSeries([50]);
    await tick();

    const p = Number(wrapper.find(".p").text());
    expect(p).toBeGreaterThan(0);
    expect(p).toBeLessThan(1);

    runRafSeries([100]);
    await tick();

    expect(wrapper.emitted("finished")).toBeTruthy();
    expect(wrapper.emitted("finished")?.length).toBe(1);
  });

  it("does not emit finished when switched to finished state before completion", async () => {
    const wrapper = mount(Track, {
      props: { state: "running", durationSec: 2 },
      slots: {
        default: (slotProps: TrackSlotProps) =>
          h("span", { class: "p" }, slotProps.progress.toFixed(3)),
      },
    });

    await startAndPrime(0);

    runRafSeries([500]);
    await tick();

    await wrapper.setProps({ state: "finished" });
    await tick();

    runRafSeries([1000, 2000, 3000]);
    await tick();

    expect(wrapper.emitted("finished")).toBeFalsy();
  });
});
