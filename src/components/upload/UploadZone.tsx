import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, CheckCircle, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UploadState = "idle" | "dragover" | "uploading" | "scanning" | "complete" | "error";

interface AnalysisScores {
  Team?: number;
  Market?: number;
  Product?: number;
  Traction?: number;
  Moat?: number;
  [key: string]: number | undefined;
}

interface AnalysisResult {
  Scores?: AnalysisScores;
  scores?: AnalysisScores;
  [key: string]: any;
}

interface UploadZoneProps {
  onAnalysisComplete?: (scores: AnalysisScores) => void;
}

export function UploadZone({ onAnalysisComplete }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragover");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
  }, []);

  const uploadAndAnalyze = useCallback(async (file: File) => {
    setFileName(file.name);
    setState("uploading");
    setProgress(0);
    setErrorMessage("");
    setAnalysisResult(null);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 200);

    try {
      // Create form data with the file
      const formData = new FormData();
      formData.append("file", file);

      setState("scanning");
      setProgress(100);

      // Call the edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-deck`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const result: AnalysisResult = await response.json();
      console.log("Analysis result:", result);

      setAnalysisResult(result);
      setState("complete");

      // Extract scores (handle both "Scores" and "scores" keys)
      const scores = result.Scores || result.scores;
      if (scores && onAnalysisComplete) {
        onAnalysisComplete(scores);
      }

      toast({
        title: "Analysis Complete",
        description: "Your pitch deck has been analyzed successfully.",
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Upload error:", error);
      setState("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to analyze deck");
      
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze deck",
        variant: "destructive",
      });
    }
  }, [onAnalysisComplete, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      uploadAndAnalyze(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  }, [uploadAndAnalyze, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        uploadAndAnalyze(file);
      } else {
        toast({
          title: "Invalid file",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
      }
    }
  }, [uploadAndAnalyze, toast]);

  const resetUpload = () => {
    setState("idle");
    setFileName("");
    setProgress(0);
    setAnalysisResult(null);
    setErrorMessage("");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
          state === "idle" && "border-border hover:border-primary/50 bg-card/30",
          state === "dragover" && "border-primary bg-primary/5 scale-[1.02]",
          state === "uploading" && "border-primary/50 bg-card/50",
          state === "scanning" && "border-primary bg-primary/5",
          state === "complete" && "border-success bg-success/5",
          state === "error" && "border-destructive bg-destructive/5"
        )}
      >
        {/* Scanning animation overlay */}
        {state === "scanning" && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan opacity-75" />
          </div>
        )}

        <div className="p-12 text-center">
          {state === "idle" && (
            <>
              <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-effect">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Drop your pitch deck here
              </h3>
              <p className="text-muted-foreground mb-6">
                or click to browse files (PDF only)
              </p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium cursor-pointer transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
                <FileText className="h-5 w-5" />
                Select PDF
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </>
          )}

          {state === "dragover" && (
            <>
              <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-float">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Drop to upload
              </h3>
            </>
          )}

          {state === "uploading" && (
            <>
              <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Uploading {fileName}
              </h3>
              <div className="w-full max-w-xs mx-auto mt-4">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
              </div>
            </>
          )}

          {state === "scanning" && (
            <>
              <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse-glow">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                AI Analysis in Progress
              </h3>
              <p className="text-muted-foreground">
                Analyzing your pitch deck and generating insights...
              </p>
              <div className="flex items-center justify-center gap-1 mt-4">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </>
          )}

          {state === "complete" && (
            <>
              <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-success/20 border border-success/30 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Analysis Complete!
              </h3>
              <p className="text-muted-foreground mb-4">
                {fileName} has been processed successfully
              </p>
              
              {/* Display scores if available */}
              {analysisResult && (analysisResult.Scores || analysisResult.scores) && (
                <div className="mb-6 p-4 bg-secondary/30 rounded-xl">
                  <h4 className="text-sm font-medium text-foreground mb-3">Analysis Scores</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(analysisResult.Scores || analysisResult.scores || {}).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-lg font-bold text-primary">{value}%</p>
                        <p className="text-xs text-muted-foreground">{key}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={resetUpload}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all shadow-lg shadow-primary/25"
                >
                  Upload Another
                </button>
              </div>
            </>
          )}

          {state === "error" && (
            <>
              <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-destructive/20 border border-destructive/30 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Analysis Failed
              </h3>
              <p className="text-muted-foreground mb-6">
                {errorMessage || "Something went wrong. Please try again."}
              </p>
              <button
                onClick={resetUpload}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all shadow-lg shadow-primary/25"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Recent Uploads
        </h3>
        <div className="space-y-3">
          {["Series_A_Deck_v3.pdf", "Market_Analysis.pdf", "Team_Overview.pdf"].map(
            (file, index) => (
              <div
                key={file}
                className="glass-card rounded-xl p-4 flex items-center gap-4 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{file}</p>
                  <p className="text-xs text-muted-foreground">
                    Processed {index + 1} day{index > 0 ? "s" : ""} ago
                  </p>
                </div>
                <span className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-lg border border-success/20">
                  Complete
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
