import { VCSidebar } from "./VCSidebar";

interface VCLayoutProps {
  children: React.ReactNode;
}

export function VCLayout({ children }: VCLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <VCSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
