import type { ColumnConfig } from "@/components/config-table/types";
import { useCallback } from "react";
import type { Column } from "@tanstack/react-table";
import {
  ConfigTableTextFilter,
  ConfigTableNumberFilter,
  ConfigTableDateFilter,
  ConfigTableMultiSelectFilter,
  ConfigTableSingleSelectFilter,
  ConfigTableAutocompleteFilter,
} from "@/components/config-table/components";

type ConfigTableFilterButtonProps<TData, TValue> = {
  colConfig: ColumnConfig<TData>;
  column: Column<TData, TValue>;
};

export function ConfigTableFilterButton<TData, TValue>({
  colConfig,
  column,
}: ConfigTableFilterButtonProps<TData, TValue>) {
  const onColumnFilterRender = useCallback(() => {
    const filterType = colConfig?.filtering?.filterType || "text";

    switch (filterType) {
      case "text":
        return <ConfigTableTextFilter column={column} />;
      case "number":
        return <ConfigTableNumberFilter column={column} />;
      case "single-select":
        return (
          <ConfigTableSingleSelectFilter
            column={column}
            filterOptions={colConfig?.filtering?.filterOptions || []}
          />
        );
      case "multi-select":
        return (
          <ConfigTableMultiSelectFilter
            column={column}
            filterOptions={colConfig?.filtering?.filterOptions || []}
          />
        );
      case "auto-complete":
        return (
          <ConfigTableAutocompleteFilter
            column={column}
            fetchOptions={colConfig?.filtering?.asyncOptions?.fetchOptions}
          />
        );
      case "date":
        return <ConfigTableDateFilter column={column} multiple={true} />;
      default:
        return null;
    }
  }, [colConfig, column]);

  return onColumnFilterRender();
}
