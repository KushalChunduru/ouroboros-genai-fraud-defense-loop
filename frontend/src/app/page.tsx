import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import PillarsSection from "@/components/landing/PillarsSection";
import LoopSection from "@/components/landing/LoopSection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import TechStack from "@/components/landing/TechStack";
import FinalCTA from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      <Nav />
      <Hero />
      <ProblemSection />
      <PillarsSection />
      <LoopSection />
      <FeatureGrid />
      <TechStack />
      <FinalCTA />
      <footer className="text-center text-xs py-8 border-t" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
        Ouroboros — Mastercard Innovation Challenge @ GFF 2026 · synthetic data only, no real PII
      </footer>
    </div>
  );
}
