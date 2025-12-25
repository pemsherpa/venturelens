import { useEffect, useState } from "react";
import { FileStack, TrendingUp, AlertTriangle, Zap, ChevronRight, ExternalLink } from "lucide-react";
import { VCLayout } from "@/components/layout/VCLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrustScoreBadge } from "@/components/dashboard/TrustScoreBadge";
import { PulseIndicator } from "@/components/dashboard/PulseIndicator";
import { AnomalyPanel } from "@/components/dashboard/AnomalyPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Startup {
  id: string;
  name: string;
  industry: string | null;
  ai_score: number;
  trust_signal: string | null;
  stage: string | null;
  funding_raised: string | null;
  description: string | null;
  founder_id: string;
}

interface StartupWithAnomalies extends Startup {
  anomalies: {
    type: "verified" | "warning" | "critical";
    message: string;
  }[];
}

export default function VCDashboardPage() {
  const { user } = useAuth();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<StartupWithAnomalies | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStartups(data || []);
    } catch (err) {
      console.error("Error fetching startups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartupClick = async (startup: Startup) => {
    try {
      const { data: anomalies, error } = await supabase
        .from("startup_anomalies")
        .select("*")
        .eq("startup_id", startup.id);

      if (error) throw error;

      setSelectedStartup({
        ...startup,
        anomalies: (anomalies || []).map((a) => ({
          type: a.type as "verified" | "warning" | "critical",
          message: a.message,
        })),
      });
    } catch (err) {
      console.error("Error fetching anomalies:", err);
      setSelectedStartup({
        ...startup,
        anomalies: [],
      });
    }
  };

  const getTrustSignal = (signal: string | null): "strong" | "moderate" | "weak" => {
    if (signal === "strong") return "strong";
    if (signal === "moderate") return "moderate";
    return "weak";
  };

  const avgScore = startups.length > 0
    ? Math.round(startups.reduce((sum, s) => sum + (s.ai_score || 0), 0) / startups.length)
    : 0;

  const highRiskCount = startups.filter((s) => (s.ai_score || 0) < 40).length;

  return (
    <VCLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, <span className="text-gradient">Investor</span>
          </h1>
          <p className="text-muted-foreground">
            Your AI-powered deal flow intelligence at a glance
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Startups"
            value={startups.length}
            change="In your deal flow"
            changeType="neutral"
            icon={FileStack}
          />
          <StatCard
            title="Average Trust Score"
            value={`${avgScore}%`}
            change="Across all decks"
            changeType="neutral"
            icon={TrendingUp}
          />
          <StatCard
            title="High-Risk Alerts"
            value={highRiskCount}
            change={highRiskCount > 0 ? "Requires attention" : "All clear"}
            changeType={highRiskCount > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
          />
          <StatCard
            title="AI Analysis Queue"
            value={0}
            change="Ready for analysis"
            changeType="neutral"
            icon={Zap}
          />
        </div>

        {/* Deal Flow Table */}
        <div className="glass-card rounded-2xl overflow-hidden gradient-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Deal Flow</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-analyzed startups in your pipeline
                </p>
              </div>
              <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                View all <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">Loading startups...</p>
              </div>
            ) : startups.length === 0 ? (
              <div className="p-12 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No startups yet</h3>
                <p className="text-muted-foreground">
                  Startups will appear here when founders upload their pitch decks.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Startup
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Industry
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      AI Score
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Trust Signal
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Stage
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground">
                      Funding
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {startups.map((startup, index) => (
                    <tr
                      key={startup.id}
                      onClick={() => handleStartupClick(startup)}
                      className={cn(
                        "border-b border-border/50 cursor-pointer transition-all duration-200 hover:bg-secondary/20",
                        "animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <span className="text-sm font-semibold text-primary">
                              {startup.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-foreground">{startup.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-lg">
                          {startup.industry || "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <TrustScoreBadge score={startup.ai_score || 0} />
                      </td>
                      <td className="py-4 px-6">
                        <PulseIndicator status={getTrustSignal(startup.trust_signal)} />
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {startup.stage || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-foreground">
                        {startup.funding_raised || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selectedStartup && (
          <AnomalyPanel
            startup={{
              id: selectedStartup.id,
              name: selectedStartup.name,
              industry: selectedStartup.industry || "N/A",
              aiScore: selectedStartup.ai_score,
              trustSignal: getTrustSignal(selectedStartup.trust_signal),
              stage: selectedStartup.stage || "N/A",
              funding: selectedStartup.funding_raised || "N/A",
              anomalies: selectedStartup.anomalies,
            }}
            isOpen={!!selectedStartup}
            onClose={() => setSelectedStartup(null)}
          />
        )}
      </div>
    </VCLayout>
  );
}
