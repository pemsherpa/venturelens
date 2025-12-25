import { FounderSidebar } from "./FounderSidebar";

interface FounderLayoutProps {
  children: React.ReactNode;
}

export function FounderLayout({ children }: FounderLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <FounderSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
