import type {
  ColumnConfig,
  SelectOption,
} from "@/components/config-table/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import React, { useState } from "react";

interface ConfigTableInlineEditorProps<TData, TKey extends keyof TData> {
  value: string | string[] | number | boolean;
  onSave:
    | ((newValue: string | string[] | number | boolean) => Promise<void>)
    | undefined;
  onCancel: () => void;
  type: ColumnConfig<TData, TKey>["type"];
  options?: SelectOption[];
  validation?: ColumnConfig<TData, TKey>["validation"];
  placeholder?: string;
}

export const ConfigTableInlineEditor = <TData, TKey extends keyof TData>({
  value,
  onSave,
  onCancel,
  type,
  options,
  validation,
  placeholder,
}: ConfigTableInlineEditorProps<TData, TKey>) => {
  const [editValue, setEditValue] = useState(value);
  const editValueRef = React.useRef(editValue);
  const [error, setError] = useState<string>("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (
      inputRef.current &&
      (type === "text" || type === "number" || type === "date")
    ) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [type]);

  const validateValue = (val: string | string[] | number | boolean): string => {
    if (validation?.required && (!val || val === "")) {
      return "Required";
    }

    if (type === "number" && validation) {
      const num = Number(val);
      if (validation.min !== undefined && num < validation.min) {
        return `Min: ${validation.min}`;
      }
      if (validation.max !== undefined && num > validation.max) {
        return `Max: ${validation.max}`;
      }
    }

    if (type === "text" && validation?.pattern) {
      const regex = new RegExp(validation.pattern);
      const stringVal = String(val);
      if (!regex.test(stringVal)) {
        return "Invalid format";
      }
    }

    return "";
  };

  const handleSave = async () => {
    const validationError = validateValue(editValue);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    try {
      await onSave?.(editValueRef.current);
    } catch (error) {
      console.error("Save failed:", error);
      setError("Save failed");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    if (!error) {
      handleSave();
    }
  };

  const handleMultiSelectChange = (optionValue: string) => {
    const currentValues = Array.isArray(editValue) ? editValue : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];
    setEditValue(newValues);
    editValueRef.current = newValues;
    handleSave();
  };

  switch (type) {
    case "text":
      return (
        <div className="w-full">
          <Input
            ref={inputRef}
            value={(editValue as string) || ""}
            onChange={(e) => {
              editValueRef.current = e.target.value;
              setEditValue(e.target.value);
            }}
            placeholder={placeholder}
            className={`w-full ${error ? "border-red-500" : "border-blue-500"}`}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        </div>
      );

    case "number":
      return (
        <div className="w-full">
          <Input
            ref={inputRef}
            type="number"
            value={(editValue as number) || ""}
            onChange={(e) => {
              editValueRef.current =
                e.target.value === "" ? "" : Number(e.target.value);
              setEditValue(editValueRef.current);
            }}
            placeholder={placeholder}
            className={`w-full ${error ? "border-red-500" : "border-blue-500"}`}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        </div>
      );

    case "date":
      return (
        <div className="w-full">
          <Input
            ref={inputRef}
            type="date"
            value={(editValue as string) || ""}
            onChange={(e) => {
              editValueRef.current = e.target.value;
              setEditValue(e.target.value);
            }}
            className={`w-full ${error ? "border-red-500" : "border-blue-500"}`}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center space-x-2 p-2">
          <Checkbox
            checked={Boolean(editValue)}
            onCheckedChange={(checked) => {
              setEditValue(checked);
              editValueRef.current = checked;
            }}
            onBlur={handleBlur}
          />
          <span className="text-sm">{editValue ? "True" : "False"}</span>
        </div>
      );

    case "select":
      return (
        <Select
          value={(editValue as string) || ""}
          onValueChange={(val) => {
            setEditValue(val);
            editValueRef.current = val;
            handleSave();
          }}
        >
          <SelectTrigger
            className={`w-full ${error ? "border-red-500" : "border-blue-500"}`}
          >
            <SelectValue placeholder="Select...">
              {
                options?.find((opt) => opt.label === editValue.toString())
                  ?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "multiselect": {
      const currentValues = Array.isArray(editValue) ? editValue : [];

      return (
        <div className="space-y-2 p-2 border border-blue-500 rounded">
          <div className="flex flex-wrap gap-1 min-h-[20px]">
            {currentValues.map((val) => {
              const option = options?.find((opt) => opt.value === val);
              return (
                <Badge key={val} variant="secondary" className="text-xs">
                  {option?.label || val}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleMultiSelectChange(val)}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              );
            })}
          </div>
          <Select onValueChange={handleMultiSelectChange}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Add..." />
            </SelectTrigger>
            <SelectContent>
              {options
                ?.filter((option) => !currentValues.includes(option.value))
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    default:
      return null;
  }
};
