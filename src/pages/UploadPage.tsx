import { MainLayout } from "@/components/layout/MainLayout";
import { UploadZone } from "@/components/upload/UploadZone";

export default function UploadPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Upload <span className="text-gradient">Pitch Deck</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Upload your pitch deck and let our AI analyze claims, verify facts,
            and generate comprehensive trust scores in seconds.
          </p>
        </div>

        <UploadZone />
      </div>
    </MainLayout>
  );
}
