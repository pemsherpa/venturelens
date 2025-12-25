import { useState, useEffect } from "react";
import { FounderLayout } from "@/components/layout/FounderLayout";
import { RadarChart } from "@/components/founder/RadarChart";
import { ReadinessGauge } from "@/components/founder/ReadinessGauge";
import { VCInsightChat } from "@/components/founder/VCInsightChat";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2, Globe, Link, X, Lightbulb, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AnalysisScores {
  Team?: number;
  Market?: number;
  Product?: number;
  Traction?: number;
  Moat?: number;
  [key: string]: number | undefined;
}

interface AnalysisReasoning {
  Team?: string;
  Market?: string;
  Product?: string;
  Traction?: string;
  Moat?: string;
  [key: string]: string | undefined;
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

interface AnomalyData {
  success: boolean;
  anomaly: {
    id: string;
    startup_id: string;
    category: string;
    severity: string;
    description: string;
    claims: {
      deck?: string;
      website?: string;
      [key: string]: string | undefined;
    };
    created_at: string;
  };
}

interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: string;
  claims?: {
    deck?: string;
    website?: string;
  };
}

// Helper to clean n8n expression artifacts (removes "=" prefix)
const cleanValue = (val: string | undefined): string => {
  if (!val) return "";
  return val.startsWith("=") ? val.substring(1) : val;
};

// Helper to generate title from category
const generateAnomalyTitle = (category: string, severity: string): string => {
  const cleanCategory = cleanValue(category);
  const cleanSeverity = cleanValue(severity);
  const titles: Record<string, string> = {
    "market": "Market Claim Discrepancy",
    "team": "Team Information Issue",
    "product": "Product Claim Mismatch",
    "traction": "Traction Data Inconsistency",
    "moat": "Competitive Advantage Concern",
    "financial": "Financial Discrepancy",
    "legal": "Legal/Compliance Flag",
  };
  return titles[cleanCategory.toLowerCase()] || `${cleanSeverity.charAt(0).toUpperCase() + cleanSeverity.slice(1)} Priority Issue`;
};

const defaultRadarData = [
  { axis: "Team", value: 0, fullMark: 100 },
  { axis: "Market", value: 0, fullMark: 100 },
  { axis: "Product", value: 0, fullMark: 100 },
  { axis: "Traction", value: 0, fullMark: 100 },
  { axis: "Moat", value: 0, fullMark: 100 },
];

export default function FounderHomePage() {
  const { user } = useAuth();
  const [radarData, setRadarData] = useState(defaultRadarData);
  const [readinessScore, setReadinessScore] = useState(0);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [reasoning, setReasoning] = useState<AnalysisReasoning>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
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
        
        const scoreValues = Object.values(scores).filter((v): v is number => typeof v === "number" && v > 0);
        const avgScore = scoreValues.length > 0 
          ? Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length)
          : 0;
        
        setReadinessScore(avgScore);
        setHasAnalysis(true);
        
        // Load reasoning if available
        const storedReasoning = sessionStorage.getItem("analysisReasoning");
        if (storedReasoning) {
          try {
            const reasoningData: AnalysisReasoning = JSON.parse(storedReasoning);
            setReasoning(reasoningData);
            sessionStorage.removeItem("analysisReasoning");
          } catch (e) {
            console.error("Error parsing stored reasoning:", e);
          }
        }

        // Load anomalies and convert to feedback items
        const storedAnomalies = sessionStorage.getItem("analysisAnomalies");
        if (storedAnomalies) {
          try {
            const anomalyData: AnomalyData = JSON.parse(storedAnomalies);
            
            if (anomalyData.success && anomalyData.anomaly) {
              const anomaly = anomalyData.anomaly;
              
              // Map severity to priority
              const severityToPriority = (sev: string): "high" | "medium" | "low" => {
                const cleanSev = cleanValue(sev).toLowerCase();
                if (cleanSev === "high" || cleanSev === "critical") return "high";
                if (cleanSev === "medium") return "medium";
                return "low";
              };
              
              // Create feedback item from anomaly
              const feedbackItem: FeedbackItem = {
                id: cleanValue(anomaly.id),
                title: generateAnomalyTitle(anomaly.category, anomaly.severity),
                description: cleanValue(anomaly.description),
                priority: severityToPriority(anomaly.severity),
                category: cleanValue(anomaly.category).charAt(0).toUpperCase() + cleanValue(anomaly.category).slice(1),
                claims: {
                  deck: cleanValue(anomaly.claims?.deck),
                  website: cleanValue(anomaly.claims?.website),
                },
              };
              
              setFeedbackItems([feedbackItem]);
            }
            
            sessionStorage.removeItem("analysisAnomalies");
          } catch (e) {
            console.error("Error parsing stored anomalies:", e);
          }
        }
        
        sessionStorage.removeItem("analysisScores");
        
        toast({
          title: "Analysis Loaded",
          description: "Your pitch deck analysis has been applied. Click on categories to see detailed reasoning.",
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
                {!hasAnalysis ? (
                  <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                    Upload a deck to see analysis
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-3 py-1 rounded-full">
                    Click categories to see reasoning
                  </span>
                )}
              </div>
              <RadarChart 
                data={radarData} 
                onCategoryClick={(category) => {
                  if (reasoning[category]) {
                    setSelectedCategory(category);
                  }
                }}
              />
            </div>
            <div className="glass-card rounded-2xl p-6 gradient-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">AI Feedback</h2>
                {feedbackItems.length > 0 && (
                  <span className="text-xs text-muted-foreground bg-warning/10 text-warning px-3 py-1 rounded-full">
                    {feedbackItems.length} issue{feedbackItems.length > 1 ? 's' : ''} found
                  </span>
                )}
              </div>
              <div className="space-y-4">
                {feedbackItems.length === 0 ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-success/5 border border-success/20">
                    <div className="p-2 rounded-xl bg-success/10">
                      <Lightbulb className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium">No Red Flags Detected</p>
                      <p className="text-sm text-muted-foreground">
                        {hasAnalysis ? "Your pitch deck passed our anomaly checks." : "Upload a pitch deck to see AI feedback."}
                      </p>
                    </div>
                  </div>
                ) : (
                  feedbackItems.map((item, index) => (
                    <div 
                      key={item.id || index}
                      onClick={() => setSelectedFeedback(item)}
                      className={`
                        glass-card rounded-xl p-5 border cursor-pointer transition-all duration-300 hover:scale-[1.02] group animate-fade-in
                        ${item.priority === 'high' ? 'border-destructive/30 bg-destructive/5' : 
                          item.priority === 'medium' ? 'border-warning/30 bg-warning/5' : 
                          'border-success/30 bg-success/5'}
                      `}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                          <AlertTriangle className={`h-5 w-5 ${
                            item.priority === 'high' ? 'text-destructive' : 
                            item.priority === 'medium' ? 'text-warning' : 'text-success'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {item.category}
                            </span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              item.priority === 'high' ? 'bg-destructive/20 text-destructive' : 
                              item.priority === 'medium' ? 'bg-warning/20 text-warning' : 
                              'bg-success/20 text-success'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                          <p className="text-xs text-primary mt-2 group-hover:underline">Click to see details →</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
                    <div 
                      key={item.axis} 
                      className={`flex items-center justify-between text-sm p-2 rounded-lg transition-all ${
                        reasoning[item.axis] 
                          ? 'cursor-pointer hover:bg-secondary/50' 
                          : ''
                      }`}
                      onClick={() => reasoning[item.axis] && setSelectedCategory(item.axis)}
                    >
                      <span className="text-muted-foreground flex items-center gap-2">
                        {item.axis}
                        {reasoning[item.axis] && (
                          <Lightbulb className="h-3 w-3 text-primary" />
                        )}
                      </span>
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

        {/* Reasoning Modal */}
        {selectedCategory && reasoning[selectedCategory] && (
          <>
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setSelectedCategory(null)}
            />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto glass-card rounded-2xl p-6 gradient-border z-50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedCategory} Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Score: {radarData.find(d => d.axis === selectedCategory)?.value ?? 0}%
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                <p className="text-foreground leading-relaxed">
                  {reasoning[selectedCategory]}
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </>
        )}

        {/* Feedback Details Modal */}
        {selectedFeedback && (
          <>
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setSelectedFeedback(null)}
            />
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto glass-card rounded-2xl p-6 gradient-border z-50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${
                    selectedFeedback.priority === 'high' ? 'bg-destructive/10 border-destructive/20' : 
                    selectedFeedback.priority === 'medium' ? 'bg-warning/10 border-warning/20' : 
                    'bg-success/10 border-success/20'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      selectedFeedback.priority === 'high' ? 'text-destructive' : 
                      selectedFeedback.priority === 'medium' ? 'text-warning' : 'text-success'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedFeedback.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{selectedFeedback.category}</Badge>
                      <Badge variant={
                        selectedFeedback.priority === 'high' ? 'destructive' : 
                        selectedFeedback.priority === 'medium' ? 'secondary' : 'outline'
                      }>
                        {selectedFeedback.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFeedback(null)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Issue Description</h4>
                  <p className="text-foreground leading-relaxed">
                    {selectedFeedback.description}
                  </p>
                </div>

                {selectedFeedback.claims && (selectedFeedback.claims.deck || selectedFeedback.claims.website) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Claims Comparison</h4>
                    
                    {selectedFeedback.claims.deck && (
                      <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="text-xs font-medium text-primary uppercase">Pitch Deck Says</span>
                        </div>
                        <p className="text-foreground text-sm">"{selectedFeedback.claims.deck}"</p>
                      </div>
                    )}
                    
                    {selectedFeedback.claims.website && (
                      <div className="bg-warning/5 rounded-xl p-4 border border-warning/20">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-warning"></div>
                          <span className="text-xs font-medium text-warning uppercase">Website Says</span>
                        </div>
                        <p className="text-foreground text-sm">"{selectedFeedback.claims.website}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setSelectedFeedback(null)}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </FounderLayout>
  );
}
