import { describe, expect, it } from "vitest";

import TitledSection from "./TitledSection.vue";
import { mount } from "@vue/test-utils";

describe("TitledSection", () => {
  it("renders title and sets aria-label", () => {
    const wrapper = mount(TitledSection, {
      props: { title: "Horses" },
      slots: { default: "<div>Content</div>" },
    });

    expect(wrapper.find(".title").text()).toBe("Horses");

    const section = wrapper.find("section.section");
    expect(section.exists()).toBe(true);
    expect(section.attributes("role")).toBe("region");
    expect(section.attributes("aria-label")).toBe("Horses");
  });

  it("does not render subtitle when not provided", () => {
    const wrapper = mount(TitledSection, {
      props: { title: "No Subtitle" },
    });

    expect(wrapper.find(".subtitle").exists()).toBe(false);
  });

  it("renders subtitle when provided", () => {
    const wrapper = mount(TitledSection, {
      props: { title: "Title", subtitle: "Sub" },
    });

    const subtitle = wrapper.find(".subtitle");
    expect(subtitle.exists()).toBe(true);
    expect(subtitle.text()).toBe("Sub");
  });

  it("adds/removes borderless class based on prop", async () => {
    const wrapper = mount(TitledSection, {
      props: { title: "Title", borderless: false },
    });

    expect(wrapper.find("section.section").classes()).not.toContain(
      "borderless"
    );

    await wrapper.setProps({ borderless: true });
    expect(wrapper.find("section.section").classes()).toContain("borderless");
  });

  it("renders default slot content inside .content", () => {
    const wrapper = mount(TitledSection, {
      props: { title: "Title" },
      slots: { default: '<p class="inner">Hello</p>' },
    });

    const content = wrapper.find(".content");
    expect(content.exists()).toBe(true);
    expect(content.find(".inner").text()).toBe("Hello");
  });

  it("does not render actions container when actions slot is missing", () => {
    const wrapper = mount(TitledSection, {
      props: { title: "Title" },
      slots: { default: "<div />" },
    });

    expect(wrapper.find(".actions").exists()).toBe(false);
  });

  it("renders actions container when actions slot is provided", () => {
    const wrapper = mount(TitledSection, {
      props: { title: "Title" },
      slots: {
        default: "<div />",
        actions: '<button class="act">Action</button>',
      },
    });

    const actions = wrapper.find(".actions");
    expect(actions.exists()).toBe(true);
    expect(actions.find(".act").exists()).toBe(true);
    expect(actions.text()).toContain("Action");
  });
});
