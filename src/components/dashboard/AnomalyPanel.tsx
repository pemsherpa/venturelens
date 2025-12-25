import { X, CheckCircle, AlertTriangle, XCircle, Shield, Globe, Linkedin, FileText } from "lucide-react";
import { TrustScoreBadge } from "./TrustScoreBadge";
import { cn } from "@/lib/utils";

interface Anomaly {
  type: "verified" | "warning" | "critical";
  message: string;
}

interface Startup {
  id: string;
  name: string;
  industry: string;
  aiScore: number;
  trustSignal: "strong" | "moderate" | "weak";
  stage: string;
  funding: string;
  anomalies: Anomaly[];
  description?: string;
  website_url?: string;
  linkedin_url?: string;
  deck_url?: string;
}

interface AnomalyPanelProps {
  startup: Startup | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AnomalyPanel({ startup, isOpen, onClose }: AnomalyPanelProps) {
  if (!isOpen || !startup) return null;

  const getAnomalyIcon = (type: Anomaly["type"]) => {
    switch (type) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getAnomalyBg = (type: Anomaly["type"]) => {
    switch (type) {
      case "verified":
        return "bg-success/10 border-success/20";
      case "warning":
        return "bg-warning/10 border-warning/20";
      case "critical":
        return "bg-destructive/10 border-destructive/20";
    }
  };

  const verifiedCount = startup.anomalies.filter((a) => a.type === "verified").length;
  const warningCount = startup.anomalies.filter((a) => a.type === "warning").length;
  const criticalCount = startup.anomalies.filter((a) => a.type === "critical").length;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-lg bg-card border-l border-border z-50 animate-slide-in-right overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Anomaly Detection Report
                </h2>
                <p className="text-sm text-muted-foreground">{startup.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Score Overview */}
          <div className="p-6 border-b border-border">
            <div className="glass-card rounded-xl p-4 gradient-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Overall Trust Score
                </span>
                <TrustScoreBadge score={startup.aiScore} size="lg" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-2xl font-bold text-success">{verifiedCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Verified</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-2xl font-bold text-warning">{warningCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Warnings</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Critical</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="p-6 border-b border-border">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Company Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground w-20">Industry:</span>
                <span className="text-foreground bg-secondary/50 px-3 py-1 rounded-lg">{startup.industry}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground w-20">Stage:</span>
                <span className="text-foreground">{startup.stage}</span>
              </div>
              {startup.description && (
                <div className="text-sm">
                  <span className="text-muted-foreground block mb-1">Description:</span>
                  <p className="text-foreground text-sm leading-relaxed">{startup.description}</p>
                </div>
              )}
              {(startup.website_url || startup.linkedin_url || startup.deck_url) && (
                <div className="flex items-center gap-3 pt-2">
                  {startup.website_url && (
                    <a
                      href={startup.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm text-foreground transition-colors"
                    >
                      <Globe className="h-4 w-4 text-primary" />
                      Website
                    </a>
                  )}
                  {startup.linkedin_url && (
                    <a
                      href={startup.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm text-foreground transition-colors"
                    >
                      <Linkedin className="h-4 w-4 text-primary" />
                      LinkedIn
                    </a>
                  )}
                  {startup.deck_url && (
                    <a
                      href={startup.deck_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm text-foreground transition-colors"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      Pitch Deck
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Anomaly List */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Fact Check Results
            </h3>
            <div className="space-y-3">
              {startup.anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]",
                    getAnomalyBg(anomaly.type)
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {getAnomalyIcon(anomaly.type)}
                  <p className="text-sm text-foreground">{anomaly.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-medium text-foreground transition-colors">
                Request Review
              </button>
              <button className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 rounded-xl text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-colors">
                Schedule Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
