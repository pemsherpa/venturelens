import { useEffect, useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { VCLayout } from "@/components/layout/VCLayout";
import { TrustScoreBadge } from "@/components/dashboard/TrustScoreBadge";
import { supabase } from "@/integrations/supabase/client";

interface Startup {
  id: string;
  name: string;
  industry: string | null;
  ai_score: number;
  stage: string | null;
  funding_raised: string | null;
}

export default function VCPortfolio() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      const { data, error } = await supabase
        .from("startups")
        .select("*")
        .gte("ai_score", 60)
        .order("ai_score", { ascending: false });

      if (error) throw error;
      setStartups(data || []);
    } catch (err) {
      console.error("Error fetching startups:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalFunding = startups.reduce((sum, s) => {
    const funding = s.funding_raised?.replace(/[^0-9.]/g, "");
    return sum + (parseFloat(funding || "0") || 0);
  }, 0);

  const avgScore = startups.length > 0
    ? Math.round(startups.reduce((sum, s) => sum + (s.ai_score || 0), 0) / startups.length)
    : 0;

  return (
    <VCLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Portfolio <span className="text-gradient">Overview</span>
          </h1>
          <p className="text-muted-foreground">
            Track high-scoring startups and their AI-monitored health
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <p className="text-sm text-muted-foreground mb-1">Top Startups</p>
            <p className="text-3xl font-bold text-foreground">{startups.length}</p>
            <p className="text-sm text-success mt-2">Score 60% or higher</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <p className="text-sm text-muted-foreground mb-1">Avg Trust Score</p>
            <p className="text-3xl font-bold text-foreground">{avgScore}%</p>
            <p className="text-sm text-success mt-2">High quality pipeline</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <p className="text-sm text-muted-foreground mb-1">Portfolio Health</p>
            <p className="text-3xl font-bold text-success">Good</p>
            <p className="text-sm text-muted-foreground mt-2">AI monitored</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <p className="text-sm text-muted-foreground mb-1">Active Alerts</p>
            <p className="text-3xl font-bold text-warning">0</p>
            <p className="text-sm text-muted-foreground mt-2">All clear</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden gradient-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Top Performing Startups</h2>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : startups.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No high-scoring startups yet</h3>
              <p className="text-muted-foreground">
                Startups with trust scores above 60% will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {startups.map((startup, index) => (
                <div
                  key={startup.id}
                  className="p-6 flex items-center gap-6 hover:bg-secondary/20 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{startup.name}</p>
                    <p className="text-sm text-muted-foreground">{startup.industry || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{startup.funding_raised || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">Raised</p>
                  </div>
                  <TrustScoreBadge score={startup.ai_score || 0} />
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span className="text-success">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </VCLayout>
  );
}
