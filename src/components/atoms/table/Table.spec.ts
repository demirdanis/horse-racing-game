import { describe, expect, it } from "vitest";

import Table from "./Table.vue";
import type { TableColumn } from "./Table.types";
import { h } from "vue";
import { mount } from "@vue/test-utils";

type StylableEl = { attributes: (name: string) => string | undefined };

function styleOf(el: StylableEl) {
  return (el.attributes("style") ?? "").replace(/\s+/g, " ").trim();
}

function mountTable(opts?: {
  columns?: TableColumn[];
  rows?: Record<string, unknown>[];
  borderStyle?: "full" | "inner" | "outer";
  withCellSlot?: boolean;
}) {
  const columns: TableColumn[] = opts?.columns ?? [
    { key: "name", title: "Name", align: "left" },
    { key: "age", title: "Age", align: "center" },
  ];

  const rows = opts?.rows ?? [
    { name: "Alice", age: 30 },
    { name: "Bob", age: 25 },
  ];

  return mount(Table, {
    props: {
      columns,
      rows,
      ...(opts?.borderStyle ? { borderStyle: opts.borderStyle } : {}),
    },
    slots: opts?.withCellSlot
      ? {
          cell: (slotProps: { row: Record<string, unknown>; col: TableColumn; value: unknown }) =>
            h("span", { "data-test": `cell-${slotProps.col.key}` }, `V:${String(slotProps.value)}`),
        }
      : undefined,
  });
}

describe("Table", () => {
  it("renders table structure", () => {
    const wrapper = mountTable();

    expect(wrapper.find(".table-wrap").exists()).toBe(true);
    expect(wrapper.find("table.table").exists()).toBe(true);
    expect(wrapper.find("thead").exists()).toBe(true);
  });

  it("renders headers from columns", () => {
    const columns: TableColumn[] = [
      { key: "a", title: "A" },
      { key: "b", title: "B" },
      { key: "c", title: "C" },
    ];

    const wrapper = mountTable({ columns, rows: [{ a: 1, b: 2, c: 3 }] });

    const ths = wrapper.findAll("thead th.th");
    expect(ths.length).toBe(3);
    expect(ths[0].text()).toBe("A");
    expect(ths[1].text()).toBe("B");
    expect(ths[2].text()).toBe("C");
  });

  it("renders body rows/cells when rows exist", () => {
    const wrapper = mountTable({
      columns: [
        { key: "name", title: "Name" },
        { key: "age", title: "Age" },
      ],
      rows: [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
      ],
    });

    const trs = wrapper.findAll("tbody tr.tr");
    expect(trs.length).toBe(2);

    const firstTds = trs[0].findAll("td.td");
    expect(firstTds.length).toBe(2);
    expect(firstTds[0].text()).toContain("Alice");
    expect(firstTds[1].text()).toContain("30");
  });

  it("renders empty state when rows is empty", () => {
    const wrapper = mountTable({
      columns: [
        { key: "name", title: "Name" },
        { key: "age", title: "Age" },
        { key: "city", title: "City" },
      ],
      rows: [],
    });

    const emptyTr = wrapper.find("tbody tr.tr.empty");
    expect(emptyTr.exists()).toBe(true);

    const td = emptyTr.find("td.td");
    expect(td.exists()).toBe(true);
    expect(td.text()).toBe("-");
    expect(td.attributes("colspan")).toBe("3");
  });

  it("applies borderStyle classes: full(default), inner, outer", async () => {
    const wrapper = mountTable();

    expect(wrapper.find(".table-wrap").classes()).not.toContain("is-inner");
    expect(wrapper.find(".table-wrap").classes()).not.toContain("is-outer");

    await wrapper.setProps({ borderStyle: "inner" });
    expect(wrapper.find(".table-wrap").classes()).toContain("is-inner");
    expect(wrapper.find(".table-wrap").classes()).not.toContain("is-outer");

    await wrapper.setProps({ borderStyle: "outer" });
    expect(wrapper.find(".table-wrap").classes()).toContain("is-outer");
    expect(wrapper.find(".table-wrap").classes()).not.toContain("is-inner");
  });

  it("applies align class to th/td when provided", () => {
    const wrapper = mountTable({
      columns: [
        { key: "name", title: "Name", align: "left" },
        { key: "age", title: "Age", align: "center" },
        { key: "score", title: "Score", align: "right" },
      ],
      rows: [{ name: "A", age: 1, score: 9 }],
    });

    const ths = wrapper.findAll("thead th.th");
    expect(ths[0].classes()).toContain("left");
    expect(ths[1].classes()).toContain("center");
    expect(ths[2].classes()).toContain("right");

    const tds = wrapper.findAll("tbody td.td");
    expect(tds[0].classes()).toContain("left");
    expect(tds[1].classes()).toContain("center");
    expect(tds[2].classes()).toContain("right");
  });

  it("does not set width style when column.width is null/undefined", () => {
    const wrapper = mountTable({
      columns: [
        { key: "a", title: "A" },
        { key: "b", title: "B", width: undefined },
        { key: "c", title: "C", width: null },
      ],
      rows: [{ a: 1, b: 2, c: 3 }],
    });

    const ths = wrapper.findAll("thead th.th");
    expect(styleOf(ths[0])).not.toContain("width:");
    expect(styleOf(ths[1])).not.toContain("width:");
    expect(styleOf(ths[2])).not.toContain("width:");
  });

  it("sets width/minWidth/maxWidth when column.width is provided", () => {
    const wrapper = mountTable({
      columns: [
        { key: "name", title: "Name", width: 120 },
        { key: "age", title: "Age" },
        { key: "score", title: "Score", width: 60 },
      ],
      rows: [{ name: "A", age: 1, score: 9 }],
    });

    const ths = wrapper.findAll("thead th.th");
    expect(styleOf(ths[0])).toContain("width: 120px;");
    expect(styleOf(ths[0])).toContain("min-width: 120px;");
    expect(styleOf(ths[0])).toContain("max-width: 120px;");

    expect(styleOf(ths[1])).not.toContain("width:");

    expect(styleOf(ths[2])).toContain("width: 60px;");
    expect(styleOf(ths[2])).toContain("min-width: 60px;");
    expect(styleOf(ths[2])).toContain("max-width: 60px;");
  });

  it("applies the same width styles to matching td cells", () => {
    const wrapper = mountTable({
      columns: [
        { key: "name", title: "Name", width: 100 },
        { key: "age", title: "Age", width: 50 },
      ],
      rows: [{ name: "A", age: 1 }],
    });

    const tds = wrapper.findAll("tbody td.td");
    expect(tds.length).toBe(2);

    expect(styleOf(tds[0])).toContain("width: 100px;");
    expect(styleOf(tds[0])).toContain("min-width: 100px;");
    expect(styleOf(tds[0])).toContain("max-width: 100px;");

    expect(styleOf(tds[1])).toContain("width: 50px;");
    expect(styleOf(tds[1])).toContain("min-width: 50px;");
    expect(styleOf(tds[1])).toContain("max-width: 50px;");
  });

  it("renders default cell content when cell slot is not provided", () => {
    const wrapper = mountTable({
      columns: [{ key: "x", title: "X" }],
      rows: [{ x: "Hello" }],
      withCellSlot: false,
    });

    expect(wrapper.find("tbody td.td").text()).toContain("Hello");
  });

  it("renders custom cell slot content and receives slot props", () => {
    const wrapper = mountTable({
      columns: [
        { key: "name", title: "Name" },
        { key: "age", title: "Age" },
      ],
      rows: [{ name: "Alice", age: 30 }],
      withCellSlot: true,
    });

    expect(wrapper.find('[data-test="cell-name"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="cell-age"]').exists()).toBe(true);

    expect(wrapper.find('[data-test="cell-name"]').text()).toBe("V:Alice");
    expect(wrapper.find('[data-test="cell-age"]').text()).toBe("V:30");
  });

  it("handles columns=[] (still renders table, empty tbody placeholder colspan=0)", () => {
    const wrapper = mountTable({
      columns: [],
      rows: [],
    });

    expect(wrapper.find("table.table").exists()).toBe(true);

    const emptyTr = wrapper.find("tbody tr.tr.empty");
    expect(emptyTr.exists()).toBe(true);

    const td = emptyTr.find("td.td");
    expect(td.attributes("colspan")).toBe("0");
    expect(td.text()).toBe("-");
  });
});
