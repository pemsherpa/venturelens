import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Compass, 
  Briefcase, 
  AlertTriangle, 
  Settings, 
  Upload,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Discovery", path: "/", icon: Compass },
  { title: "Portfolio", path: "/portfolio", icon: Briefcase },
  { title: "Anomaly Alerts", path: "/alerts", icon: AlertTriangle },
  { title: "Upload Deck", path: "/upload", icon: Upload },
  { title: "Founder View", path: "/founder", icon: TrendingUp },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-foreground">
              VentureLens
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-sidebar-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-primary"
                )}
              />
              {!collapsed && <span>{item.title}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-card rounded-xl p-4 gradient-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">AI Ready</span>
            </div>
            <p className="text-xs text-muted-foreground">
              3 decks queued for analysis
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
