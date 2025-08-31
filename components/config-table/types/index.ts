import type {
  ColumnFiltersState,
  PaginationState,
  RowData,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { LucideProps } from "lucide-react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
  }
}

type LucidIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SelectOption {
  label: string;
  value: string;
  icon?: LucidIcon;
  color?: {
    background: `#${string}`;
    text: `#${string}`;
  };
  meta?: Record<string, string | number>;
}

export type CellData = string | string[] | number | boolean;

export type MetaCellData = {
  value: CellData;
  meta?: Record<string, string | number>;
};

export interface ColumnConfig<TData, TKey extends keyof TData = keyof TData> {
  id: string;
  header: string;
  accessorKey: TKey;
  mutationKey: TKey;
  type:
    | "id"
    | "text"
    | "single-select"
    | "multi-select"
    | "number"
    | "boolean"
    | "date"
    | "auto-complete"
    | "icon-buttons";
  options?: SelectOption[];
  width?: number;
  sortable?: boolean;
  hideable?: boolean;
  editable?: boolean;
  placeholder?: string;
  asyncOptions?: {
    fetchOptions: (query: string) => Promise<SelectOption[]>;
    debounceMs?: number;
    minSearchChars?: number;
  };
  filtering?: {
    enabled: boolean;
    filterOptions?: SelectOption[];
    filterType?:
      | "text"
      | "number"
      | "single-select"
      | "multi-select"
      | "date"
      | "auto-complete";
    asyncOptions?: {
      debounceMs?: number;
      minSearchChars?: number;
      fetchOptions: (query: string) => Promise<SelectOption[]>;
    };
  };
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  iconButtons?: {
    Icon: LucidIcon;
    tooltip?: string;
    onClick: (row: TData) => void;
    disabled?: (row: TData) => boolean;
  }[];
}

export interface TableConfig<TData> {
  columns: ColumnConfig<TData>[];
  data: TData[];
  tableName?: string;

  pagination?: {
    enabled: boolean;
    pageSize: number;
    pageSizeOptions: number[];
    initialState?: PaginationState;
    onPaginationChange?: (value: PaginationState) => void;
  };

  sorting?: {
    enabled: boolean;
    initialState?: SortingState;
    onColumnSortingChange?: (value: SortingState) => void;
  };

  filtering?: {
    enabled: boolean;
    globalSearch?: boolean;
    initialState?: ColumnFiltersState;
    onGlobalFilterChange?: (value: string) => void;
    onColumnFilterChange?: (value: ColumnFiltersState) => void;
  };

  columnVisibility?: {
    enabled: boolean;
    initialState?: VisibilityState;
    onColumnVisibilityChange?: (value: VisibilityState) => void;
  };

  editing?: {
    enabled: boolean;

    rowCreating?: {
      enabled: boolean;
      requiredFields?: (keyof TData)[];
      defaultValues?: Partial<TData>;
      autoSave?: boolean;
      autoSaveDelay?: number;
      addDummyRow?: () => void;
      removeDummyRow?: (tempId: string) => void;

      beforeCreate?: (params: {
        newValue: MetaCellData;
        columnId: keyof TData;
        newRow: TData;
      }) => Promise<boolean> | boolean;

      coreCreate?: (params: {
        newValue: MetaCellData;
        columnId: keyof TData;
        newRow: TData;
      }) => Promise<boolean>;
      afterCreate?: (params: { newRow: TData }) => void;
      onCreateError?: (params: { error: any; rowData: TData }) => void;
    };

    columnUpdating?: {
      beforeUpdate?: (params: {
        newValue: MetaCellData;
        columnId: keyof TData;
        rowData: TData;
      }) => Promise<boolean> | boolean;

      coreUpdate?: (params: {
        oldValue: CellData;
        newValue: MetaCellData;
        columnId: keyof TData;
        rowData: TData;
      }) => Promise<boolean>;

      afterUpdate?: (params: {
        newValue: MetaCellData;
        columnId: keyof TData;
        rowData: TData;
        response: TData[];
      }) => Promise<void> | void;
    };

    onCellEdit?: (params: {
      rowIndex: number;
      oldValue: CellData;
      newValue: MetaCellData;
      columnId: keyof TData;
      rowData: TData;
    }) => Promise<boolean> | boolean;

    onRowEdit?: (params: {
      newRow: TData;
      oldRow: TData;
      rowIndex: number;
    }) => Promise<boolean> | boolean;

    onApiError?: (params: {
      error: any;
      context: { operation: string; rowIndex: number; columnId?: keyof TData };
    }) => void;
  };
}
