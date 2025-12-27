import { describe, expect, it } from "vitest"; import { mount } from "@vue/test-utils"; import
AppLayout from "./AppLayout.vue"; function mountWithSlots() { return mount(AppLayout, { slots: {
top: '
<div data-test="top-slot">TOP</div>
', left: '
<div data-test="left-slot">LEFT</div>
', center: '
<div data-test="center-slot">CENTER</div>
', right: '
<div data-test="right-slot">RIGHT</div>
', }, }); } describe("AppLayout", () => { it("renders root structure", () => { const wrapper =
mountWithSlots(); expect(wrapper.find(".app-layout").exists()).toBe(true);
expect(wrapper.find("header.top").exists()).toBe(true);
expect(wrapper.find(".body.body--desktop").exists()).toBe(true);
expect(wrapper.find(".body.body--mobile").exists()).toBe(true); }); it("renders top slot inside
header", () => { const wrapper = mountWithSlots(); const header = wrapper.find("header.top");
expect(header.find('[data-test="top-slot"]').exists()).toBe(true);
expect(header.text()).toContain("TOP"); }); it("renders desktop layout areas and places slots
correctly", () => { const wrapper = mountWithSlots(); const desktop =
wrapper.find(".body.body--desktop"); expect(desktop.exists()).toBe(true); const desktopAsides =
desktop.findAll("aside.left, aside.right"); expect(desktopAsides.length).toBe(2); const desktopLeft
= desktop.find("aside.left"); const desktopCenter = desktop.find("main.center"); const desktopRight
= desktop.find("aside.right");
expect(desktopLeft.find('[data-test="left-slot"]').exists()).toBe(true);
expect(desktopCenter.find('[data-test="center-slot"]').exists()).toBe(true);
expect(desktopRight.find('[data-test="right-slot"]').exists()).toBe(true);
expect(desktopLeft.text()).toContain("LEFT"); expect(desktopCenter.text()).toContain("CENTER");
expect(desktopRight.text()).toContain("RIGHT"); }); it("renders mobile layout areas and places slots
correctly", () => { const wrapper = mountWithSlots(); const mobile =
wrapper.find(".body.body--mobile"); expect(mobile.exists()).toBe(true); const mobileCenter =
mobile.find("main.center"); const mobileLeft = mobile.find("aside.left"); const mobileRight =
mobile.find("section.right-mobile");
expect(mobileCenter.find('[data-test="center-slot"]').exists()).toBe(true);
expect(mobileLeft.find('[data-test="left-slot"]').exists()).toBe(true);
expect(mobileRight.find('[data-test="right-slot"]').exists()).toBe(true);
expect(mobileCenter.text()).toContain("CENTER"); expect(mobileLeft.text()).toContain("LEFT");
expect(mobileRight.text()).toContain("RIGHT"); }); it("keeps the mobile order as center -> left ->
right", () => { const wrapper = mountWithSlots(); const mobile = wrapper.find(".body.body--mobile");
const childrenTags = mobile.element.children; expect(childrenTags.length).toBe(3);
expect(childrenTags[0].tagName.toLowerCase()).toBe("main");
expect(childrenTags[0].classList.contains("center")).toBe(true);
expect(childrenTags[1].tagName.toLowerCase()).toBe("aside");
expect(childrenTags[1].classList.contains("left")).toBe(true);
expect(childrenTags[2].tagName.toLowerCase()).toBe("section");
expect(childrenTags[2].classList.contains("right-mobile")).toBe(true); }); it("keeps the desktop
order as left -> center -> right", () => { const wrapper = mountWithSlots(); const desktop =
wrapper.find(".body.body--desktop"); const childrenTags = desktop.element.children;
expect(childrenTags.length).toBe(3); expect(childrenTags[0].tagName.toLowerCase()).toBe("aside");
expect(childrenTags[0].classList.contains("left")).toBe(true);
expect(childrenTags[1].tagName.toLowerCase()).toBe("main");
expect(childrenTags[1].classList.contains("center")).toBe(true);
expect(childrenTags[2].tagName.toLowerCase()).toBe("aside");
expect(childrenTags[2].classList.contains("right")).toBe(true); }); it("renders both desktop and
mobile slots without duplicating within a single container", () => { const wrapper =
mountWithSlots(); const desktop = wrapper.find(".body.body--desktop");
expect(desktop.findAll('[data-test="left-slot"]').length).toBe(1);
expect(desktop.findAll('[data-test="center-slot"]').length).toBe(1);
expect(desktop.findAll('[data-test="right-slot"]').length).toBe(1); const mobile =
wrapper.find(".body.body--mobile");
expect(mobile.findAll('[data-test="left-slot"]').length).toBe(1);
expect(mobile.findAll('[data-test="center-slot"]').length).toBe(1);
expect(mobile.findAll('[data-test="right-slot"]').length).toBe(1); }); });
