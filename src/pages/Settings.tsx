import { MainLayout } from "@/components/layout/MainLayout";
import { User, Bell, Shield, Palette, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const settingsSections = [
  {
    icon: User,
    title: "Profile",
    description: "Manage your account details and preferences",
    settings: [
      { label: "Display Name", value: "John Investor", type: "text" },
      { label: "Email", value: "john@venturefund.com", type: "text" },
    ],
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure how you receive alerts",
    settings: [
      { label: "Email Alerts", enabled: true, type: "toggle" },
      { label: "Push Notifications", enabled: false, type: "toggle" },
      { label: "Weekly Digest", enabled: true, type: "toggle" },
    ],
  },
  {
    icon: Shield,
    title: "Security",
    description: "Protect your account",
    settings: [
      { label: "Two-Factor Authentication", enabled: true, type: "toggle" },
      { label: "Session Timeout", value: "30 minutes", type: "select" },
    ],
  },
  {
    icon: Zap,
    title: "AI Preferences",
    description: "Customize AI analysis behavior",
    settings: [
      { label: "Auto-scan New Decks", enabled: true, type: "toggle" },
      { label: "Deep Web Verification", enabled: true, type: "toggle" },
      { label: "Competitor Analysis", enabled: false, type: "toggle" },
    ],
  },
];

export default function Settings() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="space-y-6">
          {settingsSections.map((section, index) => (
            <div
              key={section.title}
              className="glass-card rounded-2xl p-6 gradient-border animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {section.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {section.settings.map((setting) => (
                  <div
                    key={setting.label}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {setting.label}
                    </span>
                    {setting.type === "toggle" && (
                      <Switch defaultChecked={setting.enabled} />
                    )}
                    {setting.type === "text" && (
                      <span className="text-sm text-muted-foreground">
                        {setting.value}
                      </span>
                    )}
                    {setting.type === "select" && (
                      <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                        {setting.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
