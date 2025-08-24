import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Search, Square, XCircle } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { Column } from "@tanstack/react-table";

type ConfigTableSelectFilterProps<TData, TValue> = {
  filterOptions: Array<{ value: string; label: string }>;
  column: Column<TData, TValue>;
};

export function ConfigTableSelectFilter<tData, TValue>({
  column,
  filterOptions,
}: ConfigTableSelectFilterProps<tData, TValue>) {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    (column.getFilterValue() as string[]) || []
  );

  const onCheckboxChange = useCallback(
    (optionValue: string, checked: boolean) => {
      let newSelectedValues: string[];

      if (checked) {
        newSelectedValues = [...selectedValues, optionValue];
      } else {
        newSelectedValues = selectedValues.filter(
          (value) => value !== optionValue
        );
      }

      setSelectedValues(newSelectedValues);
      column.setFilterValue(
        newSelectedValues.length > 0 ? newSelectedValues : undefined
      );
    },
    [column, selectedValues]
  );

  const onReset = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      column.setFilterValue(undefined);
      setSelectedValues([]);
    },
    [column]
  );

  const hasValue = useMemo(() => {
    return selectedValues.length > 0;
  }, [selectedValues]);

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
            <Search />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[12.5rem] p-0" align="start">
          <Command>
            <CommandInput placeholder="Type..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
                {filterOptions?.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() =>
                      onCheckboxChange(
                        opt.value,
                        !selectedValues.includes(opt.value)
                      )
                    }
                  >
                    {selectedValues.includes(opt.value) ? (
                      <Check className="border rounded-[3px] size-4 bg-accent-foreground text-white" />
                    ) : (
                      <Square className="size-4 stroke-1 stroke-muted-foreground" />
                    )}
                    <span>{opt.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
