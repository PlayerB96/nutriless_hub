import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {children}
      <SpeedInsights /> {/* Colócalo aquí, al final o donde prefieras */}
    </div>
  );
}
