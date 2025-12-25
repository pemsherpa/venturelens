import { cn } from "@/lib/utils";

interface TrustScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function TrustScoreBadge({ score, size = "md" }: TrustScoreBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-success/20 text-success border-success/30";
    if (score >= 40) return "bg-warning/20 text-warning border-warning/30";
    return "bg-destructive/20 text-destructive border-destructive/30";
  };

  const getGlowColor = (score: number) => {
    if (score >= 70) return "shadow-success/20";
    if (score >= 40) return "shadow-warning/20";
    return "shadow-destructive/20";
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-lg border shadow-lg transition-all duration-200",
        getScoreColor(score),
        getGlowColor(score),
        sizeClasses[size],
        score < 40 && "animate-pulse"
      )}
    >
      {score}%
    </span>
  );
}
