import { FileStack, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { DealFlowTable } from "@/components/dashboard/DealFlowTable";

export default function VCDashboard() {
  return (
    <MainLayout>
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
            title="Total Decks Processed"
            value={147}
            change="+12 this week"
            changeType="positive"
            icon={FileStack}
          />
          <StatCard
            title="Average Trust Score"
            value="73%"
            change="+5% vs last month"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="High-Risk Alerts"
            value={8}
            change="3 require attention"
            changeType="negative"
            icon={AlertTriangle}
          />
          <StatCard
            title="AI Analysis Queue"
            value={3}
            change="Processing now..."
            changeType="neutral"
            icon={Zap}
          />
        </div>

        {/* Deal Flow Table */}
        <DealFlowTable />
      </div>
    </MainLayout>
  );
}
