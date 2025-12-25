import { FounderLayout } from "@/components/layout/FounderLayout";
import { VCInsightChat } from "@/components/founder/VCInsightChat";

export default function FounderChatPage() {
  return (
    <FounderLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI <span className="text-gradient">Advisor</span>
          </h1>
          <p className="text-muted-foreground">Get personalized advice to improve your pitch.</p>
        </div>
        <div className="h-[600px]">
          <VCInsightChat />
        </div>
      </div>
    </FounderLayout>
  );
}
