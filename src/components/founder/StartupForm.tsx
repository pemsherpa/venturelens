import { useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, FileText, CheckCircle, Loader2, Link, Globe, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type UploadState = "idle" | "dragover" | "selected" | "error";

interface AnalysisScores {
  Team?: number;
  Market?: number;
  Product?: number;
  Traction?: number;
  Moat?: number;
  [key: string]: number | undefined;
}

interface StartupFormProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Company name is required").max(100),
  description: z.string().max(500).optional(),
  industry: z.string().min(1, "Industry is required"),
  stage: z.string().min(1, "Stage is required"),
  website_url: z.string().url("Please enter a valid URL").or(z.literal("")).optional(),
  linkedin_url: z.string().url("Please enter a valid LinkedIn URL").or(z.literal("")).optional(),
});

type FormData = z.infer<typeof formSchema>;

const industries = [
  "AI/ML",
  "Fintech",
  "Healthcare",
  "SaaS",
  "E-commerce",
  "Edtech",
  "Climate Tech",
  "Cybersecurity",
  "Web3/Crypto",
  "Other",
];

const stages = [
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C+",
];

export function StartupForm({ onSuccess }: StartupFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string>("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      industry: "",
      stage: "",
      website_url: "",
      linkedin_url: "",
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (uploadState === "idle" || uploadState === "error") {
      setUploadState("dragover");
    }
  }, [uploadState]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (uploadState === "dragover") {
      setUploadState("idle");
    }
  }, [uploadState]);

  const handleFileSelection = useCallback((selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }
    setFile(selectedFile);
    setUploadState("selected");
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelection(droppedFile);
    } else {
      setUploadState("idle");
    }
  }, [handleFileSelection]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  }, [handleFileSelection]);

  const resetUpload = () => {
    setUploadState("idle");
    setFile(null);
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please sign in to submit your startup.",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "Missing Pitch Deck",
        description: "Please upload your pitch deck (PDF).",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("Uploading pitch deck...");

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pitch_decks')
        .upload(fileName, file, {
          upsert: false
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pitch_decks')
        .getPublicUrl(fileName);

      setSubmitStatus("Analyzing with AI...");

      // 2. Call n8n Webhooks (scores + anomalies in parallel)
      const webhookPayload = new FormData();
      webhookPayload.append("file", file);
      webhookPayload.append("data", JSON.stringify({
        ...data,
        founder_id: user.id,
        deck_url: publicUrl
      }));

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error("Webhook URL is not configured");
      }

      // Prepare all webhook calls
      const scoresPromise = fetch(webhookUrl, {
        method: "POST",
        body: webhookPayload,
      });

      // Anomalies webhook (optional - only called if configured)
      const anomaliesWebhookUrl = import.meta.env.VITE_N8N_ANOMALIES_WEBHOOK_URL;
      const anomaliesPayload = new FormData();
      anomaliesPayload.append("file", file);
      anomaliesPayload.append("data", JSON.stringify({
        ...data,
        founder_id: user.id,
        deck_url: publicUrl
      }));

      const anomaliesPromise = anomaliesWebhookUrl 
        ? fetch(anomaliesWebhookUrl, {
            method: "POST",
            body: anomaliesPayload,
          })
        : Promise.resolve(null);

      // Vector Store Ingestion webhook (optional - uploads PDF to vector store for RAG)
      const vectorStoreWebhookUrl = import.meta.env.VITE_N8N_VECTOR_STORE_WEBHOOK_URL;
      const vectorStorePayload = new FormData();
      vectorStorePayload.append("file", file);
      vectorStorePayload.append("data", JSON.stringify({
        ...data,
        founder_id: user.id,
        deck_url: publicUrl,
        startup_name: data.name
      }));

      const vectorStorePromise = vectorStoreWebhookUrl
        ? fetch(vectorStoreWebhookUrl, {
            method: "POST",
            body: vectorStorePayload,
          })
        : Promise.resolve(null);

      // Await all webhook responses in parallel
      const [n8nResponse, anomaliesResponse, vectorStoreResponse] = await Promise.all([
        scoresPromise, 
        anomaliesPromise,
        vectorStorePromise
      ]);

      // Log vector store response (fire-and-forget, but log for debugging)
      if (vectorStoreResponse && vectorStoreResponse.ok) {
        console.log("Vector store ingestion completed successfully");
      } else if (vectorStoreResponse && !vectorStoreResponse.ok) {
        console.warn("Vector store ingestion returned error:", vectorStoreResponse.status);
      }

      if (!n8nResponse.ok) {
        throw new Error("AI Analysis failed. Please try again.");
      }

      const responseText = await n8nResponse.text();
      console.log("Raw Scores Webhook Response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse webhook response:", e);
        throw new Error(`Invalid response from AI: ${responseText.substring(0, 100)}...`);
      }

      console.log("Scores Analysis Result:", result);

      // Process anomalies response if available
      let anomaliesResult = null;
      if (anomaliesResponse && anomaliesResponse.ok) {
        try {
          const anomaliesText = await anomaliesResponse.text();
          console.log("Raw Anomalies Webhook Response:", anomaliesText);
          anomaliesResult = JSON.parse(anomaliesText);
          console.log("Anomalies/Red Flags Result:", anomaliesResult);
        } catch (e) {
          console.error("Failed to parse anomalies webhook response:", e);
        }
      } else if (anomaliesResponse && !anomaliesResponse.ok) {
        console.warn("Anomalies webhook returned error:", anomaliesResponse.status);
      }

      // Helper to clean n8n expression artifacts (removes "=" prefix) and convert to number
      const cleanScore = (val: any): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const clean = val.startsWith('=') ? val.substring(1) : val;
          return parseFloat(clean) || 0;
        }
        return 0;
      };

      // Helper to clean string values (removes "=" prefix)
      const cleanString = (val: any): string => {
        if (typeof val !== 'string') return '';
        return val.startsWith('=') ? val.substring(1) : val;
      };

      // Get scores and reasoning from result
      const rawScores = result.scores || result.Scores || {};
      const rawReasoning = result.reasoning || result.Reasoning || {};

      // Map scores to dashboard expected format (scale 0-10 to 0-100)
      const mappedScores = {
        Team: cleanScore(rawScores.team_score) * 10,
        Market: cleanScore(rawScores.market_score) * 10,
        Product: cleanScore(rawScores.product_score) * 10,
        Traction: cleanScore(rawScores.traction_score) * 10 || 0,
        Moat: cleanScore(rawScores.moat_score) * 10 || 0,
      };

      // Map reasoning to dashboard expected format (cleaned strings)
      const mappedReasoning = {
        Team: cleanString(rawReasoning.team),
        Market: cleanString(rawReasoning.market),
        Product: cleanString(rawReasoning.product),
        Traction: cleanString(rawReasoning.traction) || '',
        Moat: cleanString(rawReasoning.moat) || '',
      };

      // Calculate AI score from overall_score or average
      let aiScore = 0;
      if (rawScores.overall_score) {
        aiScore = cleanScore(rawScores.overall_score) * 10;
      } else {
        const scoreValues = Object.values(mappedScores).filter((v): v is number => typeof v === 'number' && v > 0);
        if (scoreValues.length > 0) {
          aiScore = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);
        }
      }

      // Determine trust signal
      let trustSignal = "weak";
      if (aiScore >= 80) trustSignal = "strong";
      else if (aiScore >= 60) trustSignal = "moderate";

      setSubmitStatus("Saving startup details...");

      // 3. Save to Supabase Database
      const { error: dbError } = await supabase.from("startups").insert({
        name: data.name,
        description: data.description || null,
        industry: data.industry,
        stage: data.stage,
        website_url: data.website_url || null,
        linkedin_url: data.linkedin_url || null,
        founder_id: user.id,
        deck_url: publicUrl,
        ai_score: aiScore,
        trust_signal: trustSignal,
      });

      if (dbError) throw dbError;

      // Store scores for the dashboard view
      sessionStorage.setItem("analysisScores", JSON.stringify(mappedScores));
      
      // Store reasoning for the dashboard view
      sessionStorage.setItem("analysisReasoning", JSON.stringify(mappedReasoning));
      
      // Store anomalies for the dashboard view
      if (anomaliesResult) {
        sessionStorage.setItem("analysisAnomalies", JSON.stringify(anomaliesResult));
      }

      onSuccess?.();
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setSubmitStatus("");
    }
  };


  return (
    <div className="space-y-8">
      {/* Startup Details Form */}
      <div className="glass-card rounded-2xl p-6 gradient-border">
        <h2 className="text-xl font-semibold text-foreground mb-6">Startup Details</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Briefly describe what your startup does..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stages.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourcompany.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      LinkedIn URL
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://linkedin.com/company/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pitch Deck Upload Section */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Pitch Deck (PDF) *</Label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300",
                  uploadState === "idle" && "border-border hover:border-primary/50 bg-card/30",
                  uploadState === "dragover" && "border-primary bg-primary/5 scale-[1.01]",
                  uploadState === "selected" && "border-primary bg-primary/5",
                  uploadState === "error" && "border-destructive bg-destructive/5"
                )}
              >
                <div className="p-8 text-center">
                  {uploadState === "selected" && file ? (
                    <>
                      <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <FileText className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {file.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready to submit
                      </p>
                      <button 
                        type="button"
                        onClick={resetUpload}
                        className="text-sm text-primary hover:underline"
                      >
                        Change file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto mb-4 h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Upload className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        Drop your pitch deck here
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        or click to browse (PDF only)
                      </p>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium cursor-pointer transition-all text-sm">
                        <FileText className="h-4 w-4" />
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
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {submitStatus || "Submitting..."}
                  </>
                ) : (
                  "Submit Startup"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
