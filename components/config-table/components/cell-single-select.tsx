import type {
  ColumnConfig,
  SelectOption,
} from "@/components/config-table/types";
import { ConfigTableInlineEditor } from "@/components/config-table/components";
import { Badge } from "@/components/ui/badge";

export const SingleSelectCell = <TData, TKey extends keyof TData>({
  value,
  options,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  columnConfig,
}: {
  value: string | string[] | number | boolean;
  options: SelectOption[];
  isEditing?: boolean;
  onEdit?: () => void;
  onSave:
    | ((newValue: string | string[] | number | boolean) => Promise<void>)
    | undefined;
  onCancel?: () => void;
  columnConfig?: ColumnConfig<TData, TKey>;
}) => {
  if (isEditing && onSave && onCancel) {
    return (
      <ConfigTableInlineEditor
        value={value}
        onSave={onSave}
        onCancel={onCancel}
        type="select"
        options={options}
      />
    );
  }

  const option = options.find((opt) => opt.value === value);
  return (
    <div
      className={`p-2 min-h-[32px] flex items-center cursor-pointer hover:bg-gray-50 ${
        columnConfig?.editable
          ? "border border-transparent hover:border-gray-200"
          : ""
      }`}
      onClick={columnConfig?.editable ? onEdit : undefined}
    >
      <Badge variant={option ? "secondary" : "outline"}>
        <>{option?.label || value || "-"}</>
      </Badge>
    </div>
  );
};
