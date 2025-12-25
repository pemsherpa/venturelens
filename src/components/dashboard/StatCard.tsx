import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "text-primary",
}: StatCardProps) {
  return (
    <div className="glass-card-hover rounded-2xl p-6 gradient-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium mt-2",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl bg-primary/10 border border-primary/20", iconColor)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
