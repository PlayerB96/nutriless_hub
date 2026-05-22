import { SpeedInsights } from "@vercel/speed-insights/next";

export default function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto w-full max-w-full px-3 py-6 tablet:px-5 tablet:py-8 desktop:max-w-7xl desktop:px-8 desktop:py-10">
      {children}
      <SpeedInsights /> {/* Colócalo aquí, al final o donde prefieras */}
    </div>
  );
}
