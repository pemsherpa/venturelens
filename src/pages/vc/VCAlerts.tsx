import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, ExternalLink, Loader2 } from "lucide-react";
import { VCLayout } from "@/components/layout/VCLayout";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  startup_name: string;
  type: string;
  message: string;
  created_at: string;
}

export default function VCAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("startup_anomalies")
        .select(`
          id,
          type,
          message,
          created_at,
          startups (name)
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedAlerts = (data || []).map((a: any) => ({
        id: a.id,
        startup_name: a.startups?.name || "Unknown",
        type: a.type,
        message: a.message,
        created_at: a.created_at,
      }));

      setAlerts(formattedAlerts);
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = alerts.filter((a) => a.type === "critical").length;
  const warningCount = alerts.filter((a) => a.type === "warning").length;
  const verifiedCount = alerts.filter((a) => a.type === "verified").length;

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <VCLayout>
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
            <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border border-l-4 border-l-warning">
            <p className="text-sm text-muted-foreground mb-1">Warnings</p>
            <p className="text-3xl font-bold text-warning">{warningCount}</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border border-l-4 border-l-success">
            <p className="text-sm text-muted-foreground mb-1">Verified</p>
            <p className="text-3xl font-bold text-success">{verifiedCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center gradient-border">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No alerts</h3>
            <p className="text-muted-foreground">
              All startups in your pipeline are looking good!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className={cn(
                  "glass-card rounded-2xl p-6 gradient-border animate-fade-in transition-all hover:scale-[1.01]",
                  alert.type === "critical" && "border-l-4 border-l-destructive",
                  alert.type === "warning" && "border-l-4 border-l-warning",
                  alert.type === "verified" && "border-l-4 border-l-success"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-xl",
                      alert.type === "critical" && "bg-destructive/10",
                      alert.type === "warning" && "bg-warning/10",
                      alert.type === "verified" && "bg-success/10"
                    )}
                  >
                    {alert.type === "critical" && (
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    )}
                    {alert.type === "warning" && (
                      <Clock className="h-6 w-6 text-warning" />
                    )}
                    {alert.type === "verified" && (
                      <CheckCircle className="h-6 w-6 text-success" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-primary">
                        {alert.startup_name}
                      </span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(alert.created_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 capitalize">
                      {alert.type} Alert
                    </h3>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                  {alert.type !== "verified" && (
                    <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
                      Investigate <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </VCLayout>
  );
}
