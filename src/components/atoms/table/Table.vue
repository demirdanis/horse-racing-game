<template>
  <div
    class="table-wrap"
    :class="{
      'is-inner': props.borderStyle === 'inner',
      'is-outer': props.borderStyle === 'outer',
    }"
  >
    <table class="table">
      <thead>
        <tr>
          <th
            v-for="col in props.columns"
            :key="col.key"
            class="th"
            :class="col.align"
            :style="colStyle(col)"
          >
            {{ col.title }}
          </th>
        </tr>
      </thead>

      <tbody v-if="props.rows.length">
        <tr v-for="(row, rIndex) in props.rows" :key="rIndex" class="tr">
          <td
            v-for="col in props.columns"
            :key="col.key"
            class="td"
            :class="col.align"
            :style="colStyle(col)"
          >
            <slot name="cell" :row="row" :col="col" :value="row[col.key]">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr class="tr empty">
          <td class="td" :colspan="props.columns.length">
            {{ "-" }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn, TableProps } from "./Table.types";

const props = withDefaults(defineProps<TableProps>(), {
  borderStyle: "full",
});

function colStyle(col: TableColumn) {
  if (col.width == null) return undefined;

  const px = `${col.width}px`;
  return { width: px, minWidth: px, maxWidth: px };
}
</script>

<style scoped>
.table-wrap {
  width: 100%;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* ✅ width’ler tutarlı çalışsın */
}

.th,
.td {
  padding: 4px;
  font-size: 10px;
  border: 1px solid var(--table-border-color);
}

.is-inner .th,
.is-inner .td {
  border: 1px solid var(--table-border-color);
}

.table-wrap.is-outer .th,
.table-wrap.is-outer .td {
  border: none;
}

.table-wrap.is-outer .table {
  border: 1px solid var(--table-border-color);
}

.is-inner .th:first-child,
.is-inner .td:first-child {
  border-left: none;
}

.is-inner .th:last-child,
.is-inner .td:last-child {
  border-right: none;
}

.is-inner thead tr:first-child .th {
  border-top: none;
}

.is-inner tbody tr:last-child .td {
  border-bottom: none;
}

.th {
  font-weight: 700;
  background: var(--table-header-back-color);
}

.tr:hover .td {
  background: var(--table-cell-hover-color);
}

.left {
  text-align: left;
}

.center {
  text-align: center;
}

.right {
  text-align: right;
}

.tr.empty .td {
  opacity: 0.6;
  padding: 14px;
  text-align: center;
}
</style>
