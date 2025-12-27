export interface TableColumn {
  key: string;
  title: string;
  align?: "left" | "center" | "right";
  width?: number | null;
}

export interface TableProps {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  borderStyle?: "full" | "inner" | "outer";
}
