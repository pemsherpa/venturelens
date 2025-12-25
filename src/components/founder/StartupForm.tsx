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

      // 2. Call n8n Webhook
      const webhookPayload = new FormData();
      webhookPayload.append("file", file); // Send binary file if n8n expects it
      webhookPayload.append("data", JSON.stringify({
        ...data,
        founder_id: user.id,
        deck_url: publicUrl
      }));

      // NOTE: Using a proxy approach or direct call depending on CORS. 
      // Trying direct call first as webhook-test usually allows it.
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
      if (!webhookUrl) {
        throw new Error("Webhook URL is not configured");
      }

      const n8nResponse = await fetch(webhookUrl, {
        method: "POST",
        body: webhookPayload,
      });

      if (!n8nResponse.ok) {
        throw new Error("AI Analysis failed. Please try again.");
      }

      const responseText = await n8nResponse.text();
      console.log("Raw Webhook Response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse webhook response:", e);
        // Fallback or throw informative error
        throw new Error(`Invalid response from AI: ${responseText.substring(0, 100)}...`);
      }

      console.log("Analysis Result:", result);

      // Expecting result to contain scores/analysis
      // Adjust structure based on actual n8n output. Assuming flat or nested 'scores'.
      const scores = result.scores || result.Scores || {};
      
      // Calculate AI score
      let aiScore = 0;
      const scoreValues = Object.values(scores).filter((v): v is number => typeof v === "number");
      if (scoreValues.length > 0) {
        aiScore = Math.round(scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length);
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
        // We could store the full analysis JSON if we add a column for it
      });

      if (dbError) throw dbError;

      // Store scores for the dashboard view
      sessionStorage.setItem("analysisScores", JSON.stringify(scores));

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

  // Full-screen loading overlay
  if (isSubmitting) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="text-center space-y-6 p-8">
          <div className="mx-auto h-24 w-24 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {submitStatus || "Processing..."}
            </h2>
            <p className="text-muted-foreground max-w-sm">
              Please wait while we analyze your pitch deck and save your startup details.
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-2.5 w-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

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
