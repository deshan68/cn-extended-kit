import type {
  ColumnConfig,
  MetaCellData,
  SelectOption,
} from "@/components/config-table/types";
import { ConfigTableInlineEditor } from "@/components/config-table/components";
import { Badge } from "@/components/ui/badge";

export const MultiSelectCell = <TData, TKey extends keyof TData>({
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
  onSave: ((newValue: MetaCellData) => Promise<void>) | undefined;
  onCancel?: () => void;
  columnConfig?: ColumnConfig<TData, TKey>;
}) => {
  if (isEditing && onSave && onCancel) {
    return (
      <ConfigTableInlineEditor
        value={value}
        onSave={onSave}
        onCancel={onCancel}
        type="multi-select"
        options={options}
      />
    );
  }

  if (!Array.isArray(value)) {
    return (
      <div
        className={`p-2 min-h-[32px] flex items-center cursor-pointer hover:bg-gray-50 ${
          columnConfig?.editable
            ? "border border-transparent hover:border-gray-200"
            : ""
        }`}
        onClick={columnConfig?.editable ? onEdit : undefined}
      >
        -
      </div>
    );
  }

  return (
    <div
      className={`p-2 min-h-[32px] flex items-center cursor-pointer hover:bg-gray-50 ${
        columnConfig?.editable
          ? "border border-transparent hover:border-gray-200"
          : ""
      }`}
      onClick={columnConfig?.editable ? onEdit : undefined}
    >
      <div className="flex flex-wrap gap-1">
        {value.map((val, index) => {
          const option = options.find((opt) => opt.value === val);

          return (
            <Badge
              key={index}
              variant={option ? "secondary" : "outline"}
              className="text-xs font-normal flex items-center"
              style={{
                backgroundColor: option?.color?.background,
                color: option?.color?.text,
              }}
            >
              {option?.icon && <option.icon className="mr-0.5 h-3 w-3" />}
              {option?.label || val || "-"}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
