import type { Metadata } from "next";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CoreFeatures } from "@/components/landing/CoreFeatures";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { StatsAndTech } from "@/components/landing/StatsAndTech";
import { TestimonialsFAQ } from "@/components/landing/TestimonialsFAQ";
import { CTAAndFooter } from "@/components/landing/CTAAndFooter";

export const metadata: Metadata = {
  title: "EduRisk AI — AI-Powered Student Dropout Risk Prediction",
  description:
    "EduRisk AI helps educational institutions predict and prevent student dropouts using machine learning, learning analytics, and early intervention. Purpose-built dashboards for Students, Faculty, and Administrators.",
  keywords: ["student dropout prediction", "AI education", "learning analytics", "early warning system", "edtech"],
  openGraph: {
    title: "EduRisk AI — AI-Powered Student Dropout Risk Prediction",
    description: "Predict dropout risks before they happen. Role-based dashboards for Students, Faculty, and Dean.",
    type: "website",
  },
};

export default function LandingPage() {
  return (
    <main className="font-sans antialiased overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProblemSolution />
      <HowItWorks />
      <CoreFeatures />
      <DashboardShowcase />
      <StatsAndTech />
      <TestimonialsFAQ />
      <CTAAndFooter />
    </main>
  );
}
