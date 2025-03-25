
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { ControllerRenderProps } from "react-hook-form";

interface DatePickerFormFieldProps {
  value?: Date | undefined;
  onChange?: (date: Date | undefined) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  field?: ControllerRenderProps<any, any>; // Add this field prop to support react-hook-form
}

export function DatePickerFormField({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  placeholder = "Select date",
  className,
  field
}: DatePickerFormFieldProps) {
  // Use field values if provided (for react-hook-form integration)
  const fieldValue = field?.value ? new Date(field.value) : value;
  const handleChange = (date: Date | undefined) => {
    if (field) {
      field.onChange(date ? format(date, 'yyyy-MM-dd') : null);
    }
    if (onChange) {
      onChange(date);
    }
  };

  return (
    <div className={className}>
      <Label className="mb-2 block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !fieldValue && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {fieldValue ? format(fieldValue, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={fieldValue}
            onSelect={handleChange}
            captionLayout="dropdown-buttons"
            fromYear={1950}
            toYear={new Date().getFullYear()}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DatePickerFormField;
