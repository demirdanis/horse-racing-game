import { describe, expect, it } from "vitest";

import Card from "./Card.vue";
import { mount } from "@vue/test-utils";

describe("Card", () => {
  it("renders default slot content", () => {
    const wrapper = mount(Card, {
      slots: { default: "Hello Card" },
    });

    expect(wrapper.text()).toContain("Hello Card");
  });

  it("has the card root class", () => {
    const wrapper = mount(Card, {
      slots: { default: "Content" },
    });

    expect(wrapper.classes()).toContain("card");
  });
});
