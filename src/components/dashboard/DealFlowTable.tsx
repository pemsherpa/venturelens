import { useState } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
import { TrustScoreBadge } from "./TrustScoreBadge";
import { PulseIndicator } from "./PulseIndicator";
import { AnomalyPanel } from "./AnomalyPanel";
import { cn } from "@/lib/utils";

interface Startup {
  id: string;
  name: string;
  industry: string;
  aiScore: number;
  trustSignal: "strong" | "moderate" | "weak";
  stage: string;
  funding: string;
  anomalies: {
    type: "verified" | "warning" | "critical";
    message: string;
  }[];
}

const mockStartups: Startup[] = [
  {
    id: "1",
    name: "NeuraTech AI",
    industry: "Artificial Intelligence",
    aiScore: 87,
    trustSignal: "strong",
    stage: "Series A",
    funding: "$12M",
    anomalies: [
      { type: "verified", message: "Founder background verified via LinkedIn" },
      { type: "verified", message: "Patent filings confirmed (3 active)" },
      { type: "verified", message: "Revenue claims match industry reports" },
      { type: "warning", message: "One advisor connection unverified" },
    ],
  },
  {
    id: "2",
    name: "QuantumShield",
    industry: "Cybersecurity",
    aiScore: 72,
    trustSignal: "moderate",
    stage: "Seed",
    funding: "$3.5M",
    anomalies: [
      { type: "verified", message: "Team credentials verified" },
      { type: "warning", message: "Market size claims need validation" },
      { type: "verified", message: "Customer testimonials verified" },
      { type: "warning", message: "Competitor analysis outdated (6 months)" },
    ],
  },
  {
    id: "3",
    name: "GreenFlow Energy",
    industry: "CleanTech",
    aiScore: 35,
    trustSignal: "weak",
    stage: "Pre-seed",
    funding: "$800K",
    anomalies: [
      { type: "critical", message: "Unable to verify founder previous exits" },
      { type: "critical", message: "Technology patent status unclear" },
      { type: "warning", message: "Traction metrics inconsistent with timeline" },
      { type: "verified", message: "Registered business entity confirmed" },
    ],
  },
  {
    id: "4",
    name: "MedInsight Pro",
    industry: "HealthTech",
    aiScore: 91,
    trustSignal: "strong",
    stage: "Series B",
    funding: "$28M",
    anomalies: [
      { type: "verified", message: "FDA approval documentation verified" },
      { type: "verified", message: "Clinical trial data matches publications" },
      { type: "verified", message: "Hospital partnerships confirmed" },
      { type: "verified", message: "Revenue growth trajectory validated" },
    ],
  },
  {
    id: "5",
    name: "FinStack",
    industry: "FinTech",
    aiScore: 58,
    trustSignal: "moderate",
    stage: "Series A",
    funding: "$8M",
    anomalies: [
      { type: "verified", message: "Banking licenses verified" },
      { type: "warning", message: "User growth claims under review" },
      { type: "critical", message: "One investor reference unresponsive" },
      { type: "verified", message: "Security certifications current" },
    ],
  },
];

export function DealFlowTable() {
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden gradient-border">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Deal Flow</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI-analyzed pitch decks awaiting review
              </p>
            </div>
            <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              View all <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
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
              {mockStartups.map((startup, index) => (
                <tr
                  key={startup.id}
                  onClick={() => setSelectedStartup(startup)}
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
                      {startup.industry}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <TrustScoreBadge score={startup.aiScore} />
                  </td>
                  <td className="py-4 px-6">
                    <PulseIndicator status={startup.trustSignal} />
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {startup.stage}
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-foreground">
                    {startup.funding}
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
        </div>
      </div>

      <AnomalyPanel
        startup={selectedStartup}
        isOpen={!!selectedStartup}
        onClose={() => setSelectedStartup(null)}
      />
    </>
  );
}
