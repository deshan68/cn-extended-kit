import type { Column } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronsUpDown,
  ChevronUp,
  EyeOff,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "@/components/config-table/types";
import { ConfigTableFilterButton } from "@/components/config-table/components/config-table-filter-button";

interface ConfigTableColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<typeof DropdownMenuTrigger> {
  column: Column<TData, TValue>;
  columnConfig: ColumnConfig<TData>;
}

export function ConfigTableColumnHeader<TData, TValue>({
  column,
  columnConfig,
  className,
  ...props
}: ConfigTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide() && !column.getCanFilter()) {
    return <div className={cn(className)}>{columnConfig.header}</div>;
  }

  return (
    <div className={"flex items-center"}>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
            className
          )}
          {...props}
        >
          {columnConfig.header}
          {column.getCanSort() &&
            (column.getIsSorted() === "desc" ? (
              <ChevronDown />
            ) : column.getIsSorted() === "asc" ? (
              <ChevronUp />
            ) : (
              <ChevronsUpDown />
            ))}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-28">
          {column.getCanSort() && (
            <>
              <DropdownMenuCheckboxItem
                className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground text-xs font-normal"
                checked={column.getIsSorted() === "asc"}
                onClick={() => column.toggleSorting(false)}
              >
                <ChevronUp className="size-4 mr-4" />
                Asc
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground text-xs font-normal"
                checked={column.getIsSorted() === "desc"}
                onClick={() => column.toggleSorting(true)}
              >
                <ChevronDown className="size-4 mr-4" />
                Desc
              </DropdownMenuCheckboxItem>
              {column.getIsSorted() && (
                <DropdownMenuItem
                  className="pl-2 [&_svg]:text-muted-foreground"
                  onClick={() => column.clearSorting()}
                >
                  <X className="size-4 mr-4" />
                  Reset
                </DropdownMenuItem>
              )}
            </>
          )}
          {column.getCanHide() && (
            <DropdownMenuCheckboxItem
              className="relative pr-8 pl-2 [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground text-xs font-normal"
              checked={!column.getIsVisible()}
              onClick={() => column.toggleVisibility(false)}
            >
              <EyeOff className="size-4 mr-4" />
              Hide
            </DropdownMenuCheckboxItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {column.getCanFilter() && (
        <ConfigTableFilterButton colConfig={columnConfig} column={column} />
      )}
    </div>
  );
}
