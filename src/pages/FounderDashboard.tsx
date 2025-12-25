import { MainLayout } from "@/components/layout/MainLayout";
import { RadarChart } from "@/components/founder/RadarChart";
import { ReadinessGauge } from "@/components/founder/ReadinessGauge";
import { FeedbackCard } from "@/components/founder/FeedbackCard";
import { VCInsightChat } from "@/components/founder/VCInsightChat";

const radarData = [
  { axis: "Team", value: 85, fullMark: 100 },
  { axis: "Market", value: 72, fullMark: 100 },
  { axis: "Product", value: 90, fullMark: 100 },
  { axis: "Traction", value: 65, fullMark: 100 },
  { axis: "Moat", value: 78, fullMark: 100 },
];

const feedbackItems = [
  {
    title: "Strengthen Market Size Claims",
    description: "Add third-party sources to validate your $4.2B TAM estimate. Consider citing Gartner or McKinsey reports.",
    priority: "high" as const,
    category: "Market",
  },
  {
    title: "Add Competitive Differentiation",
    description: "Your moat section needs clearer defensibility arguments. Highlight patents, network effects, or switching costs.",
    priority: "high" as const,
    category: "Moat",
  },
  {
    title: "Quantify Traction Metrics",
    description: "Include MRR growth rate, customer retention, and CAC/LTV ratios to demonstrate product-market fit.",
    priority: "medium" as const,
    category: "Traction",
  },
  {
    title: "Expand Team Credentials",
    description: "Add LinkedIn profiles and relevant experience highlights for key team members.",
    priority: "low" as const,
    category: "Team",
  },
  {
    title: "Clarify Use of Funds",
    description: "Break down the funding ask into specific allocation categories (engineering, marketing, operations).",
    priority: "medium" as const,
    category: "Financial",
  },
];

export default function FounderDashboard() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Pitch Deck <span className="text-gradient">Analysis</span>
          </h1>
          <p className="text-muted-foreground">
            AI-powered insights to maximize your fundraising success
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Radar Chart Card */}
            <div className="glass-card rounded-2xl p-6 gradient-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Pitch Strength Analysis
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    5-axis evaluation of your deck
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Your Score</span>
                </div>
              </div>
              <RadarChart data={radarData} />
            </div>

            {/* Feedback Feed */}
            <div className="glass-card rounded-2xl p-6 gradient-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    AI Feedback Feed
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Prioritized improvements for your pitch
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-lg border border-primary/20">
                  {feedbackItems.length} items
                </span>
              </div>
              <div className="space-y-4">
                {feedbackItems.map((item, index) => (
                  <FeedbackCard key={index} {...item} index={index} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Gauge & Chat */}
          <div className="space-y-6">
            {/* Readiness Gauge */}
            <div className="glass-card rounded-2xl p-6 gradient-border">
              <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
                Investor Readiness
              </h2>
              <ReadinessGauge percentage={74} />
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Team Score</span>
                  <span className="text-foreground font-medium">85%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Market Clarity</span>
                  <span className="text-foreground font-medium">72%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Traction Proof</span>
                  <span className="text-foreground font-medium">65%</span>
                </div>
              </div>
            </div>

            {/* VC Insight Chat */}
            <div className="h-[500px]">
              <VCInsightChat />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
