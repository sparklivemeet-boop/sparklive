import HeroSection from "@/components/landing/HeroSection";
import ProductFeatures from "@/components/landing/ProductFeatures";
import CommunitiesSection from "@/components/landing/CommunitiesSection";
import CreatorEconomySection from "@/components/landing/CreatorEconomySection";
import WhySparkLiveSection from "@/components/landing/WhySparkLiveSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#07070d]">
      <AnimatedBackground />
      <div className="relative z-10">
        <HeroSection />
        <ProductFeatures />
        <CommunitiesSection />
        <CreatorEconomySection />
        <WhySparkLiveSection />
        <FinalCTASection />
        <Footer />
      </div>
    </main>
  );
}