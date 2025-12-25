import { useState } from "react";
import { FounderLayout } from "@/components/layout/FounderLayout";
import { StartupForm } from "@/components/founder/StartupForm";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function FounderUploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmitSuccess = () => {
    toast({
      title: "Startup Saved",
      description: "Your startup information has been saved successfully.",
    });
    
    // Navigate to the dashboard after a short delay
    setTimeout(() => {
      navigate("/founder-home");
    }, 1500);
  };

  return (
    <FounderLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Submit Your <span className="text-gradient">Startup</span>
          </h1>
          <p className="text-muted-foreground">
            Add your startup details and upload your pitch deck for AI analysis.
          </p>
        </div>
        <StartupForm onSuccess={handleSubmitSuccess} />
      </div>
    </FounderLayout>
  );
}
