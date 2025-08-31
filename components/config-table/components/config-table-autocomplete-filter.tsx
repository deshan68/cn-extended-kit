import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { XCircle, Search } from "lucide-react";
import type { Column } from "@tanstack/react-table";
import { SelectOption } from "@/components/config-table/types";

type ConfigTableAutocompleteFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
  fetchOptions: ((query: string) => Promise<SelectOption[]>) | undefined;
  debounceMs?: number;
  minSearchChars?: number;
  placeholder?: string;
};

export function ConfigTableAutocompleteFilter<TData, TValue>({
  column,
  fetchOptions,
  debounceMs = 300,
  minSearchChars = 2,
  placeholder = "Type to search...",
}: ConfigTableAutocompleteFilterProps<TData, TValue>) {
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<SelectOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const selectedValue = column.getFilterValue() as string | undefined;
  const hasValue = Boolean(selectedValue);

  const fetchData = React.useMemo(() => {
    let timer: NodeJS.Timeout;
    return (q: string) => {
      if (!fetchOptions) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (q.length < minSearchChars) {
          setOptions([]);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);

        try {
          const results = await fetchOptions(q);
          setOptions(results);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch results"
          );
          setOptions([]);
        } finally {
          setLoading(false);
        }
      }, debounceMs);
    };
  }, [debounceMs, fetchOptions, minSearchChars]);

  React.useEffect(() => {
    if (query.trim() !== "") {
      fetchData(query);
    } else {
      setOptions([]);
    }
  }, [query, fetchData]);

  const handleSelect = (opt: SelectOption) => {
    setQuery(opt.label);
    column.setFilterValue(opt.value);
    setOpen(false);
  };

  const onReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery("");
    setOptions([]);
    column.setFilterValue(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative border-dashed text-muted-foreground"
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

      <PopoverContent align="start" className="w-64 p-2">
        <Input
          value={query}
          placeholder={placeholder}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="text-xs font-normal placeholder:text-xs placeholder:font-normal"
        />

        {loading && (
          <div className="flex items-center justify-center py-2 mt-2">
            <span className="text-xs font-normal">Searching...</span>
          </div>
        )}

        {!loading && error && (
          <div className="text-xs font-normal text-red-500 py-2 mt-2">
            {error}
          </div>
        )}

        {!loading && !error && options.length > 0 && (
          <div className="max-h-48 overflow-auto mt-2">
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`px-2 py-1 cursor-pointer hover:bg-gray-100 text-xs font-normal ${
                  selectedValue === opt.value ? "bg-gray-200" : ""
                }`}
                onClick={() => handleSelect(opt)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          query.length >= minSearchChars &&
          options.length === 0 && (
            <div className="text-xs font-normal text-gray-500 px-3 py-4 text-center">
              No results found for &quot;{query}&quot;
            </div>
          )}

        {!loading &&
          !error &&
          query.length < minSearchChars &&
          query.length > 0 && (
            <div className="text-xs font-normal text-gray-500 px-3 py-4 text-center">
              Type at least {minSearchChars} characters to search
            </div>
          )}
      </PopoverContent>
    </Popover>
  );
}
