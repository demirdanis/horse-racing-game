export interface TableColumn {
  key: string;
  title: string;
  align?: "left" | "center" | "right";
  width?: number;
}

export interface TableProps {
  columns: TableColumn[];
  rows: Record<string, any>[];
  borderStyle?: "full" | "inner" | "outer";
}
