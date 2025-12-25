import { MainLayout } from "@/components/layout/MainLayout";
import { AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: 1,
    company: "FinStack",
    type: "critical",
    title: "Investor Reference Unresponsive",
    description: "One of the listed investors could not be verified after 3 contact attempts.",
    time: "2 hours ago",
    resolved: false,
  },
  {
    id: 2,
    company: "GreenFlow Energy",
    type: "critical",
    title: "Patent Status Unclear",
    description: "Unable to verify technology patent claims through USPTO database.",
    time: "5 hours ago",
    resolved: false,
  },
  {
    id: 3,
    company: "QuantumShield",
    type: "warning",
    title: "Market Size Claims Need Validation",
    description: "TAM/SAM figures don't match latest industry reports.",
    time: "1 day ago",
    resolved: false,
  },
  {
    id: 4,
    company: "NeuraTech AI",
    type: "resolved",
    title: "Advisor Connection Verified",
    description: "Previously flagged advisor connection has been confirmed.",
    time: "2 days ago",
    resolved: true,
  },
];

export default function Alerts() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Anomaly <span className="text-gradient">Alerts</span>
          </h1>
          <p className="text-muted-foreground">
            AI-detected discrepancies requiring your attention
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 gradient-border border-l-4 border-l-destructive">
            <p className="text-sm text-muted-foreground mb-1">Critical</p>
            <p className="text-3xl font-bold text-destructive">2</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border border-l-4 border-l-warning">
            <p className="text-sm text-muted-foreground mb-1">Warnings</p>
            <p className="text-3xl font-bold text-warning">1</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border border-l-4 border-l-success">
            <p className="text-sm text-muted-foreground mb-1">Resolved</p>
            <p className="text-3xl font-bold text-success">1</p>
          </div>
        </div>

        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              className={cn(
                "glass-card rounded-2xl p-6 gradient-border animate-fade-in transition-all hover:scale-[1.01]",
                alert.type === "critical" && "border-l-4 border-l-destructive",
                alert.type === "warning" && "border-l-4 border-l-warning",
                alert.type === "resolved" && "border-l-4 border-l-success opacity-60"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  alert.type === "critical" && "bg-destructive/10",
                  alert.type === "warning" && "bg-warning/10",
                  alert.type === "resolved" && "bg-success/10"
                )}>
                  {alert.type === "critical" && <AlertTriangle className="h-6 w-6 text-destructive" />}
                  {alert.type === "warning" && <Clock className="h-6 w-6 text-warning" />}
                  {alert.type === "resolved" && <CheckCircle className="h-6 w-6 text-success" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary">{alert.company}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{alert.time}</span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
                {!alert.resolved && (
                  <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                    Investigate <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
