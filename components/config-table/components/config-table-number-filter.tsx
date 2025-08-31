import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Search, XCircle } from "lucide-react";
import type { Column } from "@tanstack/react-table";

type ConfigTableNumberFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export function ConfigTableNumberFilter<TData, TValue>({
  column,
}: ConfigTableNumberFilterProps<TData, TValue>) {
  const [value, setValue] = useState<string>(
    (column.getFilterValue() as string) || ""
  );

  const onChangeTextFilter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    },
    []
  );

  const onSearch = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      column.setFilterValue(value || undefined);
    },
    [column, value]
  );

  const onReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      column.setFilterValue(undefined);
      setValue("");
    },
    [column]
  );

  const hasValue = useMemo(() => {
    return column.getFilterValue() !== undefined;
  }, [column]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="relative border-dashed"
          >
            {hasValue && (
              <div
                onClick={(event) => {
                  event.stopPropagation();
                  onReset(event);
                }}
                style={{
                  position: "absolute",
                  top: "-0.25rem",
                  right: "-0.375rem",
                }}
              >
                <XCircle className="size-3.5" />
              </div>
            )}
            <Search className="size-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-56 p-2 flex flex-col min-w-[150px]">
          <Input
            placeholder="Type to search..."
            type="number"
            value={value}
            onChange={onChangeTextFilter}
            inputMode="numeric"
            className="text-xs font-normal placeholder:text-xs placeholder:font-normal"
          />
          <Button
            variant="outline"
            size="sm"
            className="mt-4 ml-auto text-xs font-normal"
            onClick={onSearch}
          >
            Search
          </Button>
        </PopoverContent>
      </Popover>
    </>
  );
}
