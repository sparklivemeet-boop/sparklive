import HeroSection from "@/components/landing/HeroSection";
import TrustedBySection from "@/components/landing/TrustedBySection";
import ProductFeatures from "@/components/landing/ProductFeatures";
import PhoneShowcase from "@/components/landing/PhoneShowcase";
import CommunitiesSection from "@/components/landing/CommunitiesSection";
import CreatorEconomySection from "@/components/landing/CreatorEconomySection";
import WhySparkLiveSection from "@/components/landing/WhySparkLiveSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <div className="relative z-10">
        <HeroSection />
        <TrustedBySection />
        <ProductFeatures />
        <PhoneShowcase />
        <CommunitiesSection />
        <CreatorEconomySection />
        <WhySparkLiveSection />
        <TestimonialsSection />
        <FinalCTASection />
        <Footer />
      </div>
    </main>
  );
}