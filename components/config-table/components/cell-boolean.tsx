import type { ColumnConfig, MetaCellData } from "@/components/config-table/types";
import { ConfigTableInlineEditor } from "@/components/config-table/components";
import { Checkbox } from "@/components/ui/checkbox";

export const BooleanCell = <TData, TKey extends keyof TData>({
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  columnConfig,
}: {
  value: string | string[] | number | boolean;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave:
    | ((newValue: MetaCellData) => Promise<void>)
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
        type="boolean"
      />
    );
  }

  return (
    <div
      className={`p-2 min-h-[32px] flex items-center justify-center cursor-pointer hover:bg-gray-50 ${
        columnConfig?.editable
          ? "border border-transparent hover:border-gray-200"
          : ""
      }`}
      onClick={columnConfig?.editable ? onEdit : undefined}
    >
      <Checkbox checked={Boolean(value)} disabled />
    </div>
  );
};
