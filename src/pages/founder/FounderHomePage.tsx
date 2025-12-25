import { useState, useEffect } from "react";
import { FounderLayout } from "@/components/layout/FounderLayout";
import { RadarChart } from "@/components/founder/RadarChart";
import { ReadinessGauge } from "@/components/founder/ReadinessGauge";
import { FeedbackCard } from "@/components/founder/FeedbackCard";
import { VCInsightChat } from "@/components/founder/VCInsightChat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, Globe, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalysisScores {
  Team?: number;
  Market?: number;
  Product?: number;
  Traction?: number;
  Moat?: number;
  [key: string]: number | undefined;
}

interface Startup {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  stage: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  ai_score: number | null;
  trust_signal: string | null;
  created_at: string;
}

const defaultRadarData = [
  { axis: "Team", value: 0, fullMark: 100 },
  { axis: "Market", value: 0, fullMark: 100 },
  { axis: "Product", value: 0, fullMark: 100 },
  { axis: "Traction", value: 0, fullMark: 100 },
  { axis: "Moat", value: 0, fullMark: 100 },
];

const feedbackItems = [
  { title: "Strengthen Market Size Claims", description: "Add third-party sources to validate your TAM estimate.", priority: "high" as const, category: "Market" },
  { title: "Add Competitive Differentiation", description: "Highlight patents, network effects, or switching costs.", priority: "high" as const, category: "Moat" },
  { title: "Quantify Traction Metrics", description: "Include MRR growth rate and CAC/LTV ratios.", priority: "medium" as const, category: "Traction" },
];

export default function FounderHomePage() {
  const { user } = useAuth();
  const [radarData, setRadarData] = useState(defaultRadarData);
  const [readinessScore, setReadinessScore] = useState(0);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStartup = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("startups")
          .select("*")
          .eq("founder_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Error fetching startup:", error);
        } else if (data) {
          setStartup(data);
          
          // If we have an AI score, calculate the readiness
          if (data.ai_score) {
            setReadinessScore(data.ai_score);
            setHasAnalysis(true);
          }
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Check for stored analysis scores from upload
    const storedScores = sessionStorage.getItem("analysisScores");
    if (storedScores) {
      try {
        const scores: AnalysisScores = JSON.parse(storedScores);
        
        const newRadarData = [
          { axis: "Team", value: scores.Team ?? 0, fullMark: 100 },
          { axis: "Market", value: scores.Market ?? 0, fullMark: 100 },
          { axis: "Product", value: scores.Product ?? 0, fullMark: 100 },
          { axis: "Traction", value: scores.Traction ?? 0, fullMark: 100 },
          { axis: "Moat", value: scores.Moat ?? 0, fullMark: 100 },
        ];
        
        setRadarData(newRadarData);
        
        const scoreValues = Object.values(scores).filter((v): v is number => typeof v === "number");
        const avgScore = scoreValues.length > 0 
          ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
          : 0;
        
        setReadinessScore(avgScore);
        setHasAnalysis(true);
        
        sessionStorage.removeItem("analysisScores");
        
        toast({
          title: "Analysis Loaded",
          description: "Your pitch deck analysis has been applied.",
        });
      } catch (error) {
        console.error("Error parsing stored scores:", error);
      }
    }

    fetchStartup();
  }, [user, toast]);

  if (loading) {
    return (
      <FounderLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </FounderLayout>
    );
  }

  return (
    <FounderLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {startup ? startup.name : "Your Startup"} <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            {hasAnalysis 
              ? "AI-powered analysis of your pitch deck"
              : startup 
                ? "Upload a pitch deck to see your AI analysis"
                : "Submit your startup to get started"}
          </p>
        </div>

        {/* Startup Info Card */}
        {startup && (
          <div className="glass-card rounded-2xl p-6 gradient-border mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{startup.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {startup.industry && (
                      <Badge variant="secondary">{startup.industry}</Badge>
                    )}
                    {startup.stage && (
                      <Badge variant="outline">{startup.stage}</Badge>
                    )}
                    {startup.trust_signal && (
                      <Badge 
                        variant={
                          startup.trust_signal === "strong" ? "default" :
                          startup.trust_signal === "moderate" ? "secondary" : "outline"
                        }
                      >
                        {startup.trust_signal} signal
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {startup.website_url && (
                  <a 
                    href={startup.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {startup.linkedin_url && (
                  <a 
                    href={startup.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Link className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
            {startup.description && (
              <p className="text-muted-foreground mt-4 text-sm">{startup.description}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 gradient-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Pitch Strength Analysis</h2>
                {!hasAnalysis && (
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Upload a deck to see analysis
                  </span>
                )}
              </div>
              <RadarChart data={radarData} />
            </div>
            <div className="glass-card rounded-2xl p-6 gradient-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">AI Feedback</h2>
              <div className="space-y-4">
                {feedbackItems.map((item, index) => (
                  <FeedbackCard key={index} {...item} index={index} />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 gradient-border">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Investor Readiness</h2>
              <ReadinessGauge percentage={readinessScore} />
              {hasAnalysis && (
                <div className="mt-6 space-y-3">
                  {radarData.map((item) => (
                    <div key={item.axis} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.axis}</span>
                      <span className="text-foreground font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="h-[400px]">
              <VCInsightChat />
            </div>
          </div>
        </div>
      </div>
    </FounderLayout>
  );
}
