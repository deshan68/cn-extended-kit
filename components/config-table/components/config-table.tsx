import { useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  VisibilityState,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  X,
} from "lucide-react";
import type {
  CellData,
  MetaCellData,
  TableConfig,
} from "@/components/config-table/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ConfigTableColumnHeader,
  TextCell,
  NumberCell,
  BooleanCell,
  SingleSelectCell,
  MultiSelectCell,
  DateCell,
  AutoCompleteCell,
  CellIconButtons,
  ConfigTableColumnHider,
} from "@/components/config-table/components";
import {
  PAGE_INDEX,
  PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from "@/components/config-table/lib";

export interface ConfigurableTableProps<
  TData extends {
    id: string;
    __isDummy?: boolean;
  }
> {
  config: TableConfig<TData>;
  isFetching: boolean;
}

const ConfigurableTable = <TData extends { id: string; __isDummy?: boolean }>({
  config,
  isFetching,
}: ConfigurableTableProps<TData>) => {
  const pageSizeOptions =
    config.pagination?.pageSizeOptions || PAGE_SIZE_OPTIONS;
  const [tableData, setTableData] = useState(config.data);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnId: string;
  } | null>(null);
  const [page, setPage] = useState(
    config.pagination?.initialState?.pageIndex || PAGE_INDEX
  );
  const [perPage, setPerPage] = useState(
    config.pagination?.initialState?.pageSize || PAGE_SIZE
  );
  const [sorting, setSorting] = useState<SortingState>(
    config.sorting?.initialState || []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    config.columnVisibility?.initialState || {}
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    config.filtering?.initialState || []
  );

  useMemo(() => {
    setTableData(config.data);
  }, [config]);

  const pagination: PaginationState = useMemo(() => {
    return {
      pageIndex: page - 1,
      pageSize: perPage,
    };
  }, [page, perPage]);

  const handleCellEdit = useCallback((rowIndex: number, columnId: string) => {
    setEditingCell({ rowIndex, columnId });
    setApiErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`${rowIndex}-${columnId}`];
      return newErrors;
    });
  }, []);

  const checkRowReadyForCreation = useCallback(
    (rowData: TData) => {
      const requiredFields = config.editing?.rowCreating?.requiredFields || [];
      return requiredFields.every((field) => {
        const value = rowData[field];
        return value !== undefined && value !== null && value !== "";
      });
    },
    [config.editing?.rowCreating?.requiredFields]
  );

  const handleAutoSave = useCallback(
    async (
      rowIndex: number,
      mutationKey: keyof TData,
      newValue: MetaCellData,
      rowData: TData
    ) => {
      if (!config.editing?.rowCreating?.autoSave) return;
      if (!checkRowReadyForCreation(rowData)) return;

      try {
        const TemporaryUpdatedValue = {
          ...rowData,
          [mutationKey]: newValue.value,
        };

        if (config.editing?.rowCreating.beforeCreate) {
          const shouldContinue = await config.editing.rowCreating.beforeCreate({
            columnId: mutationKey,
            newValue: newValue,
            newRow: TemporaryUpdatedValue,
          });

          if (!shouldContinue) return;
        }

        let response;
        if (config.editing?.rowCreating?.coreCreate) {
          setIsLoading(true);
          response = await config.editing.rowCreating.coreCreate({
            columnId: mutationKey,
            newValue: newValue,
            newRow: TemporaryUpdatedValue,
          });

          if (!response) {
            throw new Error("Core create handler failed");
          }
        }

        const cleanRowData = { ...TemporaryUpdatedValue };

        setApiErrors((prev) => {
          const newErrors = { ...prev };
          config.columns.forEach((col) => {
            delete newErrors[`${rowIndex}-${col.id}`];
          });
          return newErrors;
        });

        if (config.editing?.rowCreating?.afterCreate)
          config.editing.rowCreating.afterCreate({
            newRow: cleanRowData,
          });
      } catch (error) {
        console.error("Row creation failed:", error);

        setApiErrors((prev) => ({
          ...prev,
          [`${rowIndex}-row`]:
            error instanceof Error ? error.message : "Creation failed",
        }));

        if (config.editing?.rowCreating?.onCreateError) {
          config.editing.rowCreating.onCreateError({
            error,
            rowData,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [config.editing?.rowCreating, config.columns, checkRowReadyForCreation]
  );

  const handleCellSave = useCallback(
    async (
      rowIndex: number,
      columnId: keyof TData,
      mutationKey: keyof TData,
      newValue: MetaCellData
    ) => {
      const rowData = tableData[rowIndex] as TData;
      const oldValue = rowData[columnId] as CellData;
      const isNewRow = rowData.__isDummy ? true : false;

      if (oldValue === newValue.value) {
        setEditingCell(null);
        return;
      }

      setIsLoading(true);
      const cellKey = `${rowIndex}-${String(columnId)}`;

      try {
        if (isNewRow) {
          setTableData((prev) => {
            const newData = [...prev];
            newData[rowIndex] = {
              ...newData[rowIndex],
              [columnId]: newValue.value,
            };
            return newData;
          });
          handleAutoSave(rowIndex, mutationKey, newValue, rowData);
        } else {
          if (config.editing?.onCellEdit) {
            const success = await config.editing.onCellEdit({
              rowIndex,
              columnId,
              newValue,
              oldValue,
              rowData,
            });
            if (success === false) {
              setIsLoading(false);
              return;
            }
          }

          if (config.editing?.columnUpdating?.beforeUpdate) {
            const shouldContinue =
              await config.editing.columnUpdating.beforeUpdate({
                columnId,
                newValue,
                rowData,
              });
            if (!shouldContinue) {
              setIsLoading(false);
              return;
            }
          }

          const updateResults: TData[] = [];

          if (config.editing?.columnUpdating?.coreUpdate) {
            const success = await config.editing.columnUpdating.coreUpdate({
              columnId,
              newValue,
              oldValue,
              rowData,
            });
            if (!success) {
              throw new Error("Core update handler failed");
            }
          }

          if (config.editing?.columnUpdating?.afterUpdate) {
            await config.editing.columnUpdating.afterUpdate({
              columnId,
              newValue,
              rowData,
              response: updateResults,
            });
          }
        }

        setApiErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[cellKey];
          return newErrors;
        });

        setEditingCell(null);
      } catch (error) {
        console.error("Cell update failed:", error);

        setApiErrors((prev) => ({
          ...prev,
          [cellKey]: error instanceof Error ? error.message : "Update failed",
        }));

        if (config.editing?.onApiError) {
          config.editing.onApiError({
            error,
            context: { operation: "update", rowIndex, columnId },
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [tableData, handleAutoSave, config.editing]
  );

  const handleCellCancel = useCallback(() => {
    setEditingCell(null);
  }, []);

  const handleAddNewRow = useCallback(() => {
    if (config.editing?.rowCreating?.addDummyRow) {
      config.editing.rowCreating.addDummyRow();
    }
  }, [config.editing?.rowCreating]);

  const onPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      if (typeof updaterOrValue === "function") {
        const newPagination = updaterOrValue(pagination);
        setPage(newPagination.pageIndex + 1);
        setPerPage(newPagination.pageSize);
        if (config.pagination?.onPaginationChange) {
          config.pagination.onPaginationChange(newPagination);
        }
      } else {
        setPage(updaterOrValue.pageIndex + 1);
        setPerPage(updaterOrValue.pageSize);
      }
    },
    [config.pagination, pagination]
  );

  const onGlobalFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (config.filtering?.onGlobalFilterChange) {
        config.filtering.onGlobalFilterChange(e.target.value);
      }
      setGlobalFilter(e.target.value);
    },
    [config.filtering]
  );

  const onColumnSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      if (typeof updaterOrValue === "function") {
        const newSorting = updaterOrValue(sorting);
        if (config.sorting?.onColumnSortingChange) {
          config.sorting.onColumnSortingChange(newSorting);
        }
        setSorting(newSorting);
      } else {
        setSorting(updaterOrValue);
      }
    },
    [config.sorting, sorting]
  );

  const onColumnFiltersChange = useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      setColumnFilters((prev) => {
        const next =
          typeof updaterOrValue === "function"
            ? updaterOrValue(prev)
            : updaterOrValue;

        setPage(1);

        if (config.filtering?.onColumnFilterChange) {
          config.filtering.onColumnFilterChange(next);
        }

        return next;
      });
    },
    [config.filtering]
  );

  const onColumnVisibilityChange = useCallback(
    (updaterOrValue: Updater<VisibilityState>) => {
      const newColumnVisibility =
        typeof updaterOrValue === "function"
          ? updaterOrValue(columnVisibility)
          : updaterOrValue;

      if (config.columnVisibility?.onColumnVisibilityChange) {
        config.columnVisibility.onColumnVisibilityChange(newColumnVisibility);
      }
      console.log(newColumnVisibility);
      setColumnVisibility(newColumnVisibility);
    },
    [columnVisibility, config.columnVisibility]
  );

  const columns = useMemo<ColumnDef<TData>[]>(() => {
    const selectionColumn: ColumnDef<TData> = {
      id: "select",
      accessorKey: "select",
      size: 40,
      enableSorting: false,
      enableColumnFilter: false,
      enableHiding: false,
      header: ({ table }) => (
        <div className="flex justify-center items-center">
          <Checkbox
            aria-label="Select all"
            className="-translate-x-1"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        </div>
      ),
      cell: ({ row }) => {
        const isDummyRow = row.original.__isDummy ?? false;
        if (isDummyRow)
          return (
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-5 w-5 border border-destructive rounded-full flex items-center justify-center mx-auto"
              onClick={() => {
                if (config.editing?.rowCreating?.removeDummyRow)
                  config.editing.rowCreating.removeDummyRow(row.original.id);
              }}
            >
              <X size={12} className="text-destructive" />
            </Button>
          );

        return (
          <div className="flex justify-center items-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
          </div>
        );
      },
    };

    const dataColumns: ColumnDef<TData>[] = config.columns.map((colConfig) => ({
      id: colConfig.id,
      accessorKey: colConfig.accessorKey,
      size: colConfig.width,
      enableColumnFilter:
        (config.filtering?.enabled && colConfig.filtering?.enabled) || false,
      enableSorting: (config.sorting?.enabled && colConfig.sortable) || false,
      enableHiding:
        (config.columnVisibility?.enabled && colConfig.hideable) || false,
      header: ({ column }) => (
        <ConfigTableColumnHeader
          column={column}
          columnConfig={colConfig}
          className="text-xs font-normal text-accent-foreground"
        />
      ),
      cell: ({ getValue, row }) => {
        const isDummyRow = row.original.__isDummy ?? false;
        const value = getValue() as CellData;
        const rowIndex = row.index;
        const isEditing =
          editingCell?.rowIndex === rowIndex &&
          editingCell?.columnId === colConfig.mutationKey;

        const cellProps = {
          value,
          isEditing,
          onEdit: config.editing?.enabled
            ? () => handleCellEdit(rowIndex, colConfig.mutationKey as string)
            : undefined,
          onSave: config.editing?.enabled
            ? (newValue: MetaCellData) =>
                handleCellSave(
                  rowIndex,
                  colConfig.accessorKey as keyof TData,
                  colConfig.mutationKey as keyof TData,
                  newValue
                )
            : undefined,
          onCancel: config.editing?.enabled ? handleCellCancel : undefined,
          columnConfig: colConfig,
        };

        switch (colConfig.type) {
          case "id":
            return (
              <TextCell<TData, keyof TData>
                {...cellProps}
                value={isDummyRow ? "" : value}
              />
            );
          case "text":
            return <TextCell<TData, keyof TData> {...cellProps} />;
          case "number":
            return <NumberCell<TData, keyof TData> {...cellProps} />;
          case "boolean":
            return <BooleanCell<TData, keyof TData> {...cellProps} />;
          case "single-select":
            return (
              <SingleSelectCell<TData, keyof TData>
                {...cellProps}
                options={colConfig.options || []}
              />
            );
          case "multi-select":
            return (
              <MultiSelectCell<TData, keyof TData>
                {...cellProps}
                options={colConfig.options || []}
              />
            );
          case "date":
            return <DateCell {...cellProps} />;
          case "auto-complete":
            return <AutoCompleteCell {...cellProps} />;
          case "icon-buttons":
            return <CellIconButtons {...cellProps} row={row.original} />;
          default:
            return <TextCell {...cellProps} />;
        }
      },
      meta: {
        label: colConfig.header,
      },
    }));

    return [selectionColumn, ...dataColumns];
  }, [
    config.columnVisibility?.enabled,
    config.columns,
    config.editing?.enabled,
    config.editing?.rowCreating,
    config.filtering?.enabled,
    config.sorting?.enabled,
    editingCell?.columnId,
    editingCell?.rowIndex,
    handleCellCancel,
    handleCellEdit,
    handleCellSave,
  ]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: onColumnSortingChange,
    onColumnFiltersChange: onColumnFiltersChange,
    onColumnVisibilityChange: onColumnVisibilityChange,
    onPaginationChange: onPaginationChange,
    onGlobalFilterChange: setGlobalFilter,

    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      columnVisibility,
    },
    manualPagination: config.pagination?.enabled || false,
    manualSorting: config.sorting?.enabled || false,
    manualFiltering: config.filtering?.enabled || false,
  });

  return (
    <div className="space-y-1">
      {/* Global search */}
      {config.filtering?.enabled && config.filtering?.globalSearch && (
        <div className=" items-center space-x-2 hidden">
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={onGlobalFilterChange}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="">
        <div className="flex items-center justify-end py-2 space-x-3">
          {isLoading && (
            <div className="flex items-center space-x-2 mr-auto">
              <span className="text-xs text-muted-foreground font-normal">
                Saving...
              </span>
            </div>
          )}
          <ConfigTableColumnHider table={table} />
          {config.editing?.rowCreating?.enabled && (
            <Button size={"sm"} variant={"outline"} onClick={handleAddNewRow}>
              <span className="text-xs font-normal">
                Add {config.tableName ? <>{config.tableName}</> : null}
              </span>
            </Button>
          )}
        </div>
        <Table className="border">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-0">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {config.pagination?.enabled && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-xs font-normal">Rows per page</p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-16 font-normal text-xs border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="items-center space-x-2 hidden">
              <p className="text-xs font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0 hidden"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-xs font-normal">
                Page {table.getState().pagination.pageIndex + 1}
              </p>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={
                  table.getRowCount() < table.getState().pagination.pageSize ||
                  table.getRowCount() === 0
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                className="h-8 w-8 p-0 hidden"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurableTable;
