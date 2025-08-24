import { SelectTrigger } from "@radix-ui/react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type Updater,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Plus,
} from "lucide-react";
import type { CellData, TableConfig } from "@/components/config-table/types";
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
} from "@/components/config-table/components";

export interface ConfigurableTableProps<TData> {
  config: TableConfig<TData>;
}

const ConfigurableTable = <TData,>({
  config,
}: ConfigurableTableProps<TData>) => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(config.pagination?.pageSize || 10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnId: string;
  } | null>(null);
  const [tableData, setTableData] = useState(config.data);
  const [isLoading, setIsLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<Record<string, string>>({});

  const pagination: PaginationState = useMemo(() => {
    return {
      pageIndex: page - 1,
      pageSize: perPage,
    };
  }, [page, perPage]);

  const handleCellEdit = useCallback((rowIndex: number, columnId: string) => {
    setEditingCell({ rowIndex, columnId });
    // Clear any existing error for this cell
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

  type CreatableRow = {
    __isNew?: boolean;
    __tempId?: string;
  } & TData;

  const handleAutoSave = useCallback(
    async (rowIndex: number, rowData: CreatableRow) => {
      if (!config.editing?.rowCreating?.autoSave) return;
      if (!checkRowReadyForCreation(rowData)) return;

      const cleanRowData = { ...rowData };
      delete cleanRowData.__isNew;
      delete cleanRowData.__tempId;

      try {
        // Remove internal fields before sending to API
        const cleanRowData = { ...rowData };
        delete cleanRowData.__isNew;
        delete cleanRowData.__tempId;

        let response;

        // Use custom create handler if provided
        if (config.editing?.rowCreating?.customCreateHandler) {
          response = await config.editing.rowCreating.customCreateHandler(
            cleanRowData
          );
        }

        // Update the row with the response (including new ID)
        if (!Array.isArray(response))
          throw new Error("Unexpected response format from POST");

        const updatedRow = { ...cleanRowData, ...response[0] };

        setTableData((prev) => {
          const newData = [...prev];
          newData[rowIndex] = { ...updatedRow };
          return newData;
        });

        // Clear any errors for this row
        setApiErrors((prev) => {
          const newErrors = { ...prev };
          config.columns.forEach((col) => {
            delete newErrors[`${rowIndex}-${col.id}`];
          });
          return newErrors;
        });

        // Call success callback
        if (config.editing?.rowCreating?.onRowCreated && response)
          config.editing.rowCreating.onRowCreated(updatedRow, response);
      } catch (error) {
        console.error("Row creation failed:", error);

        // Set error for the entire row
        setApiErrors((prev) => ({
          ...prev,
          [`${rowIndex}-row`]:
            error instanceof Error ? error.message : "Creation failed",
        }));

        // Call error callback
        if (config.editing?.rowCreating?.onCreateError) {
          config.editing.rowCreating.onCreateError(error, rowData);
        }
      }
    },
    [config.editing?.rowCreating, config.columns, checkRowReadyForCreation]
  );

  // Enhanced cell save handler with complex API scenarios
  const handleCellSave = useCallback(
    async (
      rowIndex: number,
      columnId: keyof TData,
      newValue: string | string[] | number | boolean
    ) => {
      const rowData = tableData[rowIndex] as CreatableRow;
      const oldValue = rowData[columnId] as CellData;
      const isNewRow = rowData.__isNew ? true : false;

      // Skip if value hasn't changed
      if (oldValue === newValue) {
        setEditingCell(null);
        return;
      }

      setIsLoading(true);
      const cellKey = `${rowIndex}-${String(columnId)}`;

      try {
        // Update local state first
        if (isNewRow) {
          handleAutoSave(rowIndex, rowData);

          setTableData((prev) => {
            const newData = [...prev];
            newData[rowIndex] = { ...newData[rowIndex], [columnId]: newValue };
            return newData;
          });
        } else {
          // Handle existing row updates (previous logic)
          // Call custom callback if provided
          if (config.editing?.onCellEdit) {
            const success = await config.editing.onCellEdit(
              rowIndex,
              columnId,
              newValue,
              oldValue,
              rowData
            );
            if (success === false) {
              setIsLoading(false);
              return;
            }
          }

          // Before update hook
          if (config.editing?.columnUpdating?.beforeUpdate) {
            const shouldContinue =
              await config.editing.columnUpdating.beforeUpdate(
                rowData,
                columnId,
                newValue
              );
            if (!shouldContinue) {
              setIsLoading(false);
              return;
            }
          }

          // Handle API updates for existing rows (previous complex logic)
          const updateResults: TData[] = [];

          // Custom update handler
          if (config.editing?.columnUpdating?.coreUpdate) {
            const success = await config.editing.columnUpdating.coreUpdate(
              rowData,
              columnId,
              newValue,
              oldValue
            );
            if (!success) {
              throw new Error("Custom update handler failed");
            }
          }

          // After update hook
          if (config.editing?.columnUpdating?.afterUpdate) {
            await config.editing.columnUpdating.afterUpdate(
              rowData,
              columnId,
              newValue,
              updateResults
            );
          }

          // Update existing row data
          setTableData((prev) => {
            const newData = [...prev];
            const dataIndex = rowIndex;
            newData[dataIndex] = {
              ...newData[dataIndex],
              [columnId]: newValue,
            };
            return newData;
          });
        }

        // Clear any existing error
        setApiErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[cellKey];
          return newErrors;
        });

        setEditingCell(null);
      } catch (error) {
        console.error("Cell update failed:", error);

        // Set error state
        setApiErrors((prev) => ({
          ...prev,
          [cellKey]: error instanceof Error ? error.message : "Update failed",
        }));

        // Call error callback if provided
        if (config.editing?.onApiError) {
          config.editing.onApiError(error, {
            operation: isNewRow ? "createRow" : "updateCell",
            rowIndex,
            columnId,
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
    const defaultValues = config.editing?.rowCreating?.defaultValues || {};
    const newRow = {
      __isNew: true,
      __tempId: `new${Date.now()}`,
      ...defaultValues,
      ...config.columns.reduce((acc, col) => {
        if (!(col.accessorKey in defaultValues)) {
          acc[col.accessorKey] =
            col.type === "boolean"
              ? (false as CreatableRow[keyof TData])
              : col.type === "multiselect"
              ? ([] as CreatableRow[keyof TData])
              : col.type === "number"
              ? (0 as CreatableRow[keyof TData])
              : ("" as CreatableRow[keyof TData]);
        }
        return acc;
      }, {} as CreatableRow),
    };

    setTableData((prev) => [newRow, ...prev]);
  }, [config.editing?.rowCreating?.defaultValues, config.columns]);

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

  // Create columns based on configuration
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
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="-translate-x-1"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center items-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
    };

    const dataColumns: ColumnDef<TData>[] = config.columns.map((colConfig) => ({
      id: colConfig.id,
      accessorKey: colConfig.accessorKey,
      size: colConfig.width,
      enableColumnFilter:
        (config.filtering?.enabled && colConfig.filtering?.enabled) || false,
      enableSorting: (config.sorting?.enabled && colConfig.sortable) || false,
      header: ({ column }) => (
        <ConfigTableColumnHeader column={column} columnConfig={colConfig} />
      ),
      cell: ({ getValue, row }) => {
        const value = getValue() as CellData;
        const rowIndex = row.index;
        const isEditing =
          editingCell?.rowIndex === rowIndex &&
          editingCell?.columnId === colConfig.id;

        const cellProps = {
          value,
          isEditing,
          onEdit: config.editing?.enabled
            ? () => handleCellEdit(rowIndex, colConfig.id)
            : undefined,
          onSave: config.editing?.enabled
            ? (newValue: CellData) =>
                handleCellSave(rowIndex, colConfig.id as keyof TData, newValue)
            : undefined,
          onCancel: config.editing?.enabled ? handleCellCancel : undefined,
          columnConfig: colConfig,
        };

        switch (colConfig.type) {
          case "text":
            return <TextCell<TData, keyof TData> {...cellProps} />;
          case "number":
            return <NumberCell<TData, keyof TData> {...cellProps} />;
          case "boolean":
            return <BooleanCell<TData, keyof TData> {...cellProps} />;
          case "select":
            return (
              <SingleSelectCell<TData, keyof TData>
                {...cellProps}
                options={colConfig.options || []}
              />
            );
          case "multiselect":
            return (
              <MultiSelectCell<TData, keyof TData>
                {...cellProps}
                options={colConfig.options || []}
              />
            );
          case "date":
            return <DateCell {...cellProps} />;
          default:
            return <TextCell {...cellProps} />;
        }
      },
    }));

    return [selectionColumn, ...dataColumns];
  }, [
    config.columns,
    config.editing?.enabled,
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
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: onColumnSortingChange,
    onColumnFiltersChange: onColumnFiltersChange,
    onPaginationChange: onPaginationChange,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    manualPagination: config.pagination?.enabled || false,
    manualSorting: config.sorting?.enabled || false,
    manualFiltering: config.filtering?.enabled || false,
  });

  return (
    <div className="space-y-4">
      {/* API Status */}
      {config.editing?.enabled && (
        <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-sm font-medium">
                Table: {config.tableKey}
              </span>
            </div>
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Saving...</span>
              </div>
            )}
          </div>

          <Button variant={"outline"} onClick={handleAddNewRow}>
            <Plus />
            Add new
          </Button>

          {Object.keys(apiErrors).length > 0 && (
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-sm font-medium">
                {Object.keys(apiErrors).length} error(s)
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setApiErrors({})}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Editing Status */}
      {config.editing?.enabled && editingCell && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 hidden">
          <div className="flex items-center space-x-2 text-blue-800">
            <Edit className="h-4 w-4" />
            <span className="text-sm font-medium">
              Editing{" "}
              {
                config.columns.find((col) => col.id === editingCell.columnId)
                  ?.header
              }
              in row {editingCell.rowIndex + 1}
            </span>
          </div>
        </div>
      )}

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
      <div className="rounded-md border">
        <Table>
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
            {table.getRowModel().rows?.length ? (
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
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {config.pagination.pageSizeOptions.map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
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
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
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
