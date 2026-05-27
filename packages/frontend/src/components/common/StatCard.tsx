import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  hint?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p
            className={`mt-1 text-xs ${trend.direction === "up" ? "text-green-600" : "text-red-600"}`}
          >
            {trend.direction === "up" ? "↑" : "↓"} {trend.value}
          </p>
        )}
        {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
