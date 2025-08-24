import type { ColumnConfig } from "@/components/config-table/types";
import { ConfigTableInlineEditor } from "@/components/config-table/components";

export const TextCell = <TData, TKey extends keyof TData>({
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
        type="text"
        validation={columnConfig?.validation}
        placeholder={columnConfig?.placeholder}
      />
    );
  }

  return (
    <div
      className={`text-sm p-2 min-h-[32px] flex items-center cursor-pointer hover:bg-gray-50 ${
        columnConfig?.editable
          ? "border border-transparent hover:border-gray-200"
          : ""
      }`}
      onClick={columnConfig?.editable ? onEdit : undefined}
    >
      <>{value || "-"}</>
    </div>
  );
};
