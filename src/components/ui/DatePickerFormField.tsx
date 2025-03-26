
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

interface DatePickerFormFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function DatePickerFormField({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  placeholder = "Select date",
  className
}: DatePickerFormFieldProps) {
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
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
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
