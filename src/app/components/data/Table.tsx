import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useState } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  variant?: "standard" | "compact" | "striped" | "bordered";
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  variant = "standard",
  onRowClick,
  emptyMessage = "No data available"
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    null
  );

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const isCompact = variant === "compact";
  const isStriped = variant === "striped";
  const isBordered = variant === "bordered";

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              backgroundColor: "var(--b1-obsidian)",
              borderBottom: "1px solid var(--b1-border-subtle)"
            }}
          >
            {columns.map((column) => (
              <th
                key={column.key}
                className={`text-left ${isCompact ? "px-3 py-2" : "px-4 py-3"} ${
                  column.sortable ? "cursor-pointer select-none" : ""
                }`}
                style={{
                  fontSize: "var(--font-size-xs)",
                  fontWeight: "var(--font-weight-medium)",
                  color: "var(--b1-neutral-gray)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  width: column.width,
                  ...(isBordered && { border: "1px solid var(--b1-border-subtle)" })
                }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && (
                    <span>
                      {sortConfig?.key === column.key ? (
                        sortConfig.direction === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8"
                style={{ color: "var(--b1-neutral-gray)" }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((item, index) => (
              <tr
                key={index}
                className={onRowClick ? "cursor-pointer" : ""}
                style={{
                  borderBottom: "1px solid var(--b1-border-subtle)",
                  ...(isStriped && index % 2 === 1
                    ? { backgroundColor: "var(--b1-obsidian-panel)" }
                    : {})
                }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={isCompact ? "px-3 py-2" : "px-4 py-3"}
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--b1-white-space)",
                      ...(isBordered && { border: "1px solid var(--b1-border-subtle)" })
                    }}
                  >
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
