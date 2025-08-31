import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, XCircle, Check } from "lucide-react";

type ConfigTableDropdownFilterProps<TData, TValue> = {
  filterOptions: Array<{ value: string; label: string }>;
  column: Column<TData, TValue>;
};

export function ConfigTableSingleSelectFilter<TData, TValue>({
  column,
  filterOptions,
}: ConfigTableDropdownFilterProps<TData, TValue>) {
  const [selectedValue, setSelectedValue] = React.useState<string | undefined>(
    (column.getFilterValue() as string) || undefined
  );

  const onValueChange = React.useCallback(
    (value: string) => {
      setSelectedValue(value);
      column.setFilterValue(value || undefined);
    },
    [column]
  );

  const onReset = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedValue(undefined);
      column.setFilterValue(undefined);
    },
    [column]
  );

  return (
    <div className="relative">
      {selectedValue && (
        <button
          onClick={onReset}
          className="text-muted-foreground"
          style={{
            position: "absolute",
            top: "-0.25rem",
            right: "-0.375rem",
          }}
        >
          <XCircle className="size-3.5" />
        </button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
          >
            <Search className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="min-w-[150px] p-1">
          <DropdownMenuGroup>
            {filterOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onValueChange(opt.value)}
                className="flex items-center gap-2 text-xs font-normal"
              >
                {selectedValue === opt.value ? (
                  <Check className="size-4" />
                ) : (
                  <span className="w-4" />
                )}
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
