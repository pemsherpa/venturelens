import { cn } from "@/lib/utils";

interface ReadinessGaugeProps {
  percentage: number;
  label?: string;
}

export function ReadinessGauge({ percentage, label = "Investor Ready" }: ReadinessGaugeProps) {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (pct: number) => {
    if (pct >= 80) return "text-success";
    if (pct >= 50) return "text-warning";
    return "text-destructive";
  };

  const getGradient = (pct: number) => {
    if (pct >= 80) return "stroke-success";
    if (pct >= 50) return "stroke-warning";
    return "stroke-destructive";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="180" height="180" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r="70"
            fill="none"
            stroke="hsl(230, 20%, 18%)"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="90"
            cy="90"
            r="70"
            fill="none"
            className={cn("transition-all duration-1000", getGradient(percentage))}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 10px hsl(var(--primary) / 0.4))`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-bold", getColor(percentage))}>
            {percentage}%
          </span>
          <span className="text-sm text-muted-foreground mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}
