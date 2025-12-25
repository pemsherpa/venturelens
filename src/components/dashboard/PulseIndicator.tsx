import { cn } from "@/lib/utils";

interface PulseIndicatorProps {
  status: "strong" | "moderate" | "weak";
  label?: string;
}

export function PulseIndicator({ status, label }: PulseIndicatorProps) {
  const statusColors = {
    strong: "bg-success",
    moderate: "bg-warning",
    weak: "bg-destructive",
  };

  const statusLabels = {
    strong: "Strong Signal",
    moderate: "Moderate",
    weak: "Weak Signal",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span
          className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            statusColors[status]
          )}
        />
        <span
          className={cn(
            "relative inline-flex rounded-full h-3 w-3",
            statusColors[status]
          )}
        />
      </span>
      {label !== undefined ? (
        <span className="text-sm text-muted-foreground">{label}</span>
      ) : (
        <span className="text-sm text-muted-foreground">{statusLabels[status]}</span>
      )}
    </div>
  );
}
