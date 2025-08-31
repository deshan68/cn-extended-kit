import React from "react";
import { ColumnConfig } from "../types";
import { Button } from "@/components/ui/button";

export const CellIconButtons = <TData, TKey extends keyof TData>({
  columnConfig,
  row,
}: {
  columnConfig?: ColumnConfig<TData, TKey>;
  row: TData;
}) => {
  return (
    <div className="flex justify-center items-center gap-2">
      {columnConfig?.iconButtons?.map((btn, i) => {
        const Btn = btn.Icon;
        return (
          <Button
            key={i}
            onClick={() => btn.onClick(row)}
            disabled={btn.disabled?.(row)}
            title={btn.tooltip}
            size={"icon"}
          >
            <Btn className="size-4" strokeWidth={1.4} />
          </Button>
        );
      })}
    </div>
  );
};
