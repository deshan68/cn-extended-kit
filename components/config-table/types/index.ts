import type {
  ColumnFiltersState,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SelectOption {
  label: string;
  value: string;
}

export type CellData = string | string[] | number | boolean;

export interface ColumnConfig<TData, TKey extends keyof TData = keyof TData> {
  id: string;
  header: string;
  accessorKey: TKey;
  type: "text" | "select" | "multiselect" | "number" | "boolean" | "date";
  width?: number;
  sortable?: boolean;
  filtering?: {
    enabled: boolean;
    filterType?: "text" | "number" | "select" | "date";
    filterOptions?: {
      value: string;
      label: string;
    }[];
  };
  editable?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface TableConfig<TData> {
  tableKey: string;
  columns: ColumnConfig<TData>[];
  data: TData[];

  pagination?: {
    enabled: boolean;
    pageSize: number;
    pageSizeOptions: number[];
    onPaginationChange?: (pagination: PaginationState) => void;
  };

  sorting?: {
    enabled: boolean;
    onColumnSortingChange?: (value: SortingState) => void;
  };

  filtering?: {
    enabled: boolean;
    globalSearch?: boolean;
    onGlobalFilterChange?: (value: string) => void;
    onColumnFilterChange?: (value: ColumnFiltersState) => void;
  };

  editing?: {
    enabled: boolean;
    idField: keyof TData;

    rowCreating?: {
      enabled: boolean;
      requiredFields?: (keyof TData)[];
      defaultValues?: Partial<TData>;
      autoSave?: boolean;
      autoSaveDelay?: number;
      customCreateHandler?: (newRowData: TData) => Promise<boolean>;
      onRowCreated?: (newRow: TData, response: any) => void;
      onCreateError?: (error: any, rowData: TData) => void;
    };

    columnUpdating?: {
      beforeUpdate?: (
        rowData: TData,
        columnId: keyof TData,
        newValue: any
      ) => Promise<boolean> | boolean;

      coreUpdate?: (
        rowData: TData,
        columnId: keyof TData,
        newValue: CellData,
        oldValue: CellData
      ) => Promise<boolean>;

      afterUpdate?: (
        rowData: TData,
        columnId: keyof TData,
        newValue: CellData,
        response: TData[]
      ) => Promise<void> | void;
    };

    onCellEdit?: (
      rowIndex: number,
      columnId: keyof TData,
      newValue: any,
      oldValue: any,
      rowData: TData
    ) => Promise<boolean> | boolean;

    onRowEdit?: (
      rowIndex: number,
      newData: TData,
      oldData: TData
    ) => Promise<boolean> | boolean;

    onApiError?: (
      error: any,
      context: { operation: string; rowIndex: number; columnId?: keyof TData }
    ) => void;
  };
}
