import { MainLayout } from "@/components/layout/MainLayout";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { TrustScoreBadge } from "@/components/dashboard/TrustScoreBadge";

const portfolioCompanies = [
  { name: "NeuraTech AI", industry: "AI/ML", invested: "$2.5M", score: 87, growth: "+24%", status: "Growing" },
  { name: "MedInsight Pro", industry: "HealthTech", invested: "$4M", score: 91, growth: "+18%", status: "Growing" },
  { name: "QuantumShield", industry: "Cybersecurity", invested: "$1.2M", score: 72, growth: "+8%", status: "Stable" },
  { name: "FinStack", industry: "FinTech", invested: "$3M", score: 58, growth: "-3%", status: "Monitoring" },
];

export default function Portfolio() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Portfolio <span className="text-gradient">Overview</span>
          </h1>
          <p className="text-muted-foreground">
            Track your active investments and their AI-monitored health scores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
            <p className="text-3xl font-bold text-foreground">$10.7M</p>
            <p className="text-sm text-success mt-2">Across 4 companies</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <p className="text-sm text-muted-foreground mb-1">Avg Trust Score</p>
            <p className="text-3xl font-bold text-foreground">77%</p>
            <p className="text-sm text-success mt-2">+5% this quarter</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <p className="text-sm text-muted-foreground mb-1">Portfolio Health</p>
            <p className="text-3xl font-bold text-success">Good</p>
            <p className="text-sm text-muted-foreground mt-2">1 needs attention</p>
          </div>
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <p className="text-sm text-muted-foreground mb-1">Monitoring Alerts</p>
            <p className="text-3xl font-bold text-warning">2</p>
            <p className="text-sm text-muted-foreground mt-2">Pending review</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden gradient-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground">Active Investments</h2>
          </div>
          <div className="divide-y divide-border">
            {portfolioCompanies.map((company, index) => (
              <div
                key={company.name}
                className="p-6 flex items-center gap-6 hover:bg-secondary/20 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{company.name}</p>
                  <p className="text-sm text-muted-foreground">{company.industry}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{company.invested}</p>
                  <p className="text-sm text-muted-foreground">Invested</p>
                </div>
                <TrustScoreBadge score={company.score} />
                <div className="flex items-center gap-1">
                  {company.growth.startsWith("+") ? (
                    <ArrowUpRight className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                  )}
                  <span className={company.growth.startsWith("+") ? "text-success" : "text-destructive"}>
                    {company.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
