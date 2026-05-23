import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TODO_STATUS_VALUES, TodoStatus } from "@ems-portal/types";

interface ITodoSelectProps {
  value?: TodoStatus;
  onChange: (value: TodoStatus) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TodoSelect({
  value,
  onChange,
  placeholder = "Select status",
  disabled,
}: ITodoSelectProps) {
  // Helper to format labels (e.g., "in-progress" -> "In Progress")
  const formatLabel = (status: TodoStatus) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as TodoStatus)}
      disabled={disabled}
    >
      <SelectTrigger className="w-45">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {TODO_STATUS_VALUES.map((status) => (
          <SelectItem key={status} value={status}>
            {formatLabel(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
