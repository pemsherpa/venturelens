import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Upload, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { title: "Dashboard", path: "/founder-home", icon: Home },
  { title: "Upload Deck", path: "/founder-upload", icon: Upload },
  { title: "AI Advisor", path: "/founder-chat", icon: MessageSquare },
  { title: "Analytics", path: "/founder-analytics", icon: BarChart3 },
  { title: "Settings", path: "/founder-settings", icon: Settings },
];

export function FounderSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();

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

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20">
            Founder Dashboard
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 mt-2">
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

      {/* User & Logout */}
      <div className="absolute bottom-4 left-4 right-4 space-y-3">
        {!collapsed && user && (
          <div className="glass-card rounded-xl p-3">
            <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
            <p className="text-xs text-muted-foreground">Founder Account</p>
          </div>
        )}
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
