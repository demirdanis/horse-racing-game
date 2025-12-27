import { describe, expect, it, vi } from "vitest";

import RaceCourse from "./RaceCourse.vue";
import { mount } from "@vue/test-utils";

vi.mock("@/store/modules/race/race.helpers", () => ({
  calculateLaneDurationSec: vi.fn(() => 3),
}));

const TrackStub = {
  name: "Track",
  props: ["laneNumber", "state", "durationSec", "direction"],
  emits: ["finished"],
  template: `
    <div class="track-stub"
      :data-lane="laneNumber"
      :data-state="state"
      :data-duration="durationSec"
      :data-direction="direction"
    >
      <slot />
    </div>
  `,
};

const HorseStub = {
  name: "Horse",
  props: ["state", "condition", "color"],
  template: `
    <div class="horse-stub"
      :data-state="state"
      :data-condition="condition"
      :data-color="color"
    />
  `,
};

function makeLanes() {
  return [
    { id: "a", laneNumber: 1, condition: 80, color: "#f00" },
    { id: "b", laneNumber: 2, condition: 40, color: "#0f0" },
    { id: "c", laneNumber: 3, condition: 90, color: "#00f" },
  ];
}

describe("RaceCourse", () => {
  it("renders one Track per lane and passes basic props", () => {
    const wrapper = mount(RaceCourse, {
      props: {
        lanes: makeLanes(),
        distance: 2000,
        state: "ready",
        direction: "rtl",
      },
      global: {
        stubs: { Track: TrackStub, Horse: HorseStub },
      },
    });

    const tracks = wrapper.findAll(".track-stub");
    expect(tracks.length).toBe(3);

    expect(tracks[0].attributes("data-lane")).toBe("1");
    expect(tracks[0].attributes("data-state")).toBe("ready");
    expect(tracks[0].attributes("data-direction")).toBe("rtl");

    expect(tracks[1].attributes("data-lane")).toBe("2");
    expect(tracks[2].attributes("data-lane")).toBe("3");
  });

  it("calls calculateLaneDurationSec with lane.condition and props.distance", async () => {
    const { calculateLaneDurationSec } = await import("@/store/modules/race/race.helpers");

    const mock = calculateLaneDurationSec as unknown as ReturnType<typeof vi.fn>;
    mock.mockClear();

    mount(RaceCourse, {
      props: {
        lanes: makeLanes(),
        distance: 1200,
        state: "ready",
        direction: "ltr",
      },
      global: { stubs: { Track: TrackStub, Horse: HorseStub } },
    });

    expect(mock).toHaveBeenCalled();
    expect(mock.mock.calls).toEqual(
      expect.arrayContaining([
        [80, 1200],
        [40, 1200],
        [90, 1200],
      ])
    );
  });

  it("renders one Horse per lane and sets horse state based on race state and finish", async () => {
    const wrapper = mount(RaceCourse, {
      props: {
        lanes: makeLanes(),
        distance: 2000,
        state: "ready",
        direction: "ltr",
      },
      global: { stubs: { Track: TrackStub, Horse: HorseStub } },
    });

    const horses = () => wrapper.findAll(".horse-stub");
    expect(horses().length).toBe(3);
    expect(horses()[0].attributes("data-state")).toBe("ready");

    await wrapper.setProps({ state: "running" });
    expect(horses()[0].attributes("data-state")).toBe("running");

    await wrapper.findAllComponents({ name: "Track" })[0].vm.$emit("finished");
    await wrapper.vm.$nextTick();

    expect(horses()[0].attributes("data-state")).toBe("won");
    expect(horses()[1].attributes("data-state")).toBe("running");
  });

  it("emits laneFinished with correct place/order and emits finished when all lanes complete", async () => {
    const wrapper = mount(RaceCourse, {
      props: {
        lanes: makeLanes(),
        distance: 2000,
        state: "running",
        direction: "ltr",
      },
      global: { stubs: { Track: TrackStub, Horse: HorseStub } },
    });

    const tracks = wrapper.findAllComponents({ name: "Track" });

    tracks[1].vm.$emit("finished");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("laneFinished")).toBeTruthy();
    expect(wrapper.emitted("laneFinished")![0][0]).toEqual({
      laneId: "b",
      place: 1,
      order: ["b"],
    });
    expect(wrapper.emitted("finished")).toBeFalsy();

    tracks[0].vm.$emit("finished");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("laneFinished")![1][0]).toEqual({
      laneId: "a",
      place: 2,
      order: ["b", "a"],
    });

    tracks[2].vm.$emit("finished");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("laneFinished")![2][0]).toEqual({
      laneId: "c",
      place: 3,
      order: ["b", "a", "c"],
    });

    expect(wrapper.emitted("finished")).toBeTruthy();
    expect(wrapper.emitted("finished")![0][0]).toEqual({
      order: ["b", "a", "c"],
    });
  });

  it("ignores duplicate finished events for the same lane", async () => {
    const wrapper = mount(RaceCourse, {
      props: {
        lanes: makeLanes(),
        distance: 2000,
        state: "running",
        direction: "ltr",
      },
      global: { stubs: { Track: TrackStub, Horse: HorseStub } },
    });

    const tracks = wrapper.findAllComponents({ name: "Track" });

    tracks[0].vm.$emit("finished");
    tracks[0].vm.$emit("finished");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("laneFinished")?.length).toBe(1);
    expect(wrapper.emitted("finished")).toBeFalsy();
  });

  it("resets finish state when state becomes ready or running (watch)", async () => {
    const wrapper = mount(RaceCourse, {
      props: {
        lanes: makeLanes(),
        distance: 2000,
        state: "running",
        direction: "ltr",
      },
      global: { stubs: { Track: TrackStub, Horse: HorseStub } },
    });

    const tracks = wrapper.findAllComponents({ name: "Track" });
    tracks[0].vm.$emit("finished");
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".horse-stub")[0].attributes("data-state")).toBe("won");

    await wrapper.setProps({ state: "paused" });
    await wrapper.vm.$nextTick();

    await wrapper.setProps({ state: "running" });
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll(".horse-stub")[0].attributes("data-state")).toBe("running");
  });
});
