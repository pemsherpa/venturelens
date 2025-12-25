import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Zap, Mail, Lock, User, Building2, Rocket, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

type AuthMode = "login" | "signup";
type UserRole = "vc" | "founder";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("founder");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signUp, user, role: userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && userRole) {
      navigate(userRole === "vc" ? "/" : "/founder-home");
    }
  }, [user, userRole, navigate]);

  const validateForm = () => {
    try {
      if (mode === "signup") {
        authSchema.parse({ email, password, fullName });
      } else {
        authSchema.omit({ fullName: true }).parse({ email, password });
      }
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => {
          if (e.path[0]) {
            newErrors[e.path[0] as string] = e.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }
        toast({
          title: "Welcome to VentureLens!",
          description: "Your account has been created successfully.",
        });
        navigate(role === "vc" ? "/" : "/founder-home");
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
          return;
        }
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 glow-effect">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">VentureLens AI</span>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI-Powered <span className="text-gradient">Venture Intelligence</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Analyze pitch decks, verify claims, and make data-driven investment decisions with advanced AI.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <span className="text-success text-sm">✓</span>
              </div>
              <span>Automated claim verification</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <span className="text-success text-sm">✓</span>
              </div>
              <span>AI-powered trust scoring</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <span className="text-success text-sm">✓</span>
              </div>
              <span>Real-time anomaly detection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">VentureLens AI</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {mode === "login"
                ? "Sign in to continue to your dashboard"
                : "Join the venture intelligence revolution"}
            </p>
          </div>

          {/* Role Selection (Signup only) */}
          {mode === "signup" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("founder")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    role === "founder"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Rocket className="h-6 w-6" />
                  <span className="font-medium">Founder</span>
                  <span className="text-xs opacity-70">Building a startup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("vc")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    role === "vc"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Building2 className="h-6 w-6" />
                  <span className="font-medium">Investor</span>
                  <span className="text-xs opacity-70">Evaluating startups</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all",
                      errors.fullName ? "border-destructive" : "border-border"
                    )}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all",
                    errors.email ? "border-destructive" : "border-border"
                  )}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-secondary/50 border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all",
                    errors.password ? "border-destructive" : "border-border"
                  )}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                "Please wait..."
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
