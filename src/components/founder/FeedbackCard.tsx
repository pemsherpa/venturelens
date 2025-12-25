import { Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackCardProps {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  index: number;
}

export function FeedbackCard({
  title,
  description,
  priority,
  category,
  index,
}: FeedbackCardProps) {
  const priorityColors = {
    high: "border-destructive/30 bg-destructive/5",
    medium: "border-warning/30 bg-warning/5",
    low: "border-success/30 bg-success/5",
  };

  const priorityBadgeColors = {
    high: "bg-destructive/20 text-destructive",
    medium: "bg-warning/20 text-warning",
    low: "bg-success/20 text-success",
  };

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] cursor-pointer group animate-fade-in",
        priorityColors[priority]
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Lightbulb className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {category}
            </span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                priorityBadgeColors[priority]
              )}
            >
              {priority}
            </span>
          </div>
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
      </div>
    </div>
  );
}
